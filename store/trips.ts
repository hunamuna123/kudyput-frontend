import { defineStore } from "pinia";

export interface Trip {
  id: string;
  creator_id: string;
  date_from: string;
  date_to: string;
  budget_rub: number;
  budget_tier: "economy" | "comfort" | "premium";
  transport: "car" | "public" | "walk" | "bike";
  group_size: number;
  group_composition: Record<string, unknown>;
  status: "planning" | "active" | "completed" | "cancelled";
  invite_token: string;
  merged_vibe_vector_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string | null;
  display_name: string;
  role: "creator" | "member";
  is_child: boolean;
  tags: string[];
  vibe_vector_id: string | null;
  joined_at: string;
}

interface GroupComposition {
  adults: number;
  children: { age: number }[];
}

interface CreateTripRequest {
  date_from: string;
  date_to: string;
  budget_rub?: number;
  budget_tier?: string;
  transport?: string;
  group_size?: number;
  group_composition?: GroupComposition;
}

interface TripsState {
  trips: Trip[];
  currentTrip: Trip | null;
  currentMembers: TripMember[];
  inviteLink: string | null;
  loading: boolean;
  error: string | null;
}

export const useTripsStore = defineStore("trips", {
  state: (): TripsState => ({
    trips: [],
    currentTrip: null,
    currentMembers: [],
    inviteLink: null,
    loading: false,
    error: null,
  }),

  actions: {
    async createTrip(data: CreateTripRequest) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: Trip }>("/api/v1/trips", {
          method: "POST",
          body: data as unknown as Record<string, unknown>,
        });
        if (response.data) {
          this.trips.unshift(response.data);
        }
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка создания поездки";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchTrip(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: Trip }>(`/api/v1/trips/${id}`);
        this.currentTrip = response.data;
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Поездка не найдена";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchTripMembers(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: TripMember[] }>(`/api/v1/trips/${id}/members`);
        this.currentMembers = response.data || [];
        return this.currentMembers;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки участников";
        return [];
      } finally {
        this.loading = false;
      }
    },

    async generateInvite(tripId: string) {
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: { invite_token: string; invite_url: string } }>(
          `/api/v1/trips/${tripId}/invite`,
          { method: "POST" },
        );
        this.inviteLink = response.data?.invite_url || `${window.location.origin}/trip/${tripId}/join?token=${response.data?.invite_token}`;
        if (this.currentTrip && this.currentTrip.id === tripId) {
          this.currentTrip.invite_token = response.data?.invite_token || this.currentTrip.invite_token;
        }
        return this.inviteLink;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка генерации приглашения";
        return null;
      }
    },
  },
});
