import { defineStore } from "pinia";

export interface VibeAxes {
  stress_level: number;
  solitude_vs_social: number;
  relax_vs_adrenaline: number;
  gastro_vs_nature: number;
  culture_vs_adventure: number;
}

export interface VibeProfile {
  axes: VibeAxes;
  vibe_summary: string;
  vibe_passport_title: string;
  extracted_tags: string[];
  transcription: string;
  vector_id: string;
  processing_time_ms: number;
}

export interface SwipeScene {
  id: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface LocationRecommendation {
  location_id: string;
  name: string;
  category: string;
  description_short: string;
  tags: string[];
  tags_match: string[];
  latitude: number;
  longitude: number;
  density_level: "red" | "yellow" | "green";
  child_friendly: boolean;
  score: number;
  reason_short: string;
  preview_image_url: string;
  splat_url: string;
}

export interface FinalizeRequest {
  limit?: number;
  child_friendly_only?: boolean;
}

interface VibeState {
  profile: VibeProfile | null;
  scenes: SwipeScene[];
  recommendations: LocationRecommendation[];
  totalFound: number;
  isCurated: boolean;
  loading: boolean;
  error: string | null;
}

export const useVibeStore = defineStore("vibe", {
  state: (): VibeState => ({
    profile: null,
    scenes: [],
    recommendations: [],
    totalFound: 0,
    isCurated: false,
    loading: false,
    error: null,
  }),

  getters: {
    hasProfile: (state): boolean => !!state.profile,
    displayAxes: (state) => {
      if (!state.profile?.axes) return [];
      const a = state.profile.axes;
      
      const normalize = (val: number | undefined) => {
        if (typeof val !== 'number') return 0.5;
        // The API returns -1.0 to 1.0, but progress bar needs 0.0 to 1.0.
        return (Math.max(-1, Math.min(1, val)) + 1) / 2;
      };

      return [
        { label: "😌 Спокойствие", opposite: "Стресс 🤯", value: a.stress_level ?? 0.5 }, // already 0 to 1
        { label: "🔇 Уединение", opposite: "Компания 🎉", value: normalize(a.solitude_vs_social) },
        { label: "🧘 Релакс", opposite: "Адреналин ⚡", value: normalize(a.relax_vs_adrenaline) },
        { label: "🍷 Гастрономия", opposite: "Природа 🌿", value: normalize(a.gastro_vs_nature) },
        { label: "🏛 Культура", opposite: "Приключения 🗺", value: normalize(a.culture_vs_adventure) },
      ];
    },
  },

  actions: {
    async voiceProfile(audioBlob: Blob) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        
        const response = await request<{ success: boolean; data: VibeProfile }>(
          "/api/v1/profile/voice",
          { method: "POST", body: formData },
        );
        
        this.profile = response.data;
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка голосового профилирования";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchScenes() {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{
          success: boolean;
          data: { count: number; scenes: SwipeScene[] };
        }>("/api/v1/profile/scenes");
        this.scenes = response.data?.scenes || [];
        return this.scenes;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки сцен";
        return [];
      } finally {
        this.loading = false;
      }
    },

    async swipeScene(sceneId: string, direction: "right" | "left") {
      try {
        const { request } = useApiClient();
        await request("/api/v1/profile/swipe", {
          method: "POST",
          body: { scene_id: sceneId, direction },
        });
        return true;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка свайпа";
        return false;
      }
    },

    async finalize(params?: FinalizeRequest) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{
          success: boolean;
          data: { recommendations: LocationRecommendation[]; total_found: number; is_curated: boolean };
        }>("/api/v1/profile/finalize", {
          method: "POST",
          body: (params || {}) as Record<string, unknown>,
        });
        this.recommendations = response.data?.recommendations || [];
        this.totalFound = response.data?.total_found || 0;
        this.isCurated = response.data?.is_curated || false;
        return this.recommendations;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка получения рекомендаций";
        return [];
      } finally {
        this.loading = false;
      }
    },

    clearProfile() {
      this.profile = null;
      this.recommendations = [];
      this.totalFound = 0;
      this.isCurated = false;
    },
  },
});
