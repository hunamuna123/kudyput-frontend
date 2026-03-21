import { defineStore } from "pinia";

export interface MapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  density_level: "red" | "yellow" | "green";
  preview_image_url: string;
}

interface MapFilters {
  min_lat?: number;
  max_lat?: number;
  min_lon?: number;
  max_lon?: number;
  category?: string;
  limit?: number;
}

interface MapState {
  points: MapPoint[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedPointId: string | null;
}

export const useMapStore = defineStore("map", {
  state: (): MapState => ({
    points: [],
    total: 0,
    loading: false,
    error: null,
    selectedPointId: null,
  }),

  getters: {
    selectedPoint: (state) => state.points.find((p) => p.id === state.selectedPointId) || null,
  },

  actions: {
    async fetchMapLocations(filters: MapFilters = {}) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{
          success: boolean;
          data: { points: MapPoint[]; total: number };
        }>("/api/v1/map/locations", {
          method: "GET",
          query: filters as Record<string, string | number | boolean | undefined>,
        });
        this.points = response.data?.points || [];
        this.total = response.data?.total || 0;
        return this.points;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки карты";
        return [];
      } finally {
        this.loading = false;
      }
    },

    selectPoint(id: string | null) {
      this.selectedPointId = id;
    },
  },
});
