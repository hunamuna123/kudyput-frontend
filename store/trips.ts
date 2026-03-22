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

export interface TripRoutePoint {
  id: string;
  location_id: string;
  name: string;
  latitude: number;
  longitude: number;
  position: number;
  day_number: number;
  time_slot: string;
  target_audience: string;
  stay_duration_min: number;
  travel_time_min: number;
  travel_km: number;
  category: string;
  vibe_score: number;
}

export interface TripRoute {
  id: string;
  trip_id: string;
  name: string;
  summary: string;
  status: string;
  transport: string;
  points: TripRoutePoint[];
  points_count: number;
  days_count: number;
  total_distance_km: number;
  total_duration_min: number;
  estimated_cost_rub: number;
  created_at: string;
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
  privacy?: "public" | "invite_only";
}

interface BuildTripRouteRequest {
  location_ids?: string[];
  max_points?: number;
  optimize?: boolean;
}

interface TripsState {
  trips: Trip[];
  currentTrip: Trip | null;
  currentMembers: TripMember[];
  tripRoute: TripRoute | null;
  inviteLink: string | null;
  loading: boolean;
  routeLoading: boolean;
  error: string | null;
}

export const useTripsStore = defineStore("trips", {
  state: (): TripsState => ({
    trips: [],
    currentTrip: null,
    currentMembers: [],
    tripRoute: null,
    inviteLink: null,
    loading: false,
    routeLoading: false,
    error: null,
  }),

  actions: {
    async fetchTrips() {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: Trip[] }>("/api/v1/trips");
        this.trips = response.data || [];
        return this.trips;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки поездок";
        return [];
      } finally {
        this.loading = false;
      }
    },

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

    async updateTrip(id: string, data: Partial<Omit<Trip, 'id' | 'creator_id' | 'created_at' | 'updated_at' | 'invite_token' | 'status' | 'merged_vibe_vector_id'>>) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: Trip }>(
          `/api/v1/trips/${id}`,
          {
            method: "PUT",
            body: data as Record<string, unknown>,
          },
        );
        if (response.data) {
          this.currentTrip = response.data;
          const idx = this.trips.findIndex((t) => t.id === id);
          if (idx !== -1) this.trips[idx] = response.data;
        }
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка обновления поездки";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async buildTripRoute(tripId: string, params: BuildTripRouteRequest = {}) {
      this.routeLoading = true;
      this.error = null;
      this.tripRoute = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: TripRoute }>(
          `/api/v1/trips/${tripId}/build-route`,
          {
            method: "POST",
            body: params as Record<string, unknown>,
          },
        );
        this.tripRoute = response.data;
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка построения маршрута";
        return null;
      } finally {
        this.routeLoading = false;
      }
    },
  },
});
