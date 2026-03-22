import { defineStore } from "pinia";

export interface WeatherPoint {
  point: string;
  condition: string;
  temp: number;
  wind_speed: number;
  severity: "normal" | "warning" | "danger";
  needs_rebuild: boolean;
}

interface WeatherState {
  weatherPoints: WeatherPoint[];
  loading: boolean;
  error: string | null;
}

export const useWeatherStore = defineStore("weather", {
  state: (): WeatherState => ({
    weatherPoints: [],
    loading: false,
    error: null,
  }),

  getters: {
    hasWarnings: (state): boolean =>
      state.weatherPoints.some((p) => p.severity !== "normal"),

    needsRebuild: (state): boolean =>
      state.weatherPoints.some((p) => p.needs_rebuild),

    warningPoints: (state): WeatherPoint[] =>
      state.weatherPoints.filter((p) => p.severity !== "normal"),
  },

  actions: {
    async fetchRegionWeather() {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: WeatherPoint[] }>(
          "/api/v1/weather/region",
        );
        this.weatherPoints = response.data || [];
        return this.weatherPoints;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки погоды";
        return [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Handle real-time weather event from WebSocket (/ws/v1/weather).
     * Updates or adds weather data for the received point.
     */
    handleWeatherEvent(data: Record<string, unknown>) {
      const point = data as unknown as WeatherPoint;
      if (!point.point) return;

      const idx = this.weatherPoints.findIndex((p) => p.point === point.point);
      if (idx >= 0) {
        this.weatherPoints[idx] = point;
      } else {
        this.weatherPoints.push(point);
      }
    },
  },
});
