import { defineStore } from "pinia";

export interface Location {
  id: string;
  name: string;
  slug: string;
  category: string;
  description_short: string;
  description_full: string;
  address: string;
  latitude: number;
  longitude: number;
  tags: string[];
  access_level: "open" | "semi_open" | "hidden";
  density_level: "red" | "yellow" | "green";
  child_friendly: boolean;
  capacity: number;
  price_per_night: number;
  is_published: boolean;
  owner_id: string;
  splat_url: string | null;
  vibe_vector_id: string | null;
  created_at: string;
  updated_at: string;
}

interface LocationFilters {
  lat?: number;
  lon?: number;
  radius_km?: number;
  min_lat?: number;
  max_lat?: number;
  min_lon?: number;
  max_lon?: number;
  category?: string;
  child_friendly?: boolean;
  density_level?: string;
  page?: number;
  per_page?: number;
}

interface LocationListResponse {
  success: boolean;
  data: {
    locations: Location[];
    page: number;
    per_page: number;
    total: number;
  };
}

interface LocationSingleResponse {
  success: boolean;
  data: Location;
  message?: string;
}

interface LocationsState {
  locations: Location[];
  currentLocation: Location | null;
  page: number;
  perPage: number;
  total: number;
  loading: boolean;
  error: string | null;
}

export const useLocationsStore = defineStore("locations", {
  state: (): LocationsState => ({
    locations: [],
    currentLocation: null,
    page: 1,
    perPage: 20,
    total: 0,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchLocations(filters: LocationFilters = {}) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<LocationListResponse>("/api/v1/locations", {
          method: "GET",
          query: {
            page: filters.page || this.page,
            per_page: filters.per_page || this.perPage,
            category: filters.category,
            density_level: filters.density_level,
            child_friendly: filters.child_friendly,
            lat: filters.lat,
            lon: filters.lon,
            radius_km: filters.radius_km,
            min_lat: filters.min_lat,
            max_lat: filters.max_lat,
            min_lon: filters.min_lon,
            max_lon: filters.max_lon,
          } as Record<string, string | number | boolean | undefined>,
        });
        this.locations = response.data.locations || [];
        this.page = response.data.page;
        this.perPage = response.data.per_page;
        this.total = response.data.total;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки локаций";
      } finally {
        this.loading = false;
      }
    },

    async fetchLocationById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<LocationSingleResponse>(`/api/v1/locations/${id}`);
        this.currentLocation = response.data;
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Локация не найдена";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createLocation(data: Partial<Location>) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<LocationSingleResponse>("/api/v1/locations", {
          method: "POST",
          body: data as Record<string, unknown>,
        });
        this.locations.unshift(response.data);
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка создания локации";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateLocation(id: string, data: Partial<Location>) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<LocationSingleResponse>(`/api/v1/locations/${id}`, {
          method: "PUT",
          body: data as Record<string, unknown>,
        });
        const index = this.locations.findIndex((l) => l.id === id);
        if (index !== -1) {
          this.locations[index] = response.data;
        }
        if (this.currentLocation?.id === id) {
          this.currentLocation = response.data;
        }
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка обновления локации";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteLocation(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        await request(`/api/v1/locations/${id}`, { method: "DELETE" });
        this.locations = this.locations.filter((l) => l.id !== id);
        if (this.currentLocation?.id === id) {
          this.currentLocation = null;
        }
        return true;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка удаления локации";
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
