import { defineStore } from "pinia";

export interface RoutePoint {
  location_id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  distance_km: number;
  travel_time_min: number;
}

export interface RoutePreview {
  points: RoutePoint[];
  total_distance_km: number;
  total_time_min: number;
  transport: string;
}

interface RoutesState {
  currentRoute: RoutePreview | null;
  loading: boolean;
  error: string | null;
}

export const useRoutesStore = defineStore("routes", {
  state: (): RoutesState => ({
    currentRoute: null,
    loading: false,
    error: null,
  }),

  actions: {
    async buildRoute(locationIds: string[], transport = "car", optimize = false) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: RoutePreview }>(
          "/api/v1/route/build",
          {
            method: "POST",
            body: { location_ids: locationIds, transport, optimize },
          },
        );
        this.currentRoute = response.data;
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка построения маршрута";
        return null;
      } finally {
        this.loading = false;
      }
    },

    clearRoute() {
      this.currentRoute = null;
      this.error = null;
    },
  },
});
