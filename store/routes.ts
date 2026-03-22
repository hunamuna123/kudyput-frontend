import { defineStore } from "pinia";

export interface RoutePoint {
  location_id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  distance_km: number;
  travel_time_min: number;
  distance_from_prev_km?: number;
  duration_from_prev_min?: number;
  audio_story_url?: string;
  story_text?: string;
  category?: string;
  preview_image_url?: string;
}

export interface RoutePreview {
  id?: string;
  name?: string;
  summary?: string;
  points: RoutePoint[];
  total_distance_km: number;
  total_time_min: number;
  transport: string;
  days_count?: number;
  estimated_cost_rub?: number;
  status?: string;
  trip_id?: string;
  points_count?: number;
  created_at?: string;
}

interface RebuildOverridePoint {
  latitude: number;
  longitude: number;
  name?: string;
}

interface RoutesState {
  currentRoute: RoutePreview | null;
  routeGeometry: [number, number][];
  loading: boolean;
  rebuilding: boolean;
  error: string | null;
}

// Decode Google-style encoded polyline (used by OSRM)
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

// Downsample a polyline to at most maxPoints for performance
function downsamplePolyline(points: [number, number][], maxPoints: number): [number, number][] {
  if (points.length <= maxPoints) return points;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const result: [number, number][] = [first];
  const step = (points.length - 1) / (maxPoints - 1);
  for (let i = 1; i < maxPoints - 1; i++) {
    const pt = points[Math.round(i * step)];
    if (pt) result.push(pt);
  }
  result.push(last);
  return result;
}

const OSRM_PROFILES: Record<string, string> = {
  car: "driving",
  walk: "foot",
  bike: "cycling",
  public: "driving",
};

export const useRoutesStore = defineStore("routes", {
  state: (): RoutesState => ({
    currentRoute: null,
    routeGeometry: [],
    loading: false,
    rebuilding: false,
    error: null,
  }),

  actions: {
    async fetchRoadRoute(
      locations: { latitude: number; longitude: number; name?: string; id?: string }[],
      transport = "car",
    ) {
      if (locations.length < 2) return null;
      this.loading = true;
      this.error = null;

      const profile = OSRM_PROFILES[transport] || "driving";
      const coords = locations.map((l) => `${l.longitude},${l.latitude}`).join(";");
      const url = `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=polyline&steps=false`;

      try {
        const response = await $fetch<{
          code: string;
          routes: {
            geometry: string;
            distance: number;
            duration: number;
            legs: { distance: number; duration: number }[];
          }[];
        }>(url);

        if (response.code !== "Ok" || !response.routes?.length) {
          throw new Error("OSRM returned no route");
        }

        const osrmRoute = response.routes[0];
        if (!osrmRoute) {
          throw new Error("OSRM returned empty route");
        }
        const fullGeometry = decodePolyline(osrmRoute.geometry);

        // Downsample to ~350 points for rendering performance
        this.routeGeometry = downsamplePolyline(fullGeometry, 350);

        // Build route preview from legs
        const routePoints: RoutePoint[] = locations.map((loc, idx) => ({
          location_id: loc.id || `point_${idx}`,
          name: loc.name || `Точка ${idx + 1}`,
          latitude: loc.latitude,
          longitude: loc.longitude,
          order: idx,
          distance_km: idx === 0 ? 0 : (osrmRoute.legs[idx - 1]?.distance || 0) / 1000,
          travel_time_min: idx === 0 ? 0 : (osrmRoute.legs[idx - 1]?.duration || 0) / 60,
        }));

        // Preserve existing route ID (from backend buildRoute call) 
        const existingId = this.currentRoute?.id;
        this.currentRoute = {
          id: existingId,
          points: routePoints,
          total_distance_km: osrmRoute.distance / 1000,
          total_time_min: osrmRoute.duration / 60,
          transport,
        };

        return this.currentRoute;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка построения маршрута OSRM";
        return null;
      } finally {
        this.loading = false;
      }
    },

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
        // For backend routes, build simple geometry from points
        if (response.data?.points) {
          this.routeGeometry = response.data.points.map((p) => [p.latitude, p.longitude] as [number, number]);
        }
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка построения маршрута";
        return null;
      } finally {
        this.loading = false;
      }
    },

    async rebuildRoute(routeId: string, overridePoints?: RebuildOverridePoint[]) {
      this.rebuilding = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const body: Record<string, unknown> = {};
        if (overridePoints?.length) {
          body.override_points = overridePoints;
        }
        const response = await request<{ success: boolean; data: RoutePreview }>(
          `/api/v1/route/${routeId}/rebuild`,
          { method: "POST", body },
        );
        this.currentRoute = response.data;
        if (response.data?.points) {
          this.routeGeometry = response.data.points.map(
            (p) => [p.latitude, p.longitude] as [number, number],
          );
        }
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка перестройки маршрута";
        return null;
      } finally {
        this.rebuilding = false;
      }
    },

    /**
     * Build a finalized route via the trip-aware endpoint.
     * This saves the route in DB and returns a real UUID needed for
     * generate-stories, rebuild, offline-bundle, etc.
     *
     * After a successful build, automatically triggers POST generate-stories
     * to start TTS generation in the background (backend returns 202 Accepted).
     */
    async buildFinalRoute(
      tripId: string,
      params: { location_ids?: string[]; max_points?: number; optimize?: boolean } = {},
    ) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{
          success: boolean;
          data: {
            id: string;
            trip_id: string;
            name: string;
            summary: string;
            status: string;
            transport: string;
            points: RoutePoint[];
            points_count: number;
            days_count: number;
            total_distance_km: number;
            total_duration_min: number;
            estimated_cost_rub: number;
          };
        }>(`/api/v1/trips/${tripId}/build-route`, {
          method: "POST",
          body: params as Record<string, unknown>,
        });

        const data = response.data;
        // Update currentRoute with the backend-saved route (has real ID)
        this.currentRoute = {
          id: data.id,
          name: data.name,
          summary: data.summary,
          points: data.points || [],
          total_distance_km: data.total_distance_km,
          total_time_min: data.total_duration_min,
          transport: data.transport,
          days_count: data.days_count,
          estimated_cost_rub: data.estimated_cost_rub,
          status: data.status,
          trip_id: data.trip_id,
          points_count: data.points_count,
        };

        if (data.points?.length) {
          this.routeGeometry = data.points.map(
            (p) => [p.latitude, p.longitude] as [number, number],
          );
        }

        // Automatically trigger story generation (fire-and-forget).
        // Backend returns 202 Accepted and processes TTS in background.
        if (data.id) {
          request<{ success: boolean }>(`/api/v1/route/${data.id}/generate-stories`, {
            method: "POST",
          }).catch(() => {
            // Story generation failure is non-blocking — user can retry via StoryPlayer
          });
        }

        return data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка финализации маршрута";
        return null;
      } finally {
        this.loading = false;
      }
    },

    clearRoute() {
      this.currentRoute = null;
      this.routeGeometry = [];
      this.error = null;
    },
  },
});
