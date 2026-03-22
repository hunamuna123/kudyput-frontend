import { defineStore } from "pinia";
import type { Location } from "./locations";

export interface OnboardExtractedData {
  name_suggestion: string;
  description_short: string;
  description_literary: string;
  tags: string[];
  category: string;
  price_per_night: number;
  amenities: string[];
  capacity: number;
}

export interface OnboardTaskResponse {
  success: boolean;
  data: {
    task_id: string;
    status: "queued" | "processing" | "completed" | "failed";
    progress: number;
    location_id?: string;
    extracted_data?: OnboardExtractedData;
    error?: string;
  };
}

interface SplatResponse {
  success: boolean;
  data: {
    task_id: string;
    status: string;
    progress: number;
    splat_url?: string;
    error?: string;
  };
}

interface HostLocationsResponse {
  success: boolean;
  data: Location[];
  total: number;
}

type OnboardStatus = "idle" | "recording" | "uploading" | "processing" | "completed" | "failed";
type SplatStatus = "idle" | "starting" | "processing" | "completed" | "failed";

interface OnboardingState {
  status: OnboardStatus;
  taskId: string | null;
  progress: number;
  extractedData: OnboardExtractedData | null;
  locationId: string | null;
  error: string | null;
  hostLocations: Location[];
  pollingTimer: ReturnType<typeof setInterval> | null;
  splatStatus: SplatStatus;
  splatTaskId: string | null;
  splatProgress: number;
  splatUrl: string | null;
  splatError: string | null;
  splatPollingTimer: ReturnType<typeof setInterval> | null;
}

export const useOnboardingStore = defineStore("onboarding", {
  state: (): OnboardingState => ({
    status: "idle",
    taskId: null,
    progress: 0,
    extractedData: null,
    locationId: null,
    error: null,
    hostLocations: [],
    pollingTimer: null,
    splatStatus: "idle",
    splatTaskId: null,
    splatProgress: 0,
    splatUrl: null,
    splatError: null,
    splatPollingTimer: null,
  }),

  actions: {
    reset() {
      this.stopPolling();
      this.status = "idle";
      this.taskId = null;
      this.progress = 0;
      this.extractedData = null;
      this.locationId = null;
      this.error = null;
    },

    resetSplat() {
      this.stopSplatPolling();
      this.splatStatus = "idle";
      this.splatTaskId = null;
      this.splatProgress = 0;
      this.splatUrl = null;
      this.splatError = null;
    },

    async startOnboarding(
      audioBlob: Blob,
      address?: string,
      latitude?: number,
      longitude?: number,
      mediaUrls?: string[],
    ) {
      this.status = "uploading";
      this.error = null;
      this.progress = 0;
      this.extractedData = null;
      this.locationId = null;

      try {
        const { request } = useApiClient();
        const fd = new FormData();
        fd.append("audio", audioBlob, "recording.webm");
        if (address) fd.append("address", address);
        if (latitude !== undefined) fd.append("latitude", String(latitude));
        if (longitude !== undefined) fd.append("longitude", String(longitude));
        if (mediaUrls?.length) {
          mediaUrls.forEach((url) => fd.append("media_urls", url));
        }

        const response = await request<OnboardTaskResponse>("/api/v1/host/onboard", {
          method: "POST",
          body: fd,
        });

        if (response?.data?.task_id) {
          this.taskId = response.data.task_id;
          this.status = "processing";
          this.progress = response.data.progress || 10;
          this.startPolling();
        } else if (response?.data?.status === "completed") {
          this.status = "completed";
          this.progress = 100;
          this.extractedData = response.data.extracted_data || null;
          this.locationId = response.data.location_id || null;
        } else {
          this.status = "failed";
          this.error = "Неизвестный ответ сервера";
        }
      } catch (err: unknown) {
        const apiErr = err as { message?: string; status?: number };
        this.status = "failed";
        this.error = apiErr.message || "Ошибка отправки аудио";
      }
    },

    async pollTaskStatus() {
      if (!this.taskId) return;

      try {
        const { request } = useApiClient();
        const response = await request<OnboardTaskResponse>(
          `/api/v1/host/tasks/${this.taskId}`,
        );

        const data = response.data;
        this.progress = data.progress || this.progress;

        if (data.status === "completed") {
          this.status = "completed";
          this.progress = 100;
          this.extractedData = data.extracted_data || null;
          this.locationId = data.location_id || null;
          this.stopPolling();
        } else if (data.status === "failed") {
          this.status = "failed";
          this.error = data.error || "Ошибка обработки";
          this.stopPolling();
        }
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка проверки статуса";
        this.status = "failed";
        this.stopPolling();
      }
    },

    startPolling() {
      this.stopPolling();
      this.pollingTimer = setInterval(() => {
        this.pollTaskStatus();
      }, 2000);
    },

    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },

    // ——— Splatting ———

    async startSplatting(locationId: string, videoBlob: Blob) {
      this.splatStatus = "starting";
      this.splatError = null;
      this.splatProgress = 0;
      this.splatUrl = null;

      try {
        const { request } = useApiClient();
        const fd = new FormData();
        fd.append("location_id", locationId);
        fd.append("video", videoBlob, "walkthrough.webm");

        const response = await request<SplatResponse>("/api/v1/host/splat", {
          method: "POST",
          body: fd,
        });

        if (response?.data?.task_id) {
          this.splatTaskId = response.data.task_id;
          this.splatStatus = "processing";
          this.splatProgress = response.data.progress || 5;
          this.startSplatPolling();
        } else if (response?.data?.splat_url) {
          this.splatStatus = "completed";
          this.splatProgress = 100;
          this.splatUrl = response.data.splat_url;
        } else {
          this.splatStatus = "failed";
          this.splatError = "Неизвестный ответ сервера";
        }
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.splatStatus = "failed";
        this.splatError = apiErr.message || "Ошибка запуска 3D-генерации";
      }
    },

    async pollSplatStatus() {
      if (!this.splatTaskId) return;

      try {
        const { request } = useApiClient();
        const response = await request<SplatResponse>(
          `/api/v1/host/tasks/${this.splatTaskId}`,
        );

        const data = response.data;
        this.splatProgress = data.progress || this.splatProgress;

        if (data.status === "completed") {
          this.splatStatus = "completed";
          this.splatProgress = 100;
          this.splatUrl = data.splat_url || null;
          this.stopSplatPolling();
        } else if (data.status === "failed") {
          this.splatStatus = "failed";
          this.splatError = data.error || "Ошибка генерации 3D";
          this.stopSplatPolling();
        }
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.splatError = apiErr.message || "Ошибка проверки статуса";
        this.splatStatus = "failed";
        this.stopSplatPolling();
      }
    },

    startSplatPolling() {
      this.stopSplatPolling();
      this.splatPollingTimer = setInterval(() => {
        this.pollSplatStatus();
      }, 2000);
    },

    stopSplatPolling() {
      if (this.splatPollingTimer) {
        clearInterval(this.splatPollingTimer);
        this.splatPollingTimer = null;
      }
    },

    async fetchHostLocations() {
      try {
        const { request } = useApiClient();
        const response = await request<HostLocationsResponse>("/api/v1/host/locations");
        this.hostLocations = response.data || [];
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки локаций";
      }
    },
  },
});
