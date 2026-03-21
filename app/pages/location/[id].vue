<script setup lang="ts">
import { MapPin, Tag, Wallet, Users, Star, ArrowLeft, ArrowRight, Navigation, Loader2, Box, Heart, CalendarCheck, Route, X } from "lucide-vue-next";
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

const loadingSplat = ref(false);
const showSplat = ref(false);
const splatUrl = ref<string | null>(null);

async function openSplat() {
  if (splatUrl.value) {
    showSplat.value = true;
    return;
  }
  loadingSplat.value = true;
  const data = await locationsStore.fetchLocationSplat(locationId);
  if (data?.splat_url) {
    splatUrl.value = data.splat_url;
    showSplat.value = true;
  }
  loadingSplat.value = false;
}

onMounted(async () => {
  authStore.restoreSession();
  await locationsStore.fetchLocationById(locationId);
});
</script>

<template>
  <div class="min-h-screen bg-[#FDFDFD] relative overflow-hidden flex flex-col">
    <!-- Modal for 3D Splatting Preview -->
    <div v-if="showSplat" class="fixed inset-0 z-50 bg-black/90 flex flex-col" style="touch-action: none;">
      <div class="flex items-center justify-between p-4 text-white">
        <h3 class="font-heading text-lg">3D Viewer: {{ locationsStore.currentLocation?.name }}</h3>
        <button @click="showSplat = false" class="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>
      <div class="flex-1 relative bg-black/50">
        <ClientOnly>
          <MapSplatViewer v-if="splatUrl" :splat-url="splatUrl" class="w-full h-full" />
        </ClientOnly>
        <div v-if="!splatUrl" class="absolute inset-0 flex items-center justify-center">
          <Loader2 class="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="locationsStore.loading" class="flex-1 flex flex-col items-center justify-center gap-4 py-20">
      <Loader2 class="w-10 h-10 text-accent animate-spin" />
      <p class="font-body text-primary-light text-[0.9rem]">Загрузка локации…</p>
    </div>

    <!-- Error State -->
    <div v-else-if="locationsStore.error" class="flex-1 flex flex-col items-center justify-center gap-4 py-20">
      <span class="text-5xl">😔</span>
      <p class="font-body text-red-600 text-[0.9rem]">{{ locationsStore.error }}</p>
      <NuxtLink to="/map" class="font-body font-bold text-accent-dark border-b border-accent-dark pb-0.5 hover:text-accent">
        Вернуться к списку
      </NuxtLink>
    </div>

    <!-- Content State -->
    <div v-else-if="locationsStore.currentLocation" class="flex-1 w-full pb-20">
      <!-- Hero Image Wrapper -->
      <div class="relative w-full h-[45vh] lg:h-[55vh] bg-accent/10">
        <img
          v-if="locationsStore.currentLocation.preview_image_url"
          :src="locationsStore.currentLocation.preview_image_url"
          alt="Location Hero"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <span class="text-7xl opacity-50">{{ categoryEmoji[locationsStore.currentLocation.category] || '📍' }}</span>
        </div>
        
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

        <!-- Top Nav -->
        <div class="absolute top-0 left-0 right-0 p-4 lg:p-6 flex justify-between z-10">
          <NuxtLink to="/map" class="flex items-center justify-center w-11 h-11 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors">
            <ArrowLeft class="w-5 h-5" />
          </NuxtLink>
          <div class="flex gap-2">
            <button class="flex items-center justify-center w-11 h-11 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 hover:text-red-400 transition-colors">
              <Heart class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Title overlay on Hero -->
        <div class="absolute bottom-0 left-0 right-0 p-5 lg:px-8 pb-10 flex flex-col gap-2 z-10 text-white container mx-auto" style="max-width: 1000px;">
          <div class="flex items-center gap-3 mb-1">
            <UiBadge
              v-if="locationsStore.currentLocation.density_level"
              class="rounded-xl px-3 py-1 font-body font-bold text-[0.7rem] uppercase tracking-wider backdrop-blur-md border border-white/20"
              :class="densityClass[locationsStore.currentLocation.density_level] || ''"
            >
              {{ densityLabels[locationsStore.currentLocation.density_level] || locationsStore.currentLocation.density_level }}
            </UiBadge>
            <div
              v-if="locationsStore.currentLocation.access_level === 'hidden'"
              class="flex items-center gap-1.5 font-body font-bold text-[0.7rem] uppercase tracking-wider bg-yellow-500/80 text-white px-3 py-1 rounded-xl backdrop-blur-md"
            >
              <Star class="w-3 h-3 text-white" />
              Секретно
            </div>
          </div>
          <h1 class="font-heading text-4xl lg:text-6xl text-white leading-tight drop-shadow-md">
            {{ locationsStore.currentLocation.name }}
          </h1>
          <p class="font-body text-white/90 text-[0.9rem] lg:text-base max-w-2xl drop-shadow line-clamp-2 mt-1">
            {{ locationsStore.currentLocation.description_short }}
          </p>
        </div>
      </div>

      <!-- Main Container (pulled up slightly) -->
      <div class="relative z-20 container mx-auto px-4 -mt-6" style="max-width: 1000px;">
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <!-- Left Column (Main Info) -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            
            <!-- Quick Info Ribbon -->
            <div class="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5 flex overflow-x-auto snap-x hide-scrollbar gap-4 items-center">
              <div class="flex flex-col gap-1 pr-4 border-r border-primary/10 shrink-0">
                <span class="font-body text-[0.7rem] text-primary-light uppercase tracking-wider">Категория</span>
                <div class="flex items-center gap-1.5 font-body font-medium text-primary text-[0.9rem]">
                  <span class="text-lg">{{ categoryEmoji[locationsStore.currentLocation.category] || '📍' }}</span>
                  <span class="capitalize">{{ locationsStore.currentLocation.category }}</span>
                </div>
              </div>
              
              <div class="flex flex-col gap-1 pr-4 border-r border-primary/10 shrink-0">
                <span class="font-body text-[0.7rem] text-primary-light uppercase tracking-wider">Цена</span>
                <div class="flex items-center gap-1.5 font-body font-bold text-primary text-[0.9rem]">
                  <Wallet class="w-4 h-4 text-accent" />
                  {{ formatPrice(locationsStore.currentLocation.price_per_night) }}
                </div>
              </div>
              
              <div class="flex flex-col gap-1 pr-4 border-r lg:border-none border-primary/10 shrink-0">
                <span class="font-body text-[0.7rem] text-primary-light uppercase tracking-wider">Вместимость</span>
                <div class="flex items-center gap-1.5 font-body font-medium text-primary text-[0.9rem]">
                  <Users class="w-4 h-4 text-accent" />
                  До {{ locationsStore.currentLocation.capacity || '?' }} чел.
                </div>
              </div>
              
              <div v-if="locationsStore.currentLocation.child_friendly" class="flex flex-col gap-1 shrink-0">
                <span class="font-body text-[0.7rem] text-primary-light uppercase tracking-wider">С детьми</span>
                <div class="flex items-center gap-1.5 font-body font-medium text-primary text-[0.9rem]">
                  👶 Подходит
                </div>
              </div>
            </div>

            <!-- About Section -->
            <div class="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5">
              <h2 class="font-heading text-xl lg:text-2xl text-primary mb-4">О месте</h2>
              <p class="font-body text-[0.95rem] text-primary/80 leading-relaxed whitespace-pre-line">
                {{ locationsStore.currentLocation.description_full || locationsStore.currentLocation.description_short }}
              </p>
              
              <!-- Tags -->
              <div v-if="locationsStore.currentLocation.tags?.length" class="flex flex-wrap gap-2 mt-6 pt-6 border-t border-primary/5">
                <span
                  v-for="tag in locationsStore.currentLocation.tags"
                  :key="tag"
                  class="font-body font-semibold text-[0.75rem] text-accent-dark bg-accent/10 px-3 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <Tag class="w-3 h-3" />
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Gallery Section -->
            <div v-if="locationsStore.currentLocation.gallery_urls?.length" class="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5 overflow-hidden">
              <h2 class="font-heading text-xl lg:text-2xl text-primary mb-5">Фотографии</h2>
              <div class="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                <div 
                  v-for="(imgUrl, i) in locationsStore.currentLocation.gallery_urls" 
                  :key="i"
                  class="w-64 h-48 lg:w-72 lg:h-52 shrink-0 snap-center rounded-2xl overflow-hidden shadow-sm"
                >
                  <img :src="imgUrl" alt="Gallery photo" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column (Action Cards) -->
          <div class="flex flex-col gap-5">
            
            <!-- 3D Entry Action -->
            <div 
              v-if="locationsStore.currentLocation.splat_url || locationsStore.currentLocation.has_splat" 
              class="bg-gradient-to-br from-[#285A71] to-[#1a3d4d] rounded-3xl p-1 shadow-lg relative overflow-hidden group"
            >
              <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div class="bg-white/5 backdrop-blur-md rounded-[1.3rem] p-6 text-white border border-white/10 relative z-10 flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 ring-1 ring-white/20 group-hover:scale-110 group-hover:bg-accent/80 transition-all duration-300">
                  <Box class="w-8 h-8 text-white" />
                </div>
                <h3 class="font-heading text-lg mb-2">3D-слепок локации</h3>
                <p class="font-body text-[0.8rem] text-white/70 mb-5 leading-relaxed">
                  Мы отсканировали это место. Прогуляйтесь по нему прямо сейчас.
                </p>
                <button
                  @click="openSplat"
                  :disabled="loadingSplat"
                  class="w-[80%] flex items-center justify-center gap-2 font-body font-bold text-[0.85rem] text-white bg-accent rounded-xl px-5 py-3 hover:bg-accent-light transition-colors disabled:opacity-50"
                >
                  <Loader2 v-if="loadingSplat" class="w-4 h-4 animate-spin" />
                  <span v-else>Войти в 3D</span>
                  <ArrowRight v-if="!loadingSplat" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <!-- Booking Card -->
            <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-primary/5 flex flex-col">
              <div class="flex items-center justify-between mb-5 pb-5 border-b border-primary/5">
                <span class="font-body text-[0.9rem] text-primary">Итого за ночь</span>
                <span class="font-heading text-xl text-primary">{{ formatPrice(locationsStore.currentLocation.price_per_night) }}</span>
              </div>
              <button class="w-full flex items-center justify-center gap-2 font-body font-bold text-[0.95rem] text-white bg-primary rounded-2xl px-6 py-4 transition-all duration-300 hover:bg-primary-light hover:shadow-lg hover:-translate-y-0.5 mt-2">
                <CalendarCheck class="w-5 h-5" />
                Забронировать
              </button>
              <NuxtLink to="/trip/new" class="w-full mt-3 flex items-center justify-center gap-2 font-body font-bold text-[0.9rem] text-accent-dark bg-accent/10 border border-accent/20 rounded-2xl px-6 py-3.5 transition-all duration-300 hover:bg-accent/20 hover:border-accent/40 no-underline">
                <Route class="w-4 h-4" />
                В маршрут поездки
              </NuxtLink>
            </div>

            <!-- Location Meta -->
            <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5">
              <h3 class="font-heading text-lg text-primary mb-3 flex items-center gap-2">
                <Navigation class="w-5 h-5 text-accent" />
                Где это
              </h3>
              <p v-if="locationsStore.currentLocation.address" class="font-body text-[0.85rem] text-primary/80 mb-3 leading-relaxed">
                {{ locationsStore.currentLocation.address }}
              </p>
              <div class="bg-primary/5 rounded-xl p-3 flex w-full justify-between items-center relative overflow-hidden group">
                 <div class="absolute inset-0 border border-primary/10 rounded-xl"></div>
                 <div class="font-code text-[0.75rem] text-primary-light font-medium tracking-wide">
                   Координаты
                 </div>
                 <div class="font-code text-[0.8rem] text-primary font-semibold">
                   {{ locationsStore.currentLocation.latitude?.toFixed(5) }}, {{ locationsStore.currentLocation.longitude?.toFixed(5) }}
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
