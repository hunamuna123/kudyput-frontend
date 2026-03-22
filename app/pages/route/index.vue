<script setup lang="ts">
import {
  Navigation, MapPin, Clock, Ruler, ArrowLeft, Loader2, AlertCircle,
  Plus, X, Sparkles, Banknote, CalendarDays, ChevronRight, TrendingUp, Headphones,
} from "lucide-vue-next";
import { useRoutesStore } from "~~/store/routes";
import { useLocationsStore } from "~~/store/locations";
import { useAuthStore } from "~~/store/auth";
import { useTripsStore, type TripRoute } from "~~/store/trips";
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
const tripsStore = useTripsStore();

const effectiveRouteId = computed(() => {
  const storeId = routesStore.currentRoute?.id;
  if (storeId) return storeId;
  return null;
});

// Tabs
const activeTab = ref<"build" | "trips" | "saved">("build");

// Manual build
const transport = ref("car");
const selectedLocationIds = ref<string[]>([]);
const searchQuery = ref("");

const transportOptions = [
  { label: "🚗 Авто", value: "car" },
  { label: "🚌 Общественный", value: "public" },
  { label: "🚶 Пешком", value: "walk" },
  { label: "🚴 Велосипед", value: "bike" },
];

const categoryEmoji: Record<string, string> = {
  winery: "🍷", farm: "🐐", trail: "🥾", gastro: "🍽", nature: "🌿",
  camping: "🏕", resort: "🏖", extreme: "⚡", cultural: "🏛", beach: "🌊",
};

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
  await routesStore.buildRoute(selectedLocationIds.value, transport.value);
}

// Trip-aware route
const selectedTripId = ref<string | null>(null);
const maxPoints = ref(0);
const optimize = ref(true);
const tripRouteError = ref<string | null>(null);

async function buildTripRoute() {
  if (!selectedTripId.value) return;
  tripRouteError.value = null;
  const result = await tripsStore.buildTripRoute(selectedTripId.value, {
    location_ids: [],
    max_points: maxPoints.value,
    optimize: optimize.value,
  });
  if (!result) {
    tripRouteError.value = tripsStore.error || "Не удалось построить маршрут";
  }
}

const timeSlotLabels: Record<string, string> = {
  morning: "🌅 Утро", afternoon: "☀️ День", evening: "🌙 Вечер",
};

const audienceLabels: Record<string, string> = {
  all: "Все", adults: "Взрослые", children: "Дети",
};

const audienceClass: Record<string, string> = {
  all: "bg-primary/6 text-primary-light",
  adults: "bg-purple-500/10 text-purple-700",
  children: "bg-blue-500/10 text-blue-600",
};

const groupedByDay = computed(() => {
  const pts = tripsStore.tripRoute?.points;
  if (!pts?.length) return [];
  const map = new Map<number, typeof pts>();
  for (const p of pts) {
    const day = p.day_number || 1;
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(p);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([day, points]) => ({ day, points: points.sort((a, b) => a.position - b.position) }));
});

// Saved routes mock
interface SavedRoute {
  id: number;
  name: string;
  stops: string[];
  transport: string;
  distance_km: number;
  time_min: number;
  popularity: number;
  created: string;
}

const transportLbl: Record<string, string> = {
  car: "🚗 Авто", walk: "🚶 Пешком", bike: "🚴 Вело", public: "🚌 ОТ",
};

const savedRoutes = ref<SavedRoute[]>([
  { id: 1, name: "Винный маршрут", stops: ["Абрау-Дюрсо", "Лефкадия", "Саук-Дере"], transport: "car", distance_km: 145, time_min: 180, popularity: 94, created: "2026-03-20" },
  { id: 2, name: "Горные тропы", stops: ["Красная Поляна", "Рицинский заповедник", "Хребет Аибга"], transport: "walk", distance_km: 28, time_min: 480, popularity: 87, created: "2026-03-19" },
  { id: 3, name: "Семейный тур", stops: ["Сафари-парк", "Дольфинарий", "Парк Олимп"], transport: "car", distance_km: 65, time_min: 300, popularity: 76, created: "2026-03-18" },
  { id: 4, name: "Гастро-путешествие", stops: ["Фермерский рынок", "Козья ферма", "Сыроварня Мария"], transport: "car", distance_km: 92, time_min: 240, popularity: 71, created: "2026-03-17" },
  { id: 5, name: "Побережье", stops: ["Анапа", "Сукко", "Большой Утриш"], transport: "bike", distance_km: 42, time_min: 180, popularity: 68, created: "2026-03-16" },
]);

function formatDistance(km: number): string {
  if (!km) return "—";
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}

function formatTime(min: number): string {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h > 0) return `${h}ч ${m}мин`;
  return `${m}мин`;
}

function formatCost(rub: number): string {
  if (!rub) return "—";
  return `${rub.toLocaleString("ru-RU")} ₽`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

onMounted(async () => {
  authStore.restoreSession();
  if (locationsStore.locations.length === 0) {
    await locationsStore.fetchLocations();
  }
  await tripsStore.fetchTrips();
});
</script>

<template>
  <div class="w-full max-w-5xl mx-auto">

    <div class="flex items-center gap-4 mb-6">
      <NuxtLink to="/map" class="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/50 hover:bg-white/80 border border-accent/30 rounded-full text-primary transition-all shadow-sm no-underline">
        <ArrowLeft class="w-5 h-5" />
      </NuxtLink>
      <h1 class="font-heading text-3xl sm:text-4xl font-black uppercase text-primary tracking-tighter leading-none">
        Маршрут
      </h1>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1.5 mb-6 bg-white/30 border border-accent/20 rounded-2xl p-1">
      <button
        v-for="tab in [
          { key: 'build', label: '🛠 Построить' },
          { key: 'trips', label: '✨ По поездке' },
          { key: 'saved', label: '📋 Сохранённые' },
        ]"
        :key="tab.key"
        @click="activeTab = tab.key as typeof activeTab"
        class="flex-1 font-body font-bold text-base rounded-xl px-4 py-2.5 transition-all duration-200 border-none cursor-pointer"
        :class="activeTab === tab.key
          ? 'bg-white shadow-sm text-primary'
          : 'bg-transparent text-primary-light hover:text-primary hover:bg-white/50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab: Manual Build -->
    <div v-if="activeTab === 'build'" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="flex flex-col gap-4">
        <div class="bg-gradient-to-b from-white/70 to-white/30 backdrop-blur-md border border-accent/30 shadow-sm rounded-[2rem] p-5">
          <h3 class="font-body font-bold text-lg text-primary mb-3">Добавьте точки маршрута</h3>
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
              <UiBadge variant="secondary" class="rounded-lg text-xs bg-primary/5 text-primary-light shrink-0 font-medium tracking-wide">
                {{ loc.category }}
              </UiBadge>
            </button>
          </div>
        </div>

        <div v-if="selectedLocationIds.length > 0" class="bg-gradient-to-b from-white/70 to-white/30 backdrop-blur-md border border-accent/30 shadow-sm rounded-[2rem] p-5">
          <h3 class="font-body font-bold text-lg text-primary mb-3">
             Выбрано <span class="text-accent-dark opacity-80">({{ selectedLocationIds.length }})</span>
          </h3>
          <div class="flex flex-col gap-1.5">
            <div
              v-for="(id, idx) in selectedLocationIds"
              :key="id"
              class="flex items-center gap-3 px-3 py-2 bg-white/80 border border-accent/20 rounded-2xl shadow-sm group transition-all hover:border-accent/40"
            >
              <span class="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0">
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
          <label class="font-body text-sm font-bold text-primary uppercase tracking-widest opacity-80">Транспорт</label>
          <UiToggleGroup type="single" :model-value="transport" @update:model-value="(v: unknown) => { if (v) transport = String(v) }" class="justify-start flex-wrap gap-1.5">
            <UiToggleGroupItem
              v-for="opt in transportOptions"
              :key="opt.value"
              :value="opt.value"
              class="rounded-xl px-4 py-2 font-body text-sm transition-all duration-200 data-[state=on]:bg-accent data-[state=on]:text-white data-[state=on]:font-bold data-[state=on]:shadow-md border border-primary/10 hover:border-primary/20 bg-white/50"
            >
              {{ opt.label }}
            </UiToggleGroupItem>
          </UiToggleGroup>
        </div>

        <UiButton
          :disabled="selectedLocationIds.length < 2 || routesStore.loading"
          class="bg-accent hover:bg-accent-dark border-none shadow-md hover:shadow-lg text-white font-body font-black uppercase tracking-wide rounded-2xl py-6 transition-all duration-300 transform active:scale-[0.98]"
          @click="handleBuild"
        >
          <Loader2 v-if="routesStore.loading" class="w-5 h-5 mr-2 animate-spin" />
          <Navigation v-else class="w-5 h-5 mr-2" />
          Построить маршрут
        </UiButton>

        <UiAlert v-if="routesStore.error" variant="destructive" class="rounded-2xl border-red-200 bg-red-50 text-red-800 shadow-sm">
          <AlertCircle class="h-4 w-4" />
          <UiAlertDescription class="font-medium text-sm">{{ routesStore.error }}</UiAlertDescription>
        </UiAlert>
      </div>

      <!-- Result panel -->
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
              <span class="font-body font-black text-3xl text-primary relative z-10">{{ formatDistance(routesStore.currentRoute.total_distance_km) }}</span>
              <span class="font-body text-xs font-bold uppercase tracking-widest text-primary-light relative z-10">Расстояние</span>
            </div>
            <div class="flex flex-col justify-center items-center gap-1 p-4 bg-gradient-to-br from-primary/5 to-white/40 backdrop-blur-md border border-primary/10 shadow-sm rounded-3xl relative overflow-hidden group">
              <div class="absolute -left-4 -bottom-4 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <Clock class="w-5 h-5 text-primary mb-1 relative z-10" />
              <span class="font-body font-black text-3xl text-primary relative z-10">{{ formatTime(routesStore.currentRoute.total_time_min) }}</span>
              <span class="font-body text-xs font-bold uppercase tracking-widest text-primary-light relative z-10">В пути</span>
            </div>
          </div>

          <div class="bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-md border border-accent/30 shadow-sm rounded-[2rem] p-6">
            <h3 class="font-body font-bold text-2xl text-primary mb-6">План поездки</h3>
            <div class="flex flex-col gap-0 relative">
              <div class="absolute left-[11px] top-4 bottom-8 w-[2px] bg-gradient-to-b from-accent to-accent/20 hidden sm:block"></div>
              <div
                v-for="(point, idx) in routesStore.currentRoute.points"
                :key="point.location_id"
                class="flex items-start gap-4 relative z-10 group"
              >
                <div class="flex flex-col items-center pb-5">
                  <div class="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-black shadow-md shrink-0 border-2 border-white ring-4 ring-transparent group-hover:ring-accent/20 transition-all">
                    {{ idx + 1 }}
                  </div>
                  <div v-if="idx < routesStore.currentRoute.points.length - 1" class="w-[2px] h-full sm:hidden bg-accent/30 mt-2 rounded-full"></div>
                </div>
                <div class="flex-1 bg-white/60 border border-white group-hover:bg-white group-hover:shadow-md transition-all rounded-2xl p-3 pb-4 mb-4">
                  <p class="font-body font-bold text-lg text-primary leading-tight">{{ point.name }}</p>
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

          <!-- Audio Guide (StoryPlayer) -->
          <StoryPlayer v-if="effectiveRouteId" :route-id="effectiveRouteId" />

          <!-- Link to full route page -->
          <NuxtLink
            v-if="effectiveRouteId"
            :to="`/route/${effectiveRouteId}`"
            class="flex items-center justify-center gap-2 font-body font-bold text-base text-accent-dark bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-2xl px-4 py-3.5 no-underline transition-all cursor-pointer"
          >
            <Headphones class="w-4 h-4" />
            Открыть полный маршрут с аудиогидом
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Tab: Trip-aware Route -->
    <div v-else-if="activeTab === 'trips'" class="flex flex-col gap-5">
      <div class="bg-gradient-to-br from-primary/5 to-accent/8 border border-accent/40 rounded-3xl p-6">
        <div class="flex items-center gap-2.5 mb-5">
          <div class="w-10 h-10 flex items-center justify-center rounded-[12px] bg-accent/15 text-accent-dark">
            <Sparkles class="w-5 h-5" />
          </div>
          <div>
            <h2 class="font-body font-bold text-2xl text-primary m-0">ИИ-маршрут по поездке</h2>
            <p class="font-body text-sm text-primary-light m-0">Автоподбор локаций по vibe-профилю участников</p>
          </div>
        </div>

        <!-- Trip selector -->
        <div class="flex flex-col gap-1.5 mb-4">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Выберите поездку</label>
          <div v-if="tripsStore.trips.length === 0" class="font-body text-base text-primary-light py-4 text-center">
            <span v-if="tripsStore.loading">Загрузка поездок...</span>
            <span v-else>Нет поездок. <NuxtLink to="/trip/new" class="text-accent-dark">Создать →</NuxtLink></span>
          </div>
          <div v-else class="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
            <button
              v-for="trip in tripsStore.trips"
              :key="trip.id"
              @click="selectedTripId = trip.id"
              class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer"
              :class="selectedTripId === trip.id
                ? 'bg-accent/15 border-accent/40 text-primary'
                : 'bg-white/50 border-accent/15 text-primary-light hover:bg-white/80 hover:border-accent/30'"
            >
              <div class="flex items-center gap-2 min-w-0">
                <CalendarDays class="w-4 h-4 shrink-0" />
                <span class="font-body font-bold text-base truncate">
                  {{ formatDate(trip.date_from) }} — {{ formatDate(trip.date_to) }}
                </span>
              </div>
              <span class="font-body text-xs shrink-0">{{ trip.group_size }} чел.</span>
            </button>
          </div>
        </div>

        <!-- Options -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div class="flex flex-col gap-1.5">
            <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Макс. точек</label>
            <div class="flex items-center gap-3">
              <button @click="maxPoints = Math.max(0, maxPoints - 1)" class="w-8 h-8 rounded-lg bg-white/70 border border-accent/20 flex items-center justify-center font-body font-bold text-primary hover:bg-white transition-colors cursor-pointer">−</button>
              <span class="font-body font-bold text-lg text-primary w-8 text-center">{{ maxPoints || '∞' }}</span>
              <button @click="maxPoints = Math.min(20, maxPoints + 1)" class="w-8 h-8 rounded-lg bg-white/70 border border-accent/20 flex items-center justify-center font-body font-bold text-primary hover:bg-white transition-colors cursor-pointer">+</button>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Оптимизация</label>
            <button @click="optimize = !optimize" class="self-start flex items-center gap-2 cursor-pointer bg-transparent border-none p-0">
              <div class="w-11 h-6 rounded-full flex items-center px-0.5 transition-colors duration-300" :class="optimize ? 'bg-accent' : 'bg-primary/15'">
                <div class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300" :class="optimize ? 'translate-x-5' : 'translate-x-0'" />
              </div>
              <span class="font-body text-base text-primary">{{ optimize ? 'Вкл' : 'Выкл' }}</span>
            </button>
          </div>
        </div>

        <UiAlert v-if="tripRouteError" variant="destructive" class="rounded-2xl mb-4">
          <AlertCircle class="h-4 w-4" />
          <UiAlertDescription>{{ tripRouteError }}</UiAlertDescription>
        </UiAlert>

        <button
          :disabled="!selectedTripId || tripsStore.routeLoading"
          @click="buildTripRoute"
          class="w-full flex items-center justify-center gap-3 font-body font-bold text-lg text-white bg-accent rounded-2xl px-6 py-4 transition-all duration-300 hover:bg-accent-dark hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 cursor-pointer"
        >
          <Loader2 v-if="tripsStore.routeLoading" class="w-5 h-5 animate-spin" />
          <Sparkles v-else class="w-5 h-5" />
          {{ tripsStore.routeLoading ? 'ИИ строит маршрут…' : 'Построить маршрут с ИИ' }}
        </button>
      </div>

      <!-- Trip Route Result -->
      <div v-if="tripsStore.tripRoute" class="flex flex-col gap-4">
        <div class="bg-white/60 border border-accent/20 rounded-2xl p-5">
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 class="font-body font-bold text-xl text-primary m-0">{{ tripsStore.tripRoute.name || 'Маршрут' }}</h3>
              <p v-if="tripsStore.tripRoute.summary" class="font-body text-base text-primary-light mt-1 m-0 line-clamp-2">{{ tripsStore.tripRoute.summary }}</p>
            </div>
            <UiBadge variant="secondary" class="rounded-lg text-xs font-bold shrink-0 bg-accent/12 text-accent-dark">
              {{ tripsStore.tripRoute.status }}
            </UiBadge>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="flex items-center gap-2 bg-primary/4 rounded-xl px-3 py-2.5">
              <MapPin class="w-4 h-4 text-accent-dark shrink-0" />
              <div class="flex flex-col">
                <span class="font-body font-bold text-base text-primary">{{ tripsStore.tripRoute.points_count }}</span>
                <span class="font-body text-2xs text-primary-light">Точек</span>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-primary/4 rounded-xl px-3 py-2.5">
              <Ruler class="w-4 h-4 text-primary shrink-0" />
              <div class="flex flex-col">
                <span class="font-body font-bold text-base text-primary">{{ formatDistance(tripsStore.tripRoute.total_distance_km) }}</span>
                <span class="font-body text-2xs text-primary-light">Дистанция</span>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-primary/4 rounded-xl px-3 py-2.5">
              <Clock class="w-4 h-4 text-primary shrink-0" />
              <div class="flex flex-col">
                <span class="font-body font-bold text-base text-primary">{{ formatTime(tripsStore.tripRoute.total_duration_min) }}</span>
                <span class="font-body text-2xs text-primary-light">Время</span>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-primary/4 rounded-xl px-3 py-2.5">
              <Banknote class="w-4 h-4 text-green-600 shrink-0" />
              <div class="flex flex-col">
                <span class="font-body font-bold text-base text-primary">{{ formatCost(tripsStore.tripRoute.estimated_cost_rub) }}</span>
                <span class="font-body text-2xs text-primary-light">Стоимость</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Day-grouped points -->
        <div v-for="dayGroup in groupedByDay" :key="dayGroup.day" class="bg-white/60 border border-accent/20 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
              <span class="font-body font-bold text-sm text-primary">{{ dayGroup.day }}</span>
            </div>
            <h4 class="font-body font-bold text-lg text-primary m-0">День {{ dayGroup.day }}</h4>
            <span class="font-body text-xs text-primary-light">· {{ dayGroup.points.length }} {{ dayGroup.points.length === 1 ? 'точка' : dayGroup.points.length < 5 ? 'точки' : 'точек' }}</span>
          </div>

          <div class="flex flex-col gap-0">
            <div v-for="(point, idx) in dayGroup.points" :key="point.id || idx" class="flex gap-3">
              <div class="flex flex-col items-center shrink-0">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-body font-bold text-xs shrink-0" :class="idx === 0 ? 'bg-accent' : 'bg-primary/60'">
                  {{ point.position || idx + 1 }}
                </div>
                <div v-if="idx < dayGroup.points.length - 1" class="w-0.5 flex-1 min-h-[24px] bg-primary/15"></div>
              </div>
              <div class="flex-1 pb-4 min-w-0">
                <NuxtLink
                  v-if="point.location_id"
                  :to="`/location/${point.location_id}`"
                  class="block bg-white/50 border border-accent/15 rounded-xl p-4 hover:border-accent/40 transition-colors no-underline group"
                >
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <span class="text-lg shrink-0">{{ categoryEmoji[point.category] || '📍' }}</span>
                      <span class="font-body font-bold text-base text-primary truncate">{{ point.name || 'Точка' }}</span>
                    </div>
                    <ChevronRight class="w-4 h-4 text-primary-light group-hover:text-accent-dark transition-all shrink-0" />
                  </div>
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span v-if="point.time_slot" class="font-body text-xs font-bold text-primary-light bg-yellow-500/10 rounded-full px-2 py-0.5">
                      {{ timeSlotLabels[point.time_slot] || point.time_slot }}
                    </span>
                    <span v-if="point.target_audience && point.target_audience !== 'all'" class="font-body text-xs font-bold rounded-full px-2 py-0.5" :class="audienceClass[point.target_audience] || ''">
                      {{ audienceLabels[point.target_audience] || point.target_audience }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3 flex-wrap">
                    <span v-if="point.stay_duration_min" class="font-body text-xs text-primary-light flex items-center gap-1">
                      <Clock class="w-3 h-3" /> {{ formatTime(point.stay_duration_min) }}
                    </span>
                    <span v-if="point.travel_km" class="font-body text-xs text-primary-light flex items-center gap-1">
                      <Ruler class="w-3 h-3" /> {{ formatDistance(point.travel_km) }}
                    </span>
                    <span v-if="point.vibe_score" class="font-body text-xs text-accent-dark bg-accent/10 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Sparkles class="w-3 h-3" /> {{ Math.round(point.vibe_score * 100) }}%
                    </span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <button
          :disabled="tripsStore.routeLoading"
          @click="buildTripRoute"
          class="w-full flex items-center justify-center gap-2 font-body font-bold text-base text-accent-dark bg-white/50 border border-accent/20 rounded-2xl px-6 py-3.5 hover:bg-accent/10 hover:border-accent/40 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles class="w-4 h-4" />
          Перестроить маршрут
        </button>
      </div>
    </div>

    <!-- Tab: Saved Routes -->
    <div v-else-if="activeTab === 'saved'" class="flex flex-col gap-3">
      <div
        v-for="route in savedRoutes"
        :key="route.id"
        class="bg-white/35 border border-accent/40 rounded-3xl p-5 hover:border-accent/60 transition-colors"
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="min-w-0">
            <h3 class="font-body font-bold text-lg text-primary truncate m-0">{{ route.name }}</h3>
            <span class="font-body text-sm text-primary-light">{{ route.created }}</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="font-body text-sm text-accent-dark bg-accent/10 px-2 py-0.5 rounded-lg">
              {{ transportLbl[route.transport] || route.transport }}
            </span>
            <div class="flex items-center gap-0.5 font-body font-bold text-xs text-green-700 bg-green-500/12 px-2 py-0.5 rounded-lg">
              <TrendingUp class="w-3 h-3" />
              {{ route.popularity }}%
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-3 flex-wrap">
          <span v-for="(stop, i) in route.stops" :key="i" class="flex items-center gap-1">
            <span class="font-body text-sm text-primary">{{ stop }}</span>
            <span v-if="i < route.stops.length - 1" class="text-primary-light text-xs">→</span>
          </span>
        </div>

        <div class="flex gap-4">
          <div class="flex items-center gap-1.5">
            <Ruler class="w-3.5 h-3.5 text-primary-light" />
            <span class="font-body text-sm text-primary-light">{{ formatDistance(route.distance_km) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Clock class="w-3.5 h-3.5 text-primary-light" />
            <span class="font-body text-sm text-primary-light">{{ formatTime(route.time_min) }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-primary-light" />
            <span class="font-body text-sm text-primary-light">{{ route.stops.length }} точек</span>
          </div>
        </div>
      </div>

      <p class="font-body text-xs text-primary-light opacity-40 mt-2">
        Данные mock — демонстрация интерфейса
      </p>
    </div>
  </div>
</template>
