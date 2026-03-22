<script setup lang="ts">
import { Globe, Car, Sparkles, Route, MapPin, Heart, CalendarCheck, TrendingUp } from "lucide-vue-next";
import { useAuthStore } from "~~/store/auth";
import { useTripsStore } from "~~/store/trips";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Обзор - КудыТуды",
});

const authStore = useAuthStore();
const tripsStore = useTripsStore();

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
});

const quickLinks = [
  { label: "Карта", icon: Globe, to: "/map", desc: "Все локации на карте", color: "bg-accent/15 text-accent-dark" },
  { label: "Маршрут", icon: Route, to: "/route", desc: "Построить маршрут", color: "bg-primary/8 text-primary" },
  { label: "Начать", icon: Sparkles, to: "/start", desc: "Подбор по настроению", color: "bg-yellow-500/12 text-yellow-700" },
  { label: "Поездки", icon: Car, to: "/profile/trips", desc: "Мои поездки", color: "bg-blue-500/10 text-blue-600" },
  { label: "Избранное", icon: Heart, to: "/profile/favorites", desc: "Сохранённые места", color: "bg-red-500/10 text-red-500" },
  { label: "Бронирования", icon: CalendarCheck, to: "/profile/bookings", desc: "Мои брони", color: "bg-green-500/10 text-green-600" },
];

onMounted(async () => {
  authStore.restoreSession();
  tripsStore.fetchTrips();
});
</script>

<template>
  <div class="w-full max-w-4xl">
    <!-- Welcome -->
    <div class="mb-8">
      <h1 class="font-heading text-3xl text-primary mb-1">
        {{ greeting }}<span v-if="authStore.userName">, {{ authStore.userName }}</span> 👋
      </h1>
      <p class="font-body text-base text-primary-light">
        Чем займёмся сегодня?
      </p>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
      <NuxtLink
        v-for="link in quickLinks"
        :key="link.to"
        :to="link.to"
        class="group flex flex-col gap-3 p-5 bg-white/35 border border-accent/40 rounded-3xl no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-accent/30"
      >
        <div class="w-11 h-11 flex items-center justify-center rounded-[14px] shrink-0" :class="link.color">
          <component :is="link.icon" class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="font-body font-bold text-base text-primary">{{ link.label }}</span>
          <span class="font-body text-xs text-primary-light">{{ link.desc }}</span>
        </div>
      </NuxtLink>
    </div>

    <!-- Active Trips -->
    <div v-if="tripsStore.trips.length > 0" class="mb-6">
      <h2 class="font-body font-bold text-lg text-primary mb-3">Активные поездки</h2>
      <div class="flex flex-col gap-2">
        <NuxtLink
          v-for="trip in tripsStore.trips.slice(0, 3)"
          :key="trip.id"
          :to="`/trip/${trip.id}`"
          class="flex items-center gap-3 p-4 bg-white/35 border border-accent/40 rounded-2xl no-underline transition-all hover:border-accent/60 hover:bg-white/50"
        >
          <div class="w-9 h-9 flex items-center justify-center rounded-full bg-accent/15 shrink-0">
            <Car class="w-4 h-4 text-accent-dark" />
          </div>
          <div class="flex-1 min-w-0">
            <span class="font-body font-bold text-sm text-primary block truncate">
              {{ new Date(trip.date_from).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) }}
              — {{ new Date(trip.date_to).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) }}
            </span>
            <span class="font-body text-xs text-primary-light">{{ trip.group_size }} чел.</span>
          </div>
          <span
            class="font-body text-xs font-bold px-2 py-0.5 rounded-lg shrink-0"
            :class="trip.status === 'active' ? 'bg-green-500/15 text-green-700' : 'bg-yellow-500/15 text-yellow-700'"
          >
            {{ trip.status === 'active' ? 'Активна' : trip.status === 'planning' ? 'Планирование' : trip.status }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
