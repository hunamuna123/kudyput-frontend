import { defineStore } from "pinia";

export interface Slot {
  date: string;
  available_capacity: number;
  total_capacity: number;
}

export interface Booking {
  id: string;
  user_id: string;
  location_id: string;
  location_name: string;
  location_slug?: string;
  location_preview_image_url?: string | null;
  date_from: string;
  date_to: string;
  guests_count: number;
  contact_name: string;
  contact_phone: string;
  comment?: string | null;
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed";
  host_comment?: string | null;
  total_price: number;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  created_at: string;
  updated_at?: string;
}

interface SlotsResponse {
  success: boolean;
  data: {
    location_id: string;
    month: string;
    slots: Slot[];
  };
}

interface BookingResponse {
  success: boolean;
  data: Booking;
  message?: string;
}

interface BookingsListResponse {
  success: boolean;
  count: number;
  data: Booking[];
}

interface BookingsState {
  slots: Slot[];
  myBookings: Booking[];
  hostBookings: Booking[];
  loading: boolean;
  slotsLoading: boolean;
  error: string | null;
}

export const useBookingsStore = defineStore("bookings", {
  state: (): BookingsState => ({
    slots: [],
    myBookings: [],
    hostBookings: [],
    loading: false,
    slotsLoading: false,
    error: null,
  }),

  getters: {
    pendingHostBookings: (state) =>
      state.hostBookings.filter((b) => b.status === "pending"),
    confirmedHostBookings: (state) =>
      state.hostBookings.filter((b) => b.status === "confirmed"),
  },

  actions: {
    async fetchSlots(locationId: string, month: string) {
      this.slotsLoading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<SlotsResponse>(
          `/api/v1/locations/${locationId}/slots`,
          {
            method: "GET",
            query: { month },
            skipAuth: true,
          },
        );
        this.slots = response.data?.slots || [];
        return this.slots;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки слотов";
        return [];
      } finally {
        this.slotsLoading = false;
      }
    },

    async createBooking(payload: {
      location_id: string;
      date_from: string;
      date_to: string;
      guests_count: number;
      contact_name: string;
      contact_phone: string;
    }) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<BookingResponse>("/api/v1/bookings", {
          method: "POST",
          body: payload as unknown as Record<string, unknown>,
        });
        this.myBookings.unshift(response.data);
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка создания бронирования";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchMyBookings() {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response =
          await request<BookingsListResponse>("/api/v1/bookings/my");
        this.myBookings = response.data || [];
        return this.myBookings;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки бронирований";
        return [];
      } finally {
        this.loading = false;
      }
    },

    async cancelBooking(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<BookingResponse>(
          `/api/v1/bookings/${id}/cancel`,
          { method: "POST" },
        );
        const idx = this.myBookings.findIndex((b) => b.id === id);
        if (idx !== -1) {
          this.myBookings[idx] = response.data;
        }
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка отмены бронирования";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async confirmBooking(
      id: string,
      action: "confirm" | "reject",
      hostComment?: string,
    ) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const body: Record<string, unknown> = { action };
        if (hostComment) body.host_comment = hostComment;
        const response = await request<BookingResponse>(
          `/api/v1/bookings/${id}/confirm`,
          { method: "POST", body },
        );
        const idx = this.hostBookings.findIndex((b) => b.id === id);
        if (idx !== -1) {
          this.hostBookings[idx] = response.data;
        }
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка обработки бронирования";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchHostBookings() {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response =
          await request<BookingsListResponse>("/api/v1/host/bookings");
        this.hostBookings = response.data || [];
        return this.hostBookings;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки бронирований хоста";
        return [];
      } finally {
        this.loading = false;
      }
    },
  },
});
