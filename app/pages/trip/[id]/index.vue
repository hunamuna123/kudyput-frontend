<script setup lang="ts">
import { useTripsStore, type TripRoute } from "~~/store/trips";
import {
  Car, Bus, Footprints, Bike, Users, Wallet, CalendarIcon,
  ArrowLeft, Link2, Copy, User, Loader2, AlertCircle, ChevronRight,
  Navigation, Sparkles, MapPin, Clock, Ruler, Banknote, ToggleRight, Settings, ChevronDown, ChevronUp,
} from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

const route = useRoute();
const tripId = route.params.id as string;

const tripsStore = useTripsStore();
const copiedInvite = ref(false);

useHead({
  title: computed(() =>
    tripsStore.currentTrip
      ? `Поездка ${formatDate(tripsStore.currentTrip.date_from)} — ${formatDate(tripsStore.currentTrip.date_to)}`
      : "Поездка - КудыТуды"
  ),
});

const transportLabels: Record<string, string> = {
  car: "Авто",
  public: "Общественный",
  walk: "Пешком",
  bike: "Велосипед",
};

const transportIcons: Record<string, typeof Car> = {
  car: Car,
  public: Bus,
  walk: Footprints,
  bike: Bike,
};

const statusLabels: Record<string, string> = {
  planning: "Планирование",
  active: "Активна",
  completed: "Завершена",
  cancelled: "Отменена",
};

const statusBadgeClass: Record<string, string> = {
  planning: "bg-yellow-500/15 text-yellow-700",
  active: "bg-green-500/15 text-green-700",
  completed: "bg-primary/6 text-primary-light",
  cancelled: "bg-red-500/15 text-red-700",
};

const categoryEmoji: Record<string, string> = {
  winery: "🍷", farm: "🐐", trail: "🥾", gastro: "🍽", nature: "🌿",
  camping: "🏕", resort: "🏖", extreme: "⚡", cultural: "🏛", beach: "🌊",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInviteUrl(): string {
  if (!tripsStore.currentTrip) return "";
  return `${window.location.origin}/trip/${tripsStore.currentTrip.id}/join?token=${tripsStore.currentTrip.invite_token}`;
}

async function copyInvite() {
  try {
    await navigator.clipboard.writeText(getInviteUrl());
    copiedInvite.value = true;
    setTimeout(() => (copiedInvite.value = false), 2000);
  } catch {
    /* noop */
  }
}

// Route builder
const showRouteSettings = ref(false);
const maxPoints = ref(0);
const optimize = ref(true);
const routeError = ref<string | null>(null);

const timeSlotLabels: Record<string, string> = {
  morning: "🌅 Утро",
  afternoon: "☀️ День",
  evening: "🌙 Вечер",
};

const audienceLabels: Record<string, string> = {
  all: "Все",
  adults: "Взрослые",
  children: "Дети",
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

async function buildRoute() {
  routeError.value = null;
  const result = await tripsStore.buildTripRoute(tripId, {
    location_ids: [],
    max_points: maxPoints.value,
    optimize: optimize.value,
  });
  if (!result) {
    routeError.value = tripsStore.error || "Не удалось построить маршрут";
  }
}

function formatTime(min: number): string {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}ч ${m}мин` : `${m}мин`;
}

function formatDist(km: number): string {
  if (!km) return "—";
  return km >= 1 ? `${km.toFixed(1)} км` : `${Math.round(km * 1000)} м`;
}

function formatCost(rub: number): string {
  if (!rub) return "—";
  return `${rub.toLocaleString("ru-RU")} ₽`;
}

onMounted(async () => {
  await tripsStore.fetchTrip(tripId);
  await tripsStore.fetchTripMembers(tripId);
});
</script>

<template>
  <div class="w-full">
    <NuxtLink
      to="/profile/trips"
      class="inline-flex items-center gap-1.5 font-body text-base text-primary-light hover:text-accent-dark transition-colors no-underline mb-6"
    >
      <ArrowLeft class="w-4 h-4" />
      Все поездки
    </NuxtLink>

    <div v-if="tripsStore.loading && !tripsStore.currentTrip" class="flex flex-col items-center gap-3 py-20">
      <Loader2 class="w-8 h-8 text-accent animate-spin" />
      <span class="font-body text-base text-primary-light">Загрузка поездки...</span>
    </div>

    <!-- Access Denied (403) -->
    <div v-else-if="tripsStore.accessDenied" class="flex flex-col items-center gap-4 py-20">
      <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertCircle class="w-8 h-8 text-red-500" />
      </div>
      <h2 class="font-heading text-2xl text-primary m-0">Нет доступа</h2>
      <p class="font-body text-base text-primary-light text-center max-w-sm">
        У вас нет доступа к этой поездке. Попросите организатора отправить вам ссылку-приглашение.
      </p>
      <NuxtLink
        to="/profile/trips"
        class="font-body font-bold text-base text-accent-dark hover:text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-2xl px-6 py-3 no-underline transition-all mt-2"
      >
        ← Мои поездки
      </NuxtLink>
    </div>

    <div v-else-if="tripsStore.error && !tripsStore.currentTrip" class="flex flex-col items-center gap-3 py-20">
      <UiAlert variant="destructive" class="rounded-2xl max-w-md">
        <AlertCircle class="h-4 w-4" />
        <UiAlertDescription>{{ tripsStore.error }}</UiAlertDescription>
      </UiAlert>
      <NuxtLink
        to="/profile/trips"
        class="font-body text-base text-accent-dark hover:text-accent transition-colors no-underline mt-2"
      >
        Вернуться к поездкам
      </NuxtLink>
    </div>

    <div v-else-if="tripsStore.currentTrip" class="flex flex-col gap-5">
      <div class="bg-white/35 border border-accent/40 rounded-3xl p-8">
        <div class="flex items-start justify-between gap-3 mb-5">
          <div class="flex flex-col gap-1">
            <h1 class="font-heading text-2xl text-primary m-0">
              {{ formatDate(tripsStore.currentTrip.date_from) }} — {{ formatDate(tripsStore.currentTrip.date_to) }}
            </h1>
            <span class="font-body text-sm text-primary-light">
              ID: {{ tripsStore.currentTrip.id }}
            </span>
          </div>
          <UiBadge
            variant="secondary"
            class="rounded-lg text-sm font-bold shrink-0"
            :class="statusBadgeClass[tripsStore.currentTrip.status] || 'bg-primary/6 text-primary-light'"
          >
            {{ statusLabels[tripsStore.currentTrip.status] || tripsStore.currentTrip.status }}
          </UiBadge>
        </div>

        <div class="grid grid-cols-3 max-sm:grid-cols-1 gap-4">
          <div class="flex items-center gap-2.5 bg-white/40 border border-accent/20 rounded-2xl px-5 py-4">
            <component
              :is="transportIcons[tripsStore.currentTrip.transport] || Car"
              class="w-5 h-5 text-accent-dark shrink-0"
            />
            <div class="flex flex-col">
              <span class="font-body text-sm text-primary-light">Транспорт</span>
              <span class="font-body font-bold text-md text-primary">
                {{ transportLabels[tripsStore.currentTrip.transport] || tripsStore.currentTrip.transport }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2.5 bg-white/40 border border-accent/20 rounded-2xl px-5 py-4">
            <Users class="w-5 h-5 text-accent-dark shrink-0" />
            <div class="flex flex-col">
              <span class="font-body text-sm text-primary-light">Группа</span>
              <span class="font-body font-bold text-md text-primary">
                {{ tripsStore.currentTrip.group_size }} чел.
              </span>
            </div>
          </div>

          <div v-if="tripsStore.currentTrip.budget_rub" class="flex items-center gap-2.5 bg-white/40 border border-accent/20 rounded-2xl px-5 py-4">
            <Wallet class="w-5 h-5 text-accent-dark shrink-0" />
            <div class="flex flex-col">
              <span class="font-body text-sm text-primary-light">Бюджет</span>
              <span class="font-body font-bold text-md text-primary">
                {{ tripsStore.currentTrip.budget_rub.toLocaleString("ru-RU") }} ₽
              </span>
            </div>
          </div>
        </div>

        <div v-if="tripsStore.currentTrip.invite_token" class="flex items-center gap-2 mt-5 pt-5 border-t border-accent/20">
          <Link2 class="w-4 h-4 text-accent-dark shrink-0" />
          <span class="font-body text-sm text-primary-light shrink-0">Пригласить:</span>
          <input
            :value="getInviteUrl()"
            readonly
            class="font-mono text-sm text-primary bg-white/60 border border-accent/40 rounded-lg px-2.5 py-1.5 flex-1 min-w-0 truncate"
          />
          <button
            class="font-body font-bold text-sm text-accent-dark bg-accent/10 hover:bg-accent/20 border-none rounded-lg px-3 py-1.5 cursor-pointer transition-colors shrink-0"
            @click="copyInvite"
          >
            <Copy class="w-3 h-3 inline mr-1" />
            {{ copiedInvite ? "Скопировано ✓" : "Копировать" }}
          </button>
        </div>
      </div>

      <div class="bg-white/35 border border-accent/40 rounded-3xl p-8">
        <h2 class="font-body font-bold text-2xl text-primary m-0 mb-5">Участники</h2>

        <div v-if="tripsStore.loading && tripsStore.currentMembers.length === 0" class="flex items-center gap-2 py-4">
          <Loader2 class="w-4 h-4 text-accent animate-spin" />
          <span class="font-body text-base text-primary-light">Загрузка участников...</span>
        </div>

        <div v-else-if="tripsStore.currentMembers.length === 0" class="flex flex-col items-center gap-2 py-6">
          <Users class="w-8 h-8 text-primary-light opacity-30" />
          <span class="font-body text-base text-primary-light">Участников пока нет</span>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="member in tripsStore.currentMembers"
            :key="member.id"
            class="flex items-center gap-3 bg-white/40 border border-accent/20 rounded-2xl px-5 py-3.5 transition-all duration-200 hover:border-accent/40"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="member.role === 'creator' ? 'bg-accent/20' : 'bg-primary/8'"
            >
              <User
                class="w-5 h-5"
                :class="member.role === 'creator' ? 'text-accent-dark' : 'text-primary-light'"
              />
            </div>
            <div class="flex-1 min-w-0">
              <span class="font-body font-bold text-md text-primary block truncate">
                {{ member.display_name || "Без имени" }}
              </span>
              <div class="flex items-center gap-2 mt-0.5">
                <span
                  v-if="member.role === 'creator'"
                  class="font-body text-xs font-bold text-accent-dark bg-accent/10 rounded px-1.5 py-0.5"
                >
                  Создатель
                </span>
                <span
                  v-if="member.is_child"
                  class="font-body text-xs font-bold text-blue-600 bg-blue-500/10 rounded px-1.5 py-0.5"
                >
                  Ребёнок
                </span>
              </div>
            </div>
            <div v-if="member.tags?.length" class="flex flex-wrap gap-1 justify-end max-w-[150px]">
              <span
                v-for="tag in member.tags"
                :key="tag"
                class="font-body text-xs text-primary-light bg-primary/6 rounded-full px-2 py-0.5"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trip-Aware Route Builder -->
      <div class="bg-gradient-to-br from-primary/5 to-accent/8 border border-accent/40 rounded-3xl p-8">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 flex items-center justify-center rounded-[12px] bg-accent/15 text-accent-dark">
              <Navigation class="w-5 h-5" />
            </div>
            <div>
              <h2 class="font-body font-bold text-2xl text-primary m-0">Маршрут поездки</h2>
              <p class="font-body text-sm text-primary-light m-0">ИИ подберёт локации по вашему vibe-профилю</p>
            </div>
          </div>
          <button
            @click="showRouteSettings = !showRouteSettings"
            class="flex items-center gap-1 font-body text-sm text-primary-light hover:text-accent-dark bg-white/50 border border-accent/20 rounded-xl px-3 py-1.5 transition-colors cursor-pointer"
          >
            <Settings class="w-3.5 h-3.5" />
            <span class="max-sm:hidden">Настройки</span>
            <ChevronDown v-if="!showRouteSettings" class="w-3.5 h-3.5" />
            <ChevronUp v-else class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Settings Panel -->
        <div v-if="showRouteSettings" class="bg-white/50 border border-accent/20 rounded-2xl p-5 mb-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Макс. точек</label>
              <div class="flex items-center gap-3">
                <button @click="maxPoints = Math.max(0, maxPoints - 1)" class="w-8 h-8 rounded-lg bg-primary/6 flex items-center justify-center font-body font-bold text-primary hover:bg-primary/12 transition-colors cursor-pointer">−</button>
                <span class="font-body font-bold text-lg text-primary w-8 text-center">{{ maxPoints || '∞' }}</span>
                <button @click="maxPoints = Math.min(20, maxPoints + 1)" class="w-8 h-8 rounded-lg bg-primary/6 flex items-center justify-center font-body font-bold text-primary hover:bg-primary/12 transition-colors cursor-pointer">+</button>
              </div>
              <span class="font-body text-xs text-primary-light">0 = определяется автоматически</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Оптимизация маршрута</label>
              <button
                @click="optimize = !optimize"
                class="self-start flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
              >
                <div
                  class="w-11 h-6 rounded-full flex items-center px-0.5 transition-colors duration-300"
                  :class="optimize ? 'bg-accent' : 'bg-primary/15'"
                >
                  <div
                    class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300"
                    :class="optimize ? 'translate-x-5' : 'translate-x-0'"
                  />
                </div>
                <span class="font-body text-base text-primary">{{ optimize ? 'Вкл' : 'Выкл' }}</span>
              </button>
              <span class="font-body text-xs text-primary-light">Оптимальный порядок точек</span>
            </div>
          </div>
        </div>

        <!-- Error -->
        <UiAlert v-if="routeError" variant="destructive" class="rounded-2xl mb-4">
          <AlertCircle class="h-4 w-4" />
          <UiAlertDescription>{{ routeError }}</UiAlertDescription>
        </UiAlert>

        <!-- Build Button -->
        <button
          v-if="!tripsStore.tripRoute"
          :disabled="tripsStore.routeLoading"
          @click="buildRoute"
          class="w-full flex items-center justify-center gap-3 font-body font-bold text-lg text-white bg-accent rounded-2xl px-6 py-4 transition-all duration-300 hover:bg-accent-dark hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
        >
          <Loader2 v-if="tripsStore.routeLoading" class="w-5 h-5 animate-spin" />
          <Sparkles v-else class="w-5 h-5" />
          {{ tripsStore.routeLoading ? 'ИИ строит маршрут…' : 'Построить маршрут с ИИ' }}
        </button>

        <!-- Route Result -->
        <div v-if="tripsStore.tripRoute" class="flex flex-col gap-4">

          <!-- Route Header -->
          <div class="bg-white/60 border border-accent/20 rounded-2xl p-5">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 class="font-body font-bold text-xl text-primary m-0">{{ tripsStore.tripRoute.name || 'Маршрут' }}</h3>
                <p v-if="tripsStore.tripRoute.summary" class="font-body text-base text-primary-light mt-1 m-0 line-clamp-2">{{ tripsStore.tripRoute.summary }}</p>
              </div>
              <UiBadge
                variant="secondary"
                class="rounded-lg text-xs font-bold shrink-0 bg-accent/12 text-accent-dark"
              >
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
                  <span class="font-body font-bold text-base text-primary">{{ formatDist(tripsStore.tripRoute.total_distance_km) }}</span>
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

          <!-- Route Points by Day -->
          <div v-if="groupedByDay.length" class="flex flex-col gap-4">
            <div v-for="dayGroup in groupedByDay" :key="dayGroup.day" class="bg-white/60 border border-accent/20 rounded-2xl p-5">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                  <span class="font-body font-bold text-sm text-primary">{{ dayGroup.day }}</span>
                </div>
                <h4 class="font-body font-bold text-lg text-primary m-0">День {{ dayGroup.day }}</h4>
                <span class="font-body text-xs text-primary-light">· {{ dayGroup.points.length }} {{ dayGroup.points.length === 1 ? 'точка' : dayGroup.points.length < 5 ? 'точки' : 'точек' }}</span>
              </div>

              <div class="flex flex-col gap-0">
                <div
                  v-for="(point, idx) in dayGroup.points"
                  :key="point.id || point.location_id || idx"
                  class="flex gap-3"
                >
                  <div class="flex flex-col items-center shrink-0">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center text-white font-body font-bold text-xs shrink-0"
                      :class="idx === 0 ? 'bg-accent' : 'bg-primary/60'"
                    >
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
                        <ChevronRight class="w-4 h-4 text-primary-light group-hover:text-accent-dark group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>

                      <div class="flex items-center gap-2 flex-wrap mb-1">
                        <span v-if="point.time_slot" class="font-body text-xs font-bold text-primary-light bg-yellow-500/10 rounded-full px-2 py-0.5">
                          {{ timeSlotLabels[point.time_slot] || point.time_slot }}
                        </span>
                        <span
                          v-if="point.target_audience && point.target_audience !== 'all'"
                          class="font-body text-xs font-bold rounded-full px-2 py-0.5"
                          :class="audienceClass[point.target_audience] || 'bg-primary/6 text-primary-light'"
                        >
                          {{ audienceLabels[point.target_audience] || point.target_audience }}
                        </span>
                      </div>

                      <div class="flex items-center gap-3 flex-wrap">
                        <span v-if="point.stay_duration_min" class="font-body text-xs text-primary-light flex items-center gap-1">
                          <Clock class="w-3 h-3" /> {{ formatTime(point.stay_duration_min) }}
                        </span>
                        <span v-if="point.travel_km" class="font-body text-xs text-primary-light flex items-center gap-1">
                          <Ruler class="w-3 h-3" /> {{ formatDist(point.travel_km) }}
                        </span>
                        <span v-if="point.travel_time_min" class="font-body text-xs text-primary-light flex items-center gap-1">
                          🚗 {{ formatTime(point.travel_time_min) }}
                        </span>
                        <span v-if="point.vibe_score" class="font-body text-xs text-accent-dark bg-accent/10 rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Sparkles class="w-3 h-3" /> {{ Math.round(point.vibe_score * 100) }}%
                        </span>
                      </div>
                    </NuxtLink>
                    <div v-else class="bg-white/50 border border-accent/15 rounded-xl p-4">
                      <span class="font-body font-bold text-base text-primary">{{ point.name || `Точка ${idx + 1}` }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rebuild Button -->
          <button
            :disabled="tripsStore.routeLoading"
            @click="buildRoute"
            class="w-full flex items-center justify-center gap-2 font-body font-bold text-base text-accent-dark bg-white/50 border border-accent/20 rounded-2xl px-6 py-3.5 hover:bg-accent/10 hover:border-accent/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="tripsStore.routeLoading" class="w-4 h-4 animate-spin" />
            <Sparkles v-else class="w-4 h-4" />
            Перестроить маршрут
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
