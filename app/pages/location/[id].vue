<script setup lang="ts">
import { MapPin, Tag, Wallet, Users, Star, ArrowLeft, ArrowRight, Navigation, Loader2, Box, Heart, CalendarCheck, Route } from "lucide-vue-next";
import { useLocationsStore } from "~~/store/locations";
import { useAuthStore } from "~~/store/auth";

useHead({
  title: "Локация - КудыТуды",
});

const route = useRoute();
const locationsStore = useLocationsStore();
const authStore = useAuthStore();

const locationId = route.params.id as string;

const densityLabels: Record<string, string> = {
  green: "Hidden Gem 🌿",
  yellow: "Сезонная 🌤",
  red: "Популярная 🔥",
};

const densityClass: Record<string, string> = {
  green: "bg-green-500/15 text-green-700",
  yellow: "bg-yellow-500/15 text-yellow-700",
  red: "bg-red-500/15 text-red-700",
};

const categoryEmoji: Record<string, string> = {
  winery: "🍷",
  farm: "🐐",
  trail: "🥾",
  gastro: "🍽",
  nature: "🌿",
  camping: "🏕",
  resort: "🏖",
  extreme: "⚡",
  cultural: "🏛",
  beach: "🌊",
};

function formatPrice(price: number): string {
  if (!price) return "Бесплатно";
  return `${price.toLocaleString("ru-RU")} ₽ / ночь`;
}

onMounted(async () => {
  authStore.restoreSession();
  await locationsStore.fetchLocationById(locationId);
});
</script>

<template>
  <div class="min-h-screen bg-white border border-accent/40 relative overflow-hidden">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/8 top-[-100px] right-[-10%] blur-[120px] pointer-events-none"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 bottom-[-80px] left-[-5%] blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 mx-auto px-5 py-10" style="max-width: 1140px;">

      <NuxtLink to="/map" class="font-body text-[0.78rem] text-primary-light no-underline mb-8 inline-flex items-center gap-1.5 hover:text-primary transition-colors">
        <ArrowLeft class="w-3.5 h-3.5" />
        Назад к карте
      </NuxtLink>


      <div v-if="locationsStore.loading" class="flex flex-col items-center gap-4 py-20">
        <Loader2 class="w-8 h-8 text-accent-dark animate-spin" />
        <p class="font-body text-primary-light text-[0.85rem]">Загрузка…</p>
      </div>


      <div v-else-if="locationsStore.error" class="flex flex-col items-center gap-4 py-20">
        <span class="text-4xl">😔</span>
        <p class="font-body text-red-600 text-[0.88rem]">{{ locationsStore.error }}</p>
        <NuxtLink to="/dashboard/locations" class="font-body font-bold text-accent-dark no-underline hover:text-accent">
          Вернуться к списку
        </NuxtLink>
      </div>


      <div v-else-if="locationsStore.currentLocation" class="flex flex-col gap-6 mt-6">

        <div class="bg-white/50 border border-accent/40 rounded-3xl p-8 md:p-10">
          <div class="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <span class="text-3xl mr-2">{{ categoryEmoji[locationsStore.currentLocation.category] || '📍' }}</span>
              <h1 class="font-heading text-primary inline" style="font-size: clamp(1.4rem, 3vw, 2rem);">
                {{ locationsStore.currentLocation.name }}
              </h1>
            </div>
            <UiBadge
              v-if="locationsStore.currentLocation.density_level"
              class="rounded-lg text-[0.72rem] shrink-0"
              :class="densityClass[locationsStore.currentLocation.density_level] || ''"
            >
              {{ densityLabels[locationsStore.currentLocation.density_level] || locationsStore.currentLocation.density_level }}
            </UiBadge>
          </div>

          <p class="font-body text-[0.92rem] text-primary leading-relaxed mb-6">
            {{ locationsStore.currentLocation.description_full || locationsStore.currentLocation.description_short }}
          </p>


          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-if="locationsStore.currentLocation.category" class="flex items-center gap-2 p-3.5 bg-white/60 border border-accent/40 rounded-2xl">
              <Tag class="w-4 h-4 text-accent-dark shrink-0" />
              <span class="font-body text-[0.78rem] text-primary capitalize">{{ locationsStore.currentLocation.category }}</span>
            </div>
            <div v-if="locationsStore.currentLocation.address" class="flex items-center gap-2 p-3.5 bg-white/60 border border-accent/40 rounded-2xl">
              <MapPin class="w-4 h-4 text-accent-dark shrink-0" />
              <span class="font-body text-[0.78rem] text-primary truncate">{{ locationsStore.currentLocation.address }}</span>
            </div>
            <div class="flex items-center gap-2 p-3.5 bg-white/60 border border-accent/40 rounded-2xl">
              <Wallet class="w-4 h-4 text-accent-dark shrink-0" />
              <span class="font-body text-[0.78rem] text-primary">{{ formatPrice(locationsStore.currentLocation.price_per_night) }}</span>
            </div>
            <div v-if="locationsStore.currentLocation.capacity" class="flex items-center gap-2 p-3.5 bg-white/60 border border-accent/40 rounded-2xl">
              <Users class="w-4 h-4 text-accent-dark shrink-0" />
              <span class="font-body text-[0.78rem] text-primary">до {{ locationsStore.currentLocation.capacity }} чел.</span>
            </div>
          </div>
        </div>


        <div v-if="locationsStore.currentLocation.tags?.length" class="flex flex-wrap gap-2">
          <span
            v-for="tag in locationsStore.currentLocation.tags"
            :key="tag"
            class="font-body font-bold text-[0.72rem] text-accent-dark bg-accent/10 px-3.5 py-1.5 rounded-full"
          >
            #{{ tag }}
          </span>
        </div>


        <div class="flex gap-3 flex-wrap">
          <div
            v-if="locationsStore.currentLocation.child_friendly"
            class="flex items-center gap-1.5 font-body text-[0.78rem] text-primary-light px-4 py-2.5 bg-white/50 border border-accent/40 rounded-2xl"
          >
            👶 Подходит для детей
          </div>
          <div
            v-if="locationsStore.currentLocation.access_level === 'hidden'"
            class="flex items-center gap-1.5 font-body text-[0.78rem] text-primary-light px-4 py-2.5 bg-white/50 border border-accent/40 rounded-2xl"
          >
            <Star class="w-3.5 h-3.5 text-yellow-600" />
            Скрытая жемчужина — доступ по карме
          </div>
        </div>


        <div class="bg-white/50 border border-accent/40 rounded-3xl p-6 flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0">
            <Navigation class="w-6 h-6 text-primary" />
          </div>
          <div>
            <p class="font-body font-bold text-[0.85rem] text-primary mb-0.5">Координаты</p>
            <p class="font-body text-[0.78rem] text-primary-light">
              {{ locationsStore.currentLocation.latitude?.toFixed(4) }}, {{ locationsStore.currentLocation.longitude?.toFixed(4) }}
            </p>
          </div>
        </div>


        <div v-if="locationsStore.currentLocation.splat_url" class="bg-gradient-to-br from-primary/5 to-accent/8 border border-accent/20 rounded-3xl p-6 flex items-center gap-4 group cursor-pointer hover:border-accent/40 transition-all duration-200">
          <div class="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center shrink-0">
            <Box class="w-6 h-6 text-accent-dark" />
          </div>
          <div class="flex-1">
            <p class="font-body font-bold text-[0.88rem] text-primary mb-0.5">🧊 Войти в 3D</p>
            <p class="font-body text-[0.75rem] text-primary-light">Фотореалистичный 3D-слепок локации (Gaussian Splatting)</p>
          </div>
          <ArrowRight class="w-5 h-5 text-accent-dark group-hover:translate-x-1 transition-transform" />
        </div>


        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink
            to="/trip/new"
            class="flex-1 flex items-center justify-center gap-2 font-body font-bold text-[0.88rem] text-white bg-accent rounded-2xl px-6 py-3.5 no-underline transition-all duration-200 hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Route class="w-4 h-4" />
            Добавить в маршрут
          </NuxtLink>
          <button
            class="flex items-center justify-center gap-2 font-body font-bold text-[0.85rem] text-primary bg-transparent border-2 border-primary/20 rounded-2xl px-6 py-3.5 cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent-dark"
          >
            <Heart class="w-4 h-4" />
            В избранное
          </button>
        </div>


        <button
          class="w-full flex items-center justify-center gap-2 font-body font-bold text-[0.85rem] text-primary border-2 border-accent/30 bg-accent/5 rounded-2xl px-6 py-3.5 cursor-pointer transition-all duration-200 hover:bg-accent/15 hover:border-accent/50"
        >
          <CalendarCheck class="w-4 h-4 text-accent-dark" />
          Забронировать
        </button>


        <p class="font-body text-[0.68rem] text-primary-light opacity-40">
          ID: {{ locationsStore.currentLocation.id }} · Обновлено: {{ new Date(locationsStore.currentLocation.updated_at).toLocaleDateString("ru-RU") }}
        </p>
      </div>
    </div>
  </div>
</template>
