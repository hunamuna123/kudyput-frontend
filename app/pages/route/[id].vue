<script setup lang="ts">
import { Navigation, MapPin, Clock, Ruler, ArrowLeft, Loader2, AlertCircle, Plus, X, Sparkles, AlertTriangle, RefreshCw, Download, Check } from "lucide-vue-next";
import { useRoutesStore } from "~~/store/routes";
import { useLocationsStore } from "~~/store/locations";
import { useAuthStore } from "~~/store/auth";
import { useWeatherStore } from "~~/store/weather";
import StoryPlayer from "~~/app/components/modules/StoryPlayer.vue";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Маршрут - КудыТуды",
});

const routesStore = useRoutesStore();
const locationsStore = useLocationsStore();
const authStore = useAuthStore();
const weatherStore = useWeatherStore();

const route = useRoute();
const routeId = computed(() => route.params.id as string);
const effectiveRouteId = computed(() => {
  // Prefer the backend route ID from store (real UUID)
  const storeId = routesStore.currentRoute?.id;
  if (storeId) return storeId;
  // Use URL param only if it looks like a UUID
  const urlId = routeId.value;
  if (urlId && /^[0-9a-f]{8}-/.test(urlId)) return urlId;
  return null;
});

const transport = ref("car");
const selectedLocationIds = ref<string[]>([]);
const searchQuery = ref("");

const transportOptions = [
  { label: "🚗 Авто", value: "car" },
  { label: "🚌 Общественный", value: "public" },
  { label: "🚶 Пешком", value: "walk" },
  { label: "🚴 Велосипед", value: "bike" },
];

const filteredLocations = computed(() => {
  if (!searchQuery.value) return locationsStore.locations.slice(0, 10);
  const q = searchQuery.value.toLowerCase();
  return locationsStore.locations.filter((l) =>
    l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q),
  ).slice(0, 10);
});

function addLocation(id: string) {
  if (!selectedLocationIds.value.includes(id)) {
    selectedLocationIds.value.push(id);
  }
}

function removeLocation(id: string) {
  selectedLocationIds.value = selectedLocationIds.value.filter((lid) => lid !== id);
}

function getLocationName(id: string): string {
  return locationsStore.locations.find((l) => l.id === id)?.name || id.slice(0, 8);
}

async function handleBuild() {
  if (selectedLocationIds.value.length < 2) return;
  const result = await routesStore.buildRoute(selectedLocationIds.value, transport.value);
  // If backend returned a route with ID, navigate to the real route page
  if (result?.id && result.id !== routeId.value) {
    navigateTo(`/route/${result.id}`, { replace: true });
  }
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}

function formatTime(min: number): string {
  if (min < 60) return `${Math.round(min)} мин`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h} ч ${m} мин`;
}

// Offline download
const downloading = ref(false);
const downloaded = ref(false);

async function handleDownloadOffline() {
  if (!routeId.value) return;
  downloading.value = true;
  const { downloadRouteBundle } = useOffline();
  const ok = await downloadRouteBundle(routeId.value);
  downloading.value = false;
  if (ok) {
    downloaded.value = true;
    setTimeout(() => downloaded.value = false, 3000);
  }
}

onMounted(async () => {
  authStore.restoreSession();
  if (locationsStore.locations.length === 0) {
    await locationsStore.fetchLocations();
  }
  weatherStore.fetchRegionWeather();
});
</script>

<template>
  <div class="w-full max-w-5xl mx-auto">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/map" class="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/50 hover:bg-white/80 border border-accent/30 rounded-full text-primary transition-all shadow-sm">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <h1 class="font-heading text-3xl sm:text-4xl font-black uppercase text-primary tracking-tighter leading-none">
        Маршрут
      </h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="flex flex-col gap-4">
        <div class="bg-gradient-to-b from-white/70 to-white/30 backdrop-blur-md border border-accent/30 shadow-sm rounded-[2rem] p-5">
          <h3 class="font-heading text-lg font-bold text-primary mb-3">Добавьте точки маршрута</h3>
          <UiInput
            v-model="searchQuery"
            placeholder="Поиск локаций…"
            class="rounded-xl px-4 py-2.5 font-body bg-white/50 border border-accent/40 focus-visible:ring-accent mb-3 shadow-inner text-sm"
          />
          <div class="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1">
            <button
              v-for="loc in filteredLocations"
              :key="loc.id"
              class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-body text-sm text-left border-none cursor-pointer transition-all duration-200"
              :class="selectedLocationIds.includes(loc.id)
                ? 'bg-accent/20 text-accent-dark font-medium shadow-sm'
                : 'bg-transparent text-primary hover:bg-white/70 border border-transparent hover:border-accent/20'"
              @click="addLocation(loc.id)"
            >
              <span class="truncate">{{ loc.name }}</span>
              <UiBadge variant="secondary" class="rounded-lg text-[0.65rem] bg-primary/5 text-primary-light shrink-0 font-medium tracking-wide">
                {{ loc.category }}
              </UiBadge>
            </button>
          </div>
        </div>

        <div v-if="selectedLocationIds.length > 0" class="bg-gradient-to-b from-white/70 to-white/30 backdrop-blur-md border border-accent/30 shadow-sm rounded-[2rem] p-5">
          <h3 class="font-heading text-lg font-bold text-primary mb-3">
             Выбрано <span class="text-accent-dark opacity-80">({{ selectedLocationIds.length }})</span>
          </h3>
          <div class="flex flex-col gap-1.5">
            <div
              v-for="(id, idx) in selectedLocationIds"
              :key="id"
              class="flex items-center gap-3 px-3 py-2 bg-white/80 border border-accent/20 rounded-2xl shadow-sm group transition-all hover:border-accent/40"
            >
              <span class="w-6 h-6 rounded-full bg-accent text-primary-dark flex items-center justify-center text-xs font-black shadow-sm shrink-0">
                {{ idx + 1 }}
              </span>
              <span class="font-body text-sm font-medium text-primary flex-1 truncate">{{ getLocationName(id) }}</span>
              <button class="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all cursor-pointer bg-white rounded-full p-1 border-none" @click="removeLocation(id)">
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 px-1">
          <label class="font-body text-[0.7rem] font-bold text-primary uppercase tracking-widest opacity-80">Транспорт</label>
          <UiToggleGroup type="single" :model-value="transport" @update:model-value="(v: unknown) => { if (v) transport = String(v) }" class="justify-start flex-wrap gap-1.5">
            <UiToggleGroupItem
              v-for="opt in transportOptions"
              :key="opt.value"
              :value="opt.value"
              class="rounded-xl px-4 py-2 font-body text-sm transition-all duration-200 data-[state=on]:bg-accent data-[state=on]:text-primary-dark data-[state=on]:font-bold data-[state=on]:shadow-md border border-primary/10 hover:border-primary/20 bg-white/50"
            >
              {{ opt.label }}
            </UiToggleGroupItem>
          </UiToggleGroup>
        </div>

        <div class="flex flex-col gap-2 mt-2">
          <UiButton
            :disabled="selectedLocationIds.length < 2 || routesStore.loading"
            class="bg-accent hover:bg-accent-dark border-none shadow-md hover:shadow-lg text-primary-dark font-body font-black uppercase tracking-wide rounded-2xl py-6 transition-all duration-300 transform active:scale-[0.98]"
            @click="handleBuild"
          >
            <Loader2 v-if="routesStore.loading" class="w-5 h-5 mr-2 animate-spin" />
            <Navigation v-else class="w-5 h-5 mr-2" />
            Построить маршрут
          </UiButton>

          <UiButton
            variant="outline"
            class="rounded-2xl font-body font-bold border border-accent/30 bg-white/50 backdrop-blur-sm text-primary hover:bg-gradient-to-r hover:from-white/80 hover:to-accent/20 hover:border-accent/50 py-5 transition-all shadow-sm"
            @click="() => {}"
          >
            <Sparkles class="w-4 h-4 mr-2 text-accent-dark" />
            ИИ, собери маршрут
          </UiButton>
        </div>

        <UiAlert v-if="routesStore.error" variant="destructive" class="rounded-2xl border-red-200 bg-red-50 text-red-800 shadow-sm mt-2">
          <AlertCircle class="h-4 w-4" />
          <UiAlertDescription class="font-medium text-sm">{{ routesStore.error }}</UiAlertDescription>
        </UiAlert>
      </div>

      <div class="flex flex-col gap-4">
        <div v-if="!routesStore.currentRoute && !routesStore.loading" class="flex flex-col items-center justify-center gap-3 py-12 bg-gradient-to-b from-white/50 to-white/10 border border-accent/20 border-dashed rounded-[2rem] h-full min-h-[300px]">
          <div class="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center border border-accent/20">
            <Navigation class="w-6 h-6 text-accent-dark/60" />
          </div>
          <p class="font-body font-medium text-sm text-primary">Добавьте минимум 2 точки</p>
          <p class="font-body text-xs text-primary-light">и нажмите «Построить маршрут»</p>
        </div>

        <div v-else-if="routesStore.loading" class="flex flex-col items-center justify-center gap-4 py-12 h-full min-h-[300px]">
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 border-4 border-accent/30 rounded-full animate-ping"></div>
            <Loader2 class="w-8 h-8 text-accent animate-spin relative z-10" />
          </div>
          <p class="font-body font-medium text-primary">Прокладываем маршрут…</p>
        </div>

        <div v-else-if="routesStore.currentRoute" class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col justify-center items-center gap-1 p-4 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md border border-accent/30 shadow-sm rounded-3xl relative overflow-hidden group">
              <div class="absolute -right-4 -top-4 w-16 h-16 bg-accent/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <Ruler class="w-5 h-5 text-accent-dark mb-1 relative z-10" />
              <span class="font-heading font-black text-2xl text-primary relative z-10">{{ formatDistance(routesStore.currentRoute.total_distance_km) }}</span>
              <span class="font-body text-xs font-bold uppercase tracking-widest text-primary-light relative z-10">Расстояние</span>
            </div>
            <div class="flex flex-col justify-center items-center gap-1 p-4 bg-gradient-to-br from-primary/5 to-white/40 backdrop-blur-md border border-primary/10 shadow-sm rounded-3xl relative overflow-hidden group">
              <div class="absolute -left-4 -bottom-4 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <Clock class="w-5 h-5 text-primary mb-1 relative z-10" />
              <span class="font-heading font-black text-2xl text-primary relative z-10">{{ formatTime(routesStore.currentRoute.total_time_min) }}</span>
              <span class="font-body text-xs font-bold uppercase tracking-widest text-primary-light relative z-10">В пути</span>
            </div>
          </div>

          <!-- Weather warning -->
          <div v-if="weatherStore.hasWarnings" class="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-300 rounded-2xl">
            <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0" />
            <div class="flex-1">
              <p class="font-body font-bold text-sm text-amber-900">Погода изменилась</p>
              <p class="font-body text-xs text-amber-700">
                {{ weatherStore.warningPoints.map(w => `${w.point}: ${w.condition}`).join(', ') }}
              </p>
            </div>
            <button
              v-if="weatherStore.needsRebuild"
              :disabled="routesStore.rebuilding"
              class="flex items-center gap-1.5 font-body font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white border-none rounded-xl px-3 py-2 cursor-pointer transition-all shrink-0 disabled:opacity-50"
              @click="routeId && routesStore.rebuildRoute(routeId)"
            >
              <Loader2 v-if="routesStore.rebuilding" class="w-3.5 h-3.5 animate-spin" />
              <RefreshCw v-else class="w-3.5 h-3.5" />
              Перестроить
            </button>
          </div>

          <div class="bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-md border border-accent/30 shadow-sm rounded-[2rem] p-6">
            <h3 class="font-heading text-xl font-bold text-primary mb-6">План поездки</h3>
            <div class="flex flex-col gap-0 relative">
              <div class="absolute left-[11px] top-4 bottom-8 w-[2px] bg-gradient-to-b from-accent to-accent/20 hidden sm:block"></div>
              <div
                v-for="(point, idx) in routesStore.currentRoute.points"
                :key="point.location_id"
                class="flex items-start gap-4 relative z-10 group"
              >
                <div class="flex flex-col items-center pb-5">
                  <div class="w-6 h-6 rounded-full bg-accent text-primary-dark flex items-center justify-center text-xs font-black shadow-md shrink-0 border-2 border-white ring-4 ring-transparent group-hover:ring-accent/20 transition-all">
                    {{ idx + 1 }}
                  </div>
                  <div v-if="idx < routesStore.currentRoute.points.length - 1" class="w-[2px] h-full sm:hidden bg-accent/30 mt-2 rounded-full"></div>
                </div>
                <div class="flex-1 bg-white/60 border border-white group-hover:bg-white group-hover:shadow-md transition-all rounded-2xl p-3 pb-4 mb-4">
                  <p class="font-heading font-bold text-base text-primary leading-tight">{{ point.name }}</p>
                  <div v-if="point.distance_km > 0" class="flex items-center gap-3 mt-2">
                    <span class="inline-flex items-center gap-1 font-body text-xs font-bold text-primary-light bg-primary/5 px-2 py-1 rounded-lg">
                      <Ruler class="w-3 h-3"/> {{ formatDistance(point.distance_km) }}
                    </span>
                    <span class="inline-flex items-center gap-1 font-body text-xs font-bold text-accent-dark bg-accent/10 px-2 py-1 rounded-lg">
                      <Clock class="w-3 h-3"/> ~{{ formatTime(point.travel_time_min) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Story Player -->
          <StoryPlayer v-if="effectiveRouteId" :route-id="effectiveRouteId" />

          <!-- Offline Download -->
          <div class="bg-gradient-to-b from-white/70 to-white/30 backdrop-blur-md border border-accent/30 shadow-sm rounded-[2rem] p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                <Download class="w-5 h-5 text-primary" />
              </div>
              <div class="flex-1">
                <p class="font-body font-bold text-base text-primary">Скачать офлайн</p>
                <p class="font-body text-xs text-primary-light">Маршрут будет доступен без интернета</p>
              </div>
              <button
                :disabled="downloading || downloaded"
                class="flex items-center gap-1.5 font-body font-bold text-sm border-none rounded-xl px-4 py-2.5 cursor-pointer transition-all duration-200 disabled:opacity-60 shrink-0"
                :class="downloaded ? 'bg-green-500/15 text-green-700' : 'bg-accent hover:bg-accent-dark text-white'"
                @click="handleDownloadOffline"
              >
                <Loader2 v-if="downloading" class="w-4 h-4 animate-spin" />
                <Check v-else-if="downloaded" class="w-4 h-4" />
                <Download v-else class="w-4 h-4" />
                {{ downloaded ? 'Сохранено!' : downloading ? 'Скачивание…' : 'Скачать' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
