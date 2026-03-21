<script setup lang="ts">
import { Navigation, MapPin, Clock, Ruler, ArrowLeft, Loader2, AlertCircle, Plus, X } from "lucide-vue-next";
import { useRoutesStore } from "~~/store/routes";
import { useLocationsStore } from "~~/store/locations";
import { useAuthStore } from "~~/store/auth";

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
  await routesStore.buildRoute(selectedLocationIds.value, transport.value);
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

onMounted(async () => {
  authStore.restoreSession();
  if (locationsStore.locations.length === 0) {
    await locationsStore.fetchLocations();
  }
});
</script>

<template>
  <div class="w-full">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/dashboard" class="font-body text-[0.78rem] text-primary-light no-underline hover:text-primary transition-colors inline-flex items-center gap-1.5">
        <ArrowLeft class="w-3.5 h-3.5" />
      </NuxtLink>
      <h1 class="font-heading text-[1.3rem] text-primary">Построить маршрут</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <div class="flex flex-col gap-5">

        <div class="bg-cream/35 border border-cream/50 rounded-3xl p-6">
          <h3 class="font-heading text-[0.95rem] text-primary mb-4">Добавьте точки маршрута</h3>

          <UiInput
            v-model="searchQuery"
            placeholder="Поиск локаций…"
            class="rounded-2xl px-4 py-3 font-body border-primary/15 bg-cream/25 focus-visible:ring-accent mb-3"
          />

          <div class="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto">
            <button
              v-for="loc in filteredLocations"
              :key="loc.id"
              class="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl font-body text-[0.82rem] text-left border-none cursor-pointer transition-colors"
              :class="selectedLocationIds.includes(loc.id)
                ? 'bg-accent/15 text-accent-dark'
                : 'bg-transparent text-primary hover:bg-cream/60'"
              @click="addLocation(loc.id)"
            >
              <span class="truncate">{{ loc.name }}</span>
              <UiBadge variant="secondary" class="rounded-lg text-[0.6rem] bg-primary/6 text-primary-light shrink-0">
                {{ loc.category }}
              </UiBadge>
            </button>
          </div>
        </div>


        <div v-if="selectedLocationIds.length > 0" class="bg-cream/35 border border-cream/50 rounded-3xl p-6">
          <h3 class="font-heading text-[0.95rem] text-primary mb-3">
            Точки маршрута ({{ selectedLocationIds.length }})
          </h3>
          <div class="flex flex-col gap-2">
            <div
              v-for="(id, idx) in selectedLocationIds"
              :key="id"
              class="flex items-center gap-3 px-4 py-2.5 bg-cream-light/60 rounded-xl"
            >
              <span class="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[0.72rem] font-body font-bold text-accent-dark shrink-0">
                {{ idx + 1 }}
              </span>
              <span class="font-body text-[0.82rem] text-primary flex-1 truncate">{{ getLocationName(id) }}</span>
              <button class="text-red-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none" @click="removeLocation(id)">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>


        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.78rem] font-bold text-primary">Транспорт</label>
          <UiToggleGroup type="single" :model-value="transport" @update:model-value="(v: unknown) => { if (v) transport = String(v) }" class="justify-start flex-wrap">
            <UiToggleGroupItem
              v-for="opt in transportOptions"
              :key="opt.value"
              :value="opt.value"
              class="rounded-2xl px-5 py-2.5 font-body text-[0.82rem] data-[state=on]:bg-accent data-[state=on]:text-primary-dark data-[state=on]:border-accent border border-primary/15"
            >
              {{ opt.label }}
            </UiToggleGroupItem>
          </UiToggleGroup>
        </div>

        <UiButton
          :disabled="selectedLocationIds.length < 2 || routesStore.loading"
          class="bg-accent hover:bg-accent-dark border-accent text-primary-dark font-body font-bold rounded-2xl py-3.5"
          @click="handleBuild"
        >
          <Loader2 v-if="routesStore.loading" class="w-4 h-4 mr-2 animate-spin" />
          <Navigation v-else class="w-4 h-4 mr-2" />
          Построить маршрут
        </UiButton>

        <UiAlert v-if="routesStore.error" variant="destructive" class="rounded-2xl">
          <AlertCircle class="h-4 w-4" />
          <UiAlertDescription>{{ routesStore.error }}</UiAlertDescription>
        </UiAlert>
      </div>


      <div>

        <div v-if="!routesStore.currentRoute && !routesStore.loading" class="flex flex-col items-center gap-4 py-16 bg-cream/35 border border-cream/50 rounded-3xl">
          <div class="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
            <Navigation class="w-7 h-7 text-accent-dark" />
          </div>
          <p class="font-body text-[0.88rem] text-primary">Добавьте минимум 2 точки</p>
          <p class="font-body text-[0.78rem] text-primary-light">и нажмите «Построить маршрут»</p>
        </div>


        <div v-else-if="routesStore.loading" class="flex flex-col items-center gap-4 py-16">
          <Loader2 class="w-8 h-8 text-accent-dark animate-spin" />
          <p class="font-body text-primary-light">Строим маршрут…</p>
        </div>


        <div v-else-if="routesStore.currentRoute" class="flex flex-col gap-4">

          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-3 p-5 bg-cream/35 border border-cream/50 rounded-3xl">
              <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-accent/15">
                <Ruler class="w-5 h-5 text-accent-dark" />
              </div>
              <div>
                <span class="font-body font-bold text-[1rem] text-primary block">{{ formatDistance(routesStore.currentRoute.total_distance_km) }}</span>
                <span class="font-body text-[0.68rem] text-primary-light">Расстояние</span>
              </div>
            </div>
            <div class="flex items-center gap-3 p-5 bg-cream/35 border border-cream/50 rounded-3xl">
              <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/8">
                <Clock class="w-5 h-5 text-primary" />
              </div>
              <div>
                <span class="font-body font-bold text-[1rem] text-primary block">{{ formatTime(routesStore.currentRoute.total_time_min) }}</span>
                <span class="font-body text-[0.68rem] text-primary-light">В пути</span>
              </div>
            </div>
          </div>


          <div class="bg-cream/35 border border-cream/50 rounded-3xl p-6">
            <h3 class="font-heading text-[0.95rem] text-primary mb-4">Точки маршрута</h3>
            <div class="flex flex-col gap-0">
              <div
                v-for="(point, idx) in routesStore.currentRoute.points"
                :key="point.location_id"
                class="flex items-start gap-3"
              >

                <div class="flex flex-col items-center">
                  <div class="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[0.68rem] font-body font-bold text-accent-dark shrink-0">
                    {{ idx + 1 }}
                  </div>
                  <div v-if="idx < routesStore.currentRoute.points.length - 1" class="w-0.5 h-10 bg-accent/20"></div>
                </div>
                <div class="flex-1 pb-4">
                  <p class="font-body font-bold text-[0.85rem] text-primary">{{ point.name }}</p>
                  <div v-if="point.distance_km > 0" class="flex gap-3 mt-1">
                    <span class="font-body text-[0.72rem] text-primary-light">{{ formatDistance(point.distance_km) }}</span>
                    <span class="font-body text-[0.72rem] text-primary-light">~{{ formatTime(point.travel_time_min) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
