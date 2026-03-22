<script setup lang="ts">
import { Heart, MapPin, Loader2, Trash2 } from "lucide-vue-next";
import { useFavoritesStore } from "~~/store/favorites";
import { useLocationsStore, type Location } from "~~/store/locations";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Избранное - КудыТуды",
});

const favoritesStore = useFavoritesStore();
const locationsStore = useLocationsStore();

const favoriteLocations = ref<Location[]>([]);
const loading = ref(true);

const categoryEmoji: Record<string, string> = {
  winery: "🍷", farm: "🐐", trail: "🥾", gastro: "🍽", nature: "🌿",
  camping: "🏕", resort: "🏖", extreme: "⚡", cultural: "🏛", beach: "🌊",
};

async function loadFavorites() {
  loading.value = true;
  favoritesStore.load();

  if (favoritesStore.ids.length === 0) {
    loading.value = false;
    return;
  }

  const locations: Location[] = [];
  for (const id of favoritesStore.ids) {
    const loc = await locationsStore.fetchLocationById(id);
    if (loc) locations.push(loc);
  }
  favoriteLocations.value = locations;
  loading.value = false;
}

function removeFavorite(locationId: string) {
  favoritesStore.toggle(locationId);
  favoriteLocations.value = favoriteLocations.value.filter((l) => l.id !== locationId);
}

function formatPrice(price: number): string {
  if (!price) return "Бесплатно";
  return `${price.toLocaleString("ru-RU")} ₽`;
}

onMounted(loadFavorites);
</script>

<template>
  <div class="w-full max-w-[960px]">

    <div class="flex items-center gap-2.5 mb-6">
      <div class="w-10 h-10 flex items-center justify-center rounded-[12px] bg-red-500/12 text-red-500">
        <Heart class="w-5 h-5" />
      </div>
      <div>
        <h1 class="font-body font-bold text-2xl text-primary">Избранное</h1>
        <p class="font-body text-sm text-primary-light">{{ favoritesStore.count }} мест</p>
      </div>
    </div>


    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 text-accent animate-spin" />
    </div>


    <div v-else-if="favoriteLocations.length === 0" class="text-center py-16">
      <span class="text-5xl mb-4 block">💚</span>
      <h2 class="font-body font-bold text-2xl text-primary mb-2">Пока пусто</h2>
      <p class="font-body text-base text-primary-light mb-5">Нажимайте ❤️ на локациях, чтобы сохранить их сюда</p>
      <NuxtLink
        to="/map"
        class="inline-flex items-center gap-2 font-body font-bold text-base text-white bg-accent rounded-2xl px-6 py-3 no-underline hover:bg-accent-dark transition-colors"
      >
        <MapPin class="w-4 h-4" />
        Открыть карту
      </NuxtLink>
    </div>


    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="loc in favoriteLocations"
        :key="loc.id"
        class="bg-white/35 border border-accent/40 rounded-3xl overflow-hidden hover:border-accent/60 transition-colors group"
      >
        <NuxtLink :to="`/location/${loc.id}`" class="block no-underline">
          <div class="relative h-36 bg-accent/10">
            <img
              v-if="loc.preview_image_url"
              :src="loc.preview_image_url"
              :alt="loc.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="text-4xl opacity-50">{{ categoryEmoji[loc.category] || '📍' }}</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          <div class="p-4">
            <h3 class="font-body font-bold text-md text-primary truncate mb-1">{{ loc.name }}</h3>
            <p class="font-body text-sm text-primary-light truncate mb-2">{{ loc.description_short }}</p>
            <div class="flex items-center justify-between">
              <span class="font-body text-sm text-accent-dark capitalize">{{ loc.category }}</span>
              <span class="font-body font-bold text-sm text-primary">{{ formatPrice(loc.price_per_night) }}</span>
            </div>
          </div>
        </NuxtLink>

        <div class="px-4 pb-4 pt-0">
          <button
            @click="removeFavorite(loc.id)"
            class="w-full flex items-center justify-center gap-1.5 font-body text-sm text-red-500 bg-red-500/8 border border-red-500/15 rounded-xl py-2 hover:bg-red-500/15 transition-colors cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
            Убрать из избранного
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
