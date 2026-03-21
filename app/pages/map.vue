<script setup lang="ts">
import { MapPin, Filter, Loader2, AlertCircle, ExternalLink, Sparkles } from "lucide-vue-next";
import { useMapStore } from "~~/store/map";
import { useVibeStore } from "~~/store/vibe";
import { useAuthStore } from "~~/store/auth";

useHead({
  title: "Карта — КудыТуды",
  meta: [
    { name: "description", content: "Интерактивная карта скрытых мест Краснодарского края. Винодельни, фермы, горные тропы и камерные локации." },
  ],
});

const mapStore = useMapStore();
const vibeStore = useVibeStore();
const authStore = useAuthStore();
const categoryFilter = ref("");
const showFilters = ref(false);
const mapMode = ref<"ai" | "all">("all");

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
  red: "#ef4444",
};

const densityLabels: Record<string, string> = {
  green: "Спокойно",
  yellow: "Средне",
  red: "Популярно",
};

const hasVibeProfile = computed(() => vibeStore.hasProfile || !!authStore.user?.vibe_vector_id);

async function loadLocations() {
  const filters: Record<string, string | number | boolean | undefined> = {};
  if (categoryFilter.value) filters.category = categoryFilter.value;
  filters.min_lat = 43.5;
  filters.max_lat = 45.5;
  filters.min_lon = 36.5;
  filters.max_lon = 41.0;
  filters.limit = 100;
  await mapStore.fetchMapLocations(filters);
}

function selectPoint(id: string) {
  mapStore.selectPoint(mapStore.selectedPointId === id ? null : id);
}

watch(categoryFilter, () => {
  loadLocations();
});

onMounted(async () => {
  authStore.restoreSession();
  await loadLocations();
});
</script>

<template>
  <div class="min-h-screen bg-white relative overflow-hidden">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/8 top-[-100px] left-[10%] blur-[120px] pointer-events-none"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 bottom-[-80px] right-[5%] blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 mx-auto px-5 pt-4 pb-12" style="max-width: 1140px;">

      <div class="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 class="font-heading text-primary mb-1" style="font-size: clamp(1.2rem, 3vw, 1.8rem);">
            Интерактивная <span class="text-accent">карта</span>
          </h1>
          <p class="font-body font-light text-primary-light text-[0.85rem]">
            Исследуйте скрытые места Краснодарского края
          </p>
        </div>
        <div class="flex gap-2">
          <button
            v-if="hasVibeProfile"
            class="flex items-center gap-1.5 font-body text-[0.82rem] px-4 py-2 rounded-2xl border cursor-pointer transition-all duration-200"
            :class="mapMode === 'ai' ? 'bg-accent/15 border-accent/30 text-accent-dark font-bold' : 'bg-white/35 border-white/50 text-primary-light hover:border-accent/30'"
            @click="mapMode = mapMode === 'ai' ? 'all' : 'ai'"
          >
            <Sparkles class="w-4 h-4" />
            ИИ подобрал
          </button>
          <button
            class="flex items-center gap-1.5 font-body text-[0.82rem] px-4 py-2 rounded-2xl border cursor-pointer transition-all duration-200"
            :class="showFilters ? 'bg-accent/15 border-accent/30 text-accent-dark' : 'bg-white/35 border-white/50 text-primary-light hover:border-accent/30'"
            @click="showFilters = !showFilters"
          >
            <Filter class="w-4 h-4" />
            Фильтры
          </button>
        </div>
      </div>

      <Transition name="slide">
        <div v-if="showFilters" class="flex flex-wrap gap-1.5 mb-4">
          <button
            v-for="cat in categoryOptions"
            :key="cat.value"
            class="font-body text-[0.75rem] px-3.5 py-2 rounded-full border cursor-pointer transition-all duration-200"
            :class="categoryFilter === cat.value
              ? 'bg-accent/20 border-accent/40 text-accent-dark font-bold'
              : 'bg-white/35 border-white/50 text-primary-light hover:border-accent/30'"
            @click="categoryFilter = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>
      </Transition>

      <div class="flex items-center gap-4 mb-5">
        <span class="font-body text-[0.78rem] text-primary-light">
          {{ mapStore.total }} {{ mapStore.total === 1 ? 'локация' : 'локаций' }}
        </span>
        <div class="flex gap-3">
          <span v-for="(color, level) in densityColors" :key="level" class="flex items-center gap-1 font-body text-[0.68rem] text-primary-light">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: color }"></span>
            {{ densityLabels[level] }}
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
          <div class="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/5">
            <svg class="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
              <path
                d="M100,200 Q200,80 400,100 Q550,110 650,180 Q700,220 680,300 Q650,380 500,400 Q350,420 200,380 Q120,340 100,200Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                class="text-primary/10"
              />
              <path
                d="M50,250 Q80,200 100,200 Q120,340 200,380 Q180,420 100,400 Q50,350 50,250Z"
                fill="currentColor"
                class="text-blue-500/5"
              />

              <g v-for="point in mapStore.points" :key="point.id">
                <circle
                  :cx="50 + ((point.longitude - 36.5) / 4.5) * 700"
                  :cy="450 - ((point.latitude - 43.5) / 2) * 400"
                  :r="mapStore.selectedPointId === point.id ? 10 : 7"
                  :fill="densityColors[point.density_level] || '#A4BE4F'"
                  :stroke="mapStore.selectedPointId === point.id ? '#fff' : 'transparent'"
                  stroke-width="2"
                  class="cursor-pointer transition-all duration-200 hover:opacity-80"
                  :opacity="mapStore.selectedPointId && mapStore.selectedPointId !== point.id ? 0.4 : 0.85"
                  @click="selectPoint(point.id)"
                />
                <text
                  v-if="mapStore.selectedPointId === point.id"
                  :x="50 + ((point.longitude - 36.5) / 4.5) * 700"
                  :y="450 - ((point.latitude - 43.5) / 2) * 400 - 16"
                  text-anchor="middle"
                  class="font-body text-[11px] fill-primary font-bold"
                >
                  {{ point.name.length > 20 ? point.name.slice(0, 20) + '…' : point.name }}
                </text>
              </g>
            </svg>
          </div>

          <div v-if="mapStore.points.length === 0" class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <MapPin class="w-10 h-10 text-primary-light opacity-30 mx-auto mb-2" />
              <p class="font-body text-[0.85rem] text-primary-light">Нет локаций по фильтру</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2 max-h-[520px] max-lg:max-h-[300px] overflow-y-auto pr-1">
          <div
            v-for="point in mapStore.points"
            :key="point.id"
            class="flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer"
            :class="mapStore.selectedPointId === point.id
              ? 'bg-accent/10 border-accent/30'
              : 'bg-white/35 border-white/50 hover:border-accent/20'"
            @click="selectPoint(point.id)"
          >
            <span
              class="w-3 h-3 rounded-full shrink-0"
              :style="{ backgroundColor: densityColors[point.density_level] || '#A4BE4F' }"
            ></span>
            <div class="flex-1 min-w-0">
              <p class="font-body font-bold text-[0.82rem] text-primary truncate">{{ point.name }}</p>
              <p class="font-body text-[0.68rem] text-primary-light capitalize">{{ point.category }}</p>
            </div>
            <NuxtLink
              :to="`/location/${point.id}`"
              class="text-accent-dark hover:text-accent transition-colors shrink-0"
              @click.stop
            >
              <ExternalLink class="w-4 h-4" />
            </NuxtLink>
          </div>

          <div v-if="mapStore.points.length === 0 && !mapStore.loading" class="py-8 text-center">
            <p class="font-body text-[0.82rem] text-primary-light">Нет точек</p>
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
