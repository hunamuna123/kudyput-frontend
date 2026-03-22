<script setup lang="ts">
import { MapPin, Filter, Loader2, AlertCircle, ExternalLink, Sparkles, Navigation, X, Clock, Ruler, Headphones } from "lucide-vue-next";
import { useMapStore } from "~~/store/map";
import { useVibeStore } from "~~/store/vibe";
import { useAuthStore } from "~~/store/auth";
import { useRoutesStore } from "~~/store/routes";
import { useWeatherStore } from "~~/store/weather";
import { useTripsStore } from "~~/store/trips";
import Map3D from "~~/app/components/map/Map3D.vue";
import WeatherBanner from "~~/app/components/modules/WeatherBanner.vue";

useHead({
  title: "Карта — КудыТуды",
  meta: [
    { name: "description", content: "Интерактивная карта скрытых мест Краснодарского края. Винодельни, фермы, горные тропы и камерные локации." },
  ],
});

const mapStore = useMapStore();
const vibeStore = useVibeStore();
const authStore = useAuthStore();
const routesStore = useRoutesStore();
const weatherStore = useWeatherStore();
const tripsStore = useTripsStore();
const categoryFilter = ref("");
const showFilters = ref(false);
const showRouteBuilder = ref(false);
const mapMode = ref<"ai" | "all">("all");
const demoMode = ref(false);
const demoProfile = ref("calm_wine_mountains");
const routeTransport = ref("car");
const routeLocationIds = ref<string[]>([]);

const routeTransportOptions = [
  { label: "🚗", value: "car" },
  { label: "🚌", value: "public" },
  { label: "🚶", value: "walk" },
  { label: "🚴", value: "bike" },
];

// Use the latest trip as context for trip-aware route building
const activeTripId = computed(() => tripsStore.trips[0]?.id || null);

function addToRoute(id: string) {
  if (!routeLocationIds.value.includes(id)) {
    routeLocationIds.value.push(id);
    if (!showRouteBuilder.value) showRouteBuilder.value = true;
  }
}

function removeFromRoute(id: string) {
  routeLocationIds.value = routeLocationIds.value.filter((lid) => lid !== id);
}

function getPointName(id: string): string {
  return mapStore.points.find((p) => p.id === id)?.name || id.slice(0, 8);
}

async function handleBuildRoute() {
  if (routeLocationIds.value.length < 2) return;

  const locations = routeLocationIds.value
    .map((id) => {
      const point = mapStore.points.find((p) => p.id === id);
      if (!point) return null;
      return { id: point.id, name: point.name, latitude: point.latitude, longitude: point.longitude };
    })
    .filter(Boolean) as { id: string; name: string; latitude: number; longitude: number }[];

  if (locations.length < 2) return;

  // Build finalized route via trip endpoint (saves to DB, returns real ID for audio guide)
  if (activeTripId.value) {
    const finalResult = await routesStore.buildFinalRoute(activeTripId.value, {
      location_ids: routeLocationIds.value,
    });
    // Also fetch OSRM geometry for proper road lines on the map
    await routesStore.fetchRoadRoute(locations, routeTransport.value);
    // Preserve the backend route ID after OSRM overwrites currentRoute
    if (finalResult?.id && routesStore.currentRoute) {
      routesStore.currentRoute.id = finalResult.id;
    }
  } else {
    // No trip context — build preview via /route/build + OSRM
    let backendResult: { id?: string } | null = null;
    try {
      backendResult = await routesStore.buildRoute(routeLocationIds.value, routeTransport.value);
    } catch {
      // Backend unavailable — continue with OSRM only
    }
    await routesStore.fetchRoadRoute(locations, routeTransport.value);
    if (backendResult?.id && routesStore.currentRoute) {
      routesStore.currentRoute.id = backendResult.id;
    }
  }
}

async function handleWeatherRebuild() {
  if (!routesStore.currentRoute) return;
  const routeId = routesStore.currentRoute.id;
  if (routeId) {
    await routesStore.rebuildRoute(routeId);
  } else {
    await handleBuildRoute();
  }
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}

function formatDur(min: number): string {
  if (min < 60) return `${Math.round(min)} мин`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}ч ${m}м`;
}

const demoProfiles = [
  { label: "🍷 Спокойный", value: "calm_wine_mountains" },
  { label: "🧗 Активный", value: "active_adventure" },
  { label: "👨‍👩‍👧 Семья", value: "family_kids" },
  { label: "🍽 Гастро-тур", value: "gastro_cultural" },
];

const categoryOptions = [
  { label: "Все", value: "" },
  { label: "🍷 Винодельня", value: "winery" },
  { label: "🐐 Ферма", value: "farm" },
  { label: "🥾 Тропа", value: "trail" },
  { label: "🍽 Гастро", value: "gastro" },
  { label: "🌿 Природа", value: "nature" },
  { label: "🏕 Кемпинг", value: "camping" },
  { label: "🏖 Курорт", value: "resort" },
  { label: "⚡ Экстрим", value: "extreme" },
  { label: "🏛 Культура", value: "cultural" },
  { label: "🌊 Пляж", value: "beach" },
];

const densityColors: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#f97316",
};

const densityLabels: Record<string, string> = {
  green: "Спокойно",
  yellow: "Средне",
  red: "🔥 Популярно",
};

const userKarma = computed(() => authStore.user?.karma ?? 0);
const canSeeHiddenGems = computed(() => userKarma.value >= 50);

const visiblePoints = computed(() => {
  return mapStore.points.map((p) => {
    const isHidden = (p as unknown as Record<string, unknown>).access_level === 'hidden';
    return {
      ...p,
      isHiddenGem: isHidden,
      isLocked: isHidden && !canSeeHiddenGems.value,
    };
  });
});

const hasVibeProfile = computed(() => vibeStore.hasProfile || !!authStore.user?.vibe_vector_id);

async function loadLocations() {
  const filters: Record<string, string | number | boolean | undefined> = {};
  if (categoryFilter.value) filters.category = categoryFilter.value;
  if (demoMode.value) {
    filters.demo = true;
    filters.profile = demoProfile.value;
  }
  filters.min_lat = 43.5;
  filters.max_lat = 45.5;
  filters.min_lon = 36.5;
  filters.max_lon = 41.0;
  filters.limit = 100;
  await mapStore.fetchMapLocations(filters);
}

function selectPoint(id: string | null) {
  if (id === null) {
    mapStore.selectPoint(null);
    return;
  }
  mapStore.selectPoint(mapStore.selectedPointId === id ? null : id);
}

watch([categoryFilter, demoMode, demoProfile], () => {
  loadLocations();
});

onMounted(async () => {
  authStore.restoreSession();
  await loadLocations();
  // Load trips for trip-aware route building
  tripsStore.fetchTrips();

  // Connect weather WebSocket for real-time weather updates
  const ws = useWebSocket();
  ws.connect("weather");
  ws.on("weather_alert", (event) => {
    weatherStore.handleWeatherEvent(event.data);
  });
});
</script>


<template>
  <div class="min-h-screen bg-white relative overflow-hidden">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/8 top-[-100px] left-[10%] blur-[120px] pointer-events-none"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 bottom-[-80px] right-[5%] blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 mx-auto px-5 pt-6 pb-12 max-w-wide">

      <div class="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 class="font-heading text-primary mb-1 text-heading-page">
            Интерактивная <span class="text-accent">карта</span>
          </h1>
          <p class="font-body font-light text-primary-light text-base">
            Исследуйте скрытые места Краснодарского края
          </p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="hasVibeProfile"
            class="flex items-center gap-1.5 font-body text-base px-4 py-2 rounded-2xl border cursor-pointer transition-all duration-200"
            :class="mapMode === 'ai' ? 'bg-accent/15 border-accent/30 text-accent-dark font-bold' : 'bg-white/35 border-white/50 text-primary-light hover:border-accent/30'"
            @click="mapMode = mapMode === 'ai' ? 'all' : 'ai'"
          >
            <Sparkles class="w-4 h-4" />
            ИИ подобрал
          </button>
          <button
            class="flex items-center gap-1.5 font-body text-base px-4 py-2 rounded-2xl border cursor-pointer transition-all duration-200"
            :class="demoMode ? 'bg-accent/15 border-accent/30 text-accent-dark font-bold' : 'bg-white/35 border-white/50 text-primary-light hover:border-accent/30'"
            @click="demoMode = !demoMode"
          >
            <Sparkles class="w-4 h-4" />
            Демо режим
          </button>
          <button
            class="flex items-center gap-1.5 font-body text-base px-4 py-2 rounded-2xl border cursor-pointer transition-all duration-200"
            :class="showFilters ? 'bg-accent/15 border-accent/30 text-accent-dark' : 'bg-white/35 border-white/50 text-primary-light hover:border-accent/30'"
            @click="showFilters = !showFilters"
          >
            <Filter class="w-4 h-4" />
            Фильтры
          </button>
        </div>
      </div>

      <Transition name="slide">
        <div v-if="demoMode" class="flex flex-wrap gap-1.5 mb-2">
          <button
            v-for="profile in demoProfiles"
            :key="profile.value"
            class="font-body text-sm px-3.5 py-2 rounded-full border cursor-pointer transition-all duration-200"
            :class="demoProfile === profile.value
              ? 'bg-accent/20 border-accent/40 text-accent-dark font-bold'
              : 'bg-white/35 border-white/50 text-primary-light hover:border-accent/30'"
            @click="demoProfile = profile.value"
          >
            {{ profile.label }}
          </button>
        </div>
      </Transition>

      <Transition name="slide">
        <div v-if="showFilters" class="flex flex-wrap gap-1.5 mb-4">
          <button
            v-for="cat in categoryOptions"
            :key="cat.value"
            class="font-body text-sm px-3.5 py-2 rounded-full border cursor-pointer transition-all duration-200"
            :class="categoryFilter === cat.value
              ? 'bg-accent/20 border-accent/40 text-accent-dark font-bold'
              : 'bg-white/35 border-white/50 text-primary-light hover:border-accent/30'"
            @click="categoryFilter = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>
      </Transition>

      <WeatherBanner @rebuild="handleWeatherRebuild" />

      <div class="flex items-center gap-4 mb-5">
        <span class="font-body text-base text-primary-light">
          {{ mapStore.total }} {{ mapStore.total === 1 ? 'локация' : 'локаций' }}
        </span>
        <div class="flex gap-3">
          <span v-for="(color, level) in densityColors" :key="level" class="flex items-center gap-1 font-body text-sm text-primary-light">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: color }"></span>
            {{ densityLabels[level] }}
          </span>
          <span class="flex items-center gap-1 font-body text-sm text-primary-light">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300/50"></span>
            Hidden Gem
          </span>
        </div>
      </div>

      <div v-if="mapStore.loading" class="flex justify-center py-20">
        <Loader2 class="w-8 h-8 text-accent-dark animate-spin" />
      </div>

      <UiAlert v-else-if="mapStore.error" variant="destructive" class="rounded-2xl mb-4">
        <AlertCircle class="h-4 w-4" />
        <UiAlertDescription>{{ mapStore.error }}</UiAlertDescription>
      </UiAlert>

      <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        <div class="relative bg-white/35 border border-white/50 rounded-3xl overflow-hidden min-h-[500px]">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/5 cursor-grab active:cursor-grabbing">
            <Map3D 
              :points="mapStore.points" 
              :selected-id="mapStore.selectedPointId" 
              :route-points="routesStore.currentRoute?.points"
              :route-geometry="routesStore.routeGeometry"
              @select="selectPoint" 
            />
          </div>

          <div v-if="mapStore.points.length === 0" class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <MapPin class="w-10 h-10 text-primary-light opacity-30 mx-auto mb-2" />
              <p class="font-body text-base text-primary-light">Нет локаций по фильтру</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 max-h-[520px] max-lg:max-h-[400px] overflow-y-auto pr-1">

          <button
            class="flex items-center justify-center gap-1.5 font-body font-bold text-base px-4 py-2.5 rounded-2xl border cursor-pointer transition-all duration-200 shrink-0"
            :class="showRouteBuilder ? 'bg-accent/15 border-accent/30 text-accent-dark' : 'bg-white/35 border-white/50 text-primary-light hover:border-accent/30'"
            @click="showRouteBuilder = !showRouteBuilder"
          >
            <Navigation class="w-4 h-4" />
            Маршрут
            <span v-if="routeLocationIds.length > 0" class="bg-accent text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{{ routeLocationIds.length }}</span>
          </button>

          <Transition name="slide">
            <div v-if="showRouteBuilder" class="bg-white/60 backdrop-blur-md border border-accent/30 rounded-2xl p-3 flex flex-col gap-2.5">
              <div v-if="routeLocationIds.length > 0" class="flex flex-col gap-1">
                <div
                  v-for="(id, idx) in routeLocationIds"
                  :key="id"
                  class="flex items-center gap-2 px-2.5 py-1.5 bg-white/80 border border-accent/20 rounded-xl group"
                >
                  <span class="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-xs font-black shrink-0">{{ idx + 1 }}</span>
                  <span class="font-body text-sm font-medium text-primary flex-1 truncate">{{ getPointName(id) }}</span>
                  <button class="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all cursor-pointer bg-transparent border-none p-0.5" @click="removeFromRoute(id)">
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p v-else class="font-body text-sm text-primary-light text-center py-1">Нажмите + рядом с локацией</p>

              <div class="flex gap-1">
                <button
                  v-for="opt in routeTransportOptions"
                  :key="opt.value"
                  class="flex-1 font-body text-base py-1.5 rounded-lg border cursor-pointer transition-all"
                  :class="routeTransport === opt.value ? 'bg-accent/20 border-accent/40 font-bold' : 'bg-white/50 border-white/50 hover:border-accent/20'"
                  @click="routeTransport = opt.value"
                >{{ opt.label }}</button>
              </div>

              <button
                :disabled="routeLocationIds.length < 2 || routesStore.loading"
                class="flex items-center justify-center gap-1.5 font-body font-bold text-base bg-accent hover:bg-accent-dark text-white border-none rounded-xl px-4 py-2.5 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                @click="handleBuildRoute"
              >
                <Loader2 v-if="routesStore.loading" class="w-4 h-4 animate-spin" />
                <Navigation v-else class="w-4 h-4" />
                Построить маршрут
              </button>

              <div v-if="routesStore.currentRoute" class="flex flex-col gap-2 mt-1">
                <div class="flex gap-2">
                  <div class="flex-1 flex items-center justify-center gap-1 bg-white/70 border border-accent/20 rounded-lg py-1.5">
                    <Ruler class="w-3 h-3 text-accent-dark" />
                    <span class="font-body font-bold text-sm text-primary">{{ formatDist(routesStore.currentRoute.total_distance_km) }}</span>
                  </div>
                  <div class="flex-1 flex items-center justify-center gap-1 bg-white/70 border border-primary/10 rounded-lg py-1.5">
                    <Clock class="w-3 h-3 text-primary" />
                    <span class="font-body font-bold text-sm text-primary">{{ formatDur(routesStore.currentRoute.total_time_min) }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-0.5">
                  <div v-for="(point, idx) in routesStore.currentRoute.points" :key="point.location_id" class="flex items-center gap-2 px-2 py-1">
                    <span class="w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-2xs font-black shrink-0">{{ idx + 1 }}</span>
                    <span class="font-body text-sm text-primary truncate flex-1">{{ point.name }}</span>
                    <span v-if="point.distance_km > 0" class="font-body text-xs text-primary-light">{{ formatDist(point.distance_km) }}</span>
                  </div>
                </div>

                <!-- Audio guide link -->
                <NuxtLink
                  v-if="routesStore.currentRoute?.id"
                  :to="`/route/${routesStore.currentRoute.id}`"
                  class="flex items-center justify-center gap-1.5 font-body font-bold text-sm text-accent-dark bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-xl px-3 py-2 no-underline transition-all mt-1 cursor-pointer"
                >
                  <Headphones class="w-3.5 h-3.5" />
                  Аудиогид маршрута 🎙
                </NuxtLink>
                <NuxtLink
                  v-else
                  to="/route"
                  class="flex items-center justify-center gap-1.5 font-body font-bold text-sm text-accent-dark bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-xl px-3 py-2 no-underline transition-all mt-1 cursor-pointer"
                >
                  <Headphones class="w-3.5 h-3.5" />
                  Подробнее о маршруте
                </NuxtLink>
              </div>
            </div>
          </Transition>

          <div
            v-for="point in visiblePoints"
            :key="point.id"
            class="flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden"
            :class="[
              mapStore.selectedPointId === point.id
                ? 'bg-accent/10 border-accent/30'
                : point.isHiddenGem && !point.isLocked
                  ? 'bg-emerald-50/60 border-emerald-300/40 hover:border-emerald-400/60'
                  : point.isLocked
                    ? 'bg-primary/3 border-primary/10 opacity-60'
                    : 'bg-white/35 border-white/50 hover:border-accent/20',
            ]"
            @click="point.isLocked ? null : selectPoint(point.id)"
          >
            <div v-if="point.isHiddenGem && !point.isLocked" class="absolute -right-4 -top-4 w-14 h-14 bg-emerald-400/10 rounded-full blur-xl pointer-events-none"></div>
            <span v-if="point.isLocked" class="text-lg shrink-0">🔒</span>
            <span v-else-if="point.isHiddenGem" class="text-lg shrink-0 animate-pulse">🗝</span>
            <span
              v-else
              class="w-3 h-3 rounded-full shrink-0"
              :style="{ backgroundColor: densityColors[point.density_level] || '#A4BE4F' }"
            ></span>
            <div class="flex-1 min-w-0">
              <p class="font-body font-bold text-base text-primary truncate">
                {{ point.isLocked ? 'Секретная локация' : point.name }}
              </p>
              <p class="font-body text-sm text-primary-light capitalize">{{ point.isLocked ? 'Наберите 50 кармы' : point.category }}</p>
            </div>
            <template v-if="!point.isLocked">
              <button
                class="w-7 h-7 flex items-center justify-center rounded-full border cursor-pointer transition-all shrink-0"
                :class="routeLocationIds.includes(point.id)
                  ? 'bg-accent border-accent text-white'
                  : 'bg-white/50 border-primary/10 text-primary-light hover:border-accent/40 hover:text-accent-dark'"
                @click.stop="routeLocationIds.includes(point.id) ? removeFromRoute(point.id) : addToRoute(point.id)"
              >
                <Navigation v-if="routeLocationIds.includes(point.id)" class="w-3 h-3" />
                <span v-else class="text-sm font-bold leading-none">+</span>
              </button>
              <NuxtLink
                :to="`/location/${point.id}`"
                class="text-accent-dark hover:text-accent transition-colors shrink-0"
                @click.stop
              >
                <ExternalLink class="w-4 h-4" />
              </NuxtLink>
            </template>
          </div>

          <div v-if="mapStore.points.length === 0 && !mapStore.loading" class="py-8 text-center">
            <p class="font-body text-base text-primary-light">Нет точек</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
