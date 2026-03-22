<script setup lang="ts">
import { TrendingUp, Loader2, RefreshCw, CalendarDays, BarChart3 } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Прогнозы нагрузки - КудыТуды",
});

interface PredictionEntry {
  date: string;
  expected_bookings: number;
  expected_visitors: number;
  load_percent: number;
}

const predictions = ref<PredictionEntry[]>([]);
const loading = ref(false);
const dataSource = ref<"api" | "mock">("api");

const maxBookings = computed(() => Math.max(1, ...predictions.value.map((p) => p.expected_bookings)));
const maxVisitors = computed(() => Math.max(1, ...predictions.value.map((p) => p.expected_visitors)));

function generateMockPredictions() {
  const entries: PredictionEntry[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 60 : 30;
    const bookings = base + Math.round(Math.random() * 40);
    const visitors = bookings * (3 + Math.round(Math.random() * 4));
    entries.push({
      date: d.toISOString().slice(0, 10),
      expected_bookings: bookings,
      expected_visitors: visitors,
      load_percent: Math.min(100, Math.round((bookings / 100) * 100)),
    });
  }
  return entries;
}

async function fetchPredictions() {
  loading.value = true;
  try {
    const { request } = useApiClient();
    const response = await request<{ success: boolean; data: PredictionEntry[] }>(
      "/api/v1/analytics/predictions",
    );
    if (response.data && response.data.length > 0) {
      predictions.value = response.data;
      dataSource.value = "api";
    } else {
      predictions.value = generateMockPredictions();
      dataSource.value = "mock";
    }
  } catch {
    predictions.value = generateMockPredictions();
    dataSource.value = "mock";
  } finally {
    loading.value = false;
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatWeekday(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { weekday: "short" });
}

function loadColor(pct: number): string {
  if (pct >= 80) return "bg-red-500";
  if (pct >= 60) return "bg-orange-400";
  if (pct >= 40) return "bg-yellow-400";
  return "bg-accent";
}

function loadTextColor(pct: number): string {
  if (pct >= 80) return "text-red-600";
  if (pct >= 60) return "text-orange-500";
  if (pct >= 40) return "text-yellow-600";
  return "text-accent-dark";
}

onMounted(fetchPredictions);
</script>

<template>
  <div class="w-full">

    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 flex items-center justify-center rounded-[12px] bg-purple-500/12 text-purple-700">
          <TrendingUp class="w-5 h-5" />
        </div>
        <div>
          <h1 class="font-body font-bold text-2xl text-primary">Прогноз нагрузки</h1>
          <p class="font-body text-sm text-primary-light">Ожидаемая загрузка на ближайшие 14 дней</p>
        </div>
      </div>
      <button
        class="flex items-center gap-1.5 font-body text-sm text-primary-light hover:text-accent-dark bg-white/50 border border-primary/10 rounded-xl px-3 py-2 cursor-pointer transition-colors"
        @click="fetchPredictions"
        :disabled="loading"
      >
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        Обновить
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 text-accent animate-spin" />
    </div>

    <template v-else>
      <!-- Quick Stats -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-white/35 border border-accent/40 rounded-3xl p-5 flex flex-col gap-1">
          <span class="font-body text-xs font-bold text-primary-light uppercase tracking-wider">Ср. броней/день</span>
          <span class="font-body font-bold text-2xl text-primary">
            {{ Math.round(predictions.reduce((s, p) => s + p.expected_bookings, 0) / Math.max(1, predictions.length)) }}
          </span>
        </div>
        <div class="bg-white/35 border border-accent/40 rounded-3xl p-5 flex flex-col gap-1">
          <span class="font-body text-xs font-bold text-primary-light uppercase tracking-wider">Пик нагрузки</span>
          <span class="font-body font-bold text-2xl text-primary">
            {{ Math.max(...predictions.map(p => p.load_percent)) }}%
          </span>
        </div>
        <div class="bg-white/35 border border-accent/40 rounded-3xl p-5 flex flex-col gap-1">
          <span class="font-body text-xs font-bold text-primary-light uppercase tracking-wider">Ожид. посетителей</span>
          <span class="font-body font-bold text-2xl text-primary">
            {{ predictions.reduce((s, p) => s + p.expected_visitors, 0).toLocaleString("ru-RU") }}
          </span>
        </div>
      </div>

      <!-- Bar Chart: Bookings -->
      <div class="bg-white/35 border border-accent/40 rounded-3xl p-6 mb-5">
        <div class="flex items-center gap-2 mb-5">
          <BarChart3 class="w-4 h-4 text-accent-dark" />
          <h2 class="font-body font-bold text-lg text-primary">Ожидаемые бронирования</h2>
        </div>
        <div class="flex items-end gap-1.5 h-[180px]">
          <div
            v-for="entry in predictions"
            :key="entry.date"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <span class="font-body text-2xs text-primary-light font-bold">{{ entry.expected_bookings }}</span>
            <div
              class="w-full rounded-t-lg transition-all duration-700 ease-out"
              :class="loadColor(entry.load_percent)"
              :style="{ height: `${Math.max(4, (entry.expected_bookings / maxBookings) * 140)}px` }"
            ></div>
            <span class="font-body text-2xs text-primary-light whitespace-nowrap">{{ formatDate(entry.date) }}</span>
            <span class="font-body text-3xs text-primary-light opacity-60 uppercase">{{ formatWeekday(entry.date) }}</span>
          </div>
        </div>
      </div>

      <!-- Load Timeline -->
      <div class="bg-white/35 border border-accent/40 rounded-3xl p-6">
        <div class="flex items-center gap-2 mb-5">
          <CalendarDays class="w-4 h-4 text-accent-dark" />
          <h2 class="font-body font-bold text-lg text-primary">Нагрузка по дням</h2>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="entry in predictions"
            :key="entry.date"
            class="flex items-center gap-3"
          >
            <span class="font-body text-sm text-primary-light w-16 shrink-0">{{ formatDate(entry.date) }}</span>
            <div class="flex-1 h-5 bg-primary/5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                :class="loadColor(entry.load_percent)"
                :style="{ width: `${entry.load_percent}%` }"
              ></div>
            </div>
            <span
              class="font-body font-bold text-sm w-10 text-right"
              :class="loadTextColor(entry.load_percent)"
            >{{ entry.load_percent }}%</span>
          </div>
        </div>
      </div>

      <p class="mt-3 font-body text-xs text-primary-light opacity-40">
        {{ dataSource === 'api' ? 'Данные из API аналитики' : 'Fallback: mock-данные (API недоступен)' }}
      </p>
    </template>
  </div>
</template>
