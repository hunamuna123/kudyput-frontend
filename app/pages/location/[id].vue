<script setup lang="ts">
import { MapPin, Tag, Wallet, Users, Star, ArrowLeft, ArrowRight, Navigation, Loader2, Box, Heart, CalendarCheck, Route, X, Check, Clock, Phone, User } from "lucide-vue-next";
import { useLocationsStore } from "~~/store/locations";
import { useAuthStore } from "~~/store/auth";
import { useBookingsStore } from "~~/store/bookings";
import { useFavoritesStore } from "~~/store/favorites";

useHead({
  title: "Локация - КудыТуды",
});

const route = useRoute();
const locationsStore = useLocationsStore();
const authStore = useAuthStore();
const bookingsStore = useBookingsStore();
const favoritesStore = useFavoritesStore();

const locationId = route.params.id as string;

const densityLabels: Record<string, string> = {
  green: "Hidden Gem 🌿",
  yellow: "Сезонная 🌤",
  red: "🔥 Популярная",
};

const densityClass: Record<string, string> = {
  green: "bg-green-500/15 text-green-700",
  yellow: "bg-yellow-500/15 text-yellow-700",
  red: "bg-orange-500/15 text-orange-700",
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

// Booking flow
const showBooking = ref(false);
const bookingDateFrom = ref("");
const bookingDateTo = ref("");
const bookingGuests = ref(2);
const bookingContactName = ref("");
const bookingContactPhone = ref("");
const bookingSubmitted = ref(false);
const bookingSubmitting = ref(false);
const bookingError = ref<string | null>(null);

function openBookingModal() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  bookingDateFrom.value = today.toISOString().slice(0, 10);
  bookingDateTo.value = tomorrow.toISOString().slice(0, 10);
  bookingGuests.value = 2;
  bookingContactName.value = authStore.user?.display_name || "";
  bookingContactPhone.value = "";
  bookingSubmitted.value = false;
  bookingError.value = null;
  showBooking.value = true;

  // Load slots for current month
  const month = bookingDateFrom.value.slice(0, 7);
  bookingsStore.fetchSlots(locationId, month);
}

async function submitBooking() {
  if (!bookingDateFrom.value || !bookingDateTo.value || !bookingContactName.value || !bookingContactPhone.value) return;
  const loc = locationsStore.currentLocation;
  if (!loc) return;

  bookingSubmitting.value = true;
  bookingError.value = null;

  const result = await bookingsStore.createBooking({
    location_id: loc.id,
    date_from: bookingDateFrom.value,
    date_to: bookingDateTo.value,
    guests_count: bookingGuests.value,
    contact_name: bookingContactName.value,
    contact_phone: bookingContactPhone.value,
  });

  bookingSubmitting.value = false;

  if (result) {
    bookingSubmitted.value = true;
  } else {
    bookingError.value = bookingsStore.error || "Не удалось создать бронирование";
  }
}

// Watch date changes to reload slots
watch(bookingDateFrom, (val) => {
  if (val && showBooking.value) {
    const month = val.slice(0, 7);
    bookingsStore.fetchSlots(locationId, month);
  }
});

const bookingNights = computed(() => {
  if (!bookingDateFrom.value || !bookingDateTo.value) return 1;
  const diff = new Date(bookingDateTo.value).getTime() - new Date(bookingDateFrom.value).getTime();
  return Math.max(1, Math.ceil(diff / 86400000));
});

const bookingTotal = computed(() => {
  const price = locationsStore.currentLocation?.price_per_night || 0;
  return price * bookingNights.value;
});

// Favorites
const isFav = computed(() => favoritesStore.isFavorite(locationId));

function toggleFav() {
  favoritesStore.toggle(locationId);
}

onMounted(async () => {
  authStore.restoreSession();
  favoritesStore.load();
  await locationsStore.fetchLocationById(locationId);
});
</script>

<template>
  <div class="min-h-screen bg-white relative overflow-hidden flex flex-col">
    <!-- Modal for 3D Splatting Preview -->
    <div v-if="showSplat" class="fixed inset-0 z-50 bg-black/90 flex flex-col" style="touch-action: none;">
      <div class="flex items-center justify-between p-4 text-white">
        <h3 class="font-body font-bold text-lg">3D Viewer: {{ locationsStore.currentLocation?.name }}</h3>
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
      <p class="font-body text-primary-light text-lg">Загрузка локации…</p>
    </div>

    <!-- Error State -->
    <div v-else-if="locationsStore.error" class="flex-1 flex flex-col items-center justify-center gap-4 py-20">
      <span class="text-5xl">😔</span>
      <p class="font-body text-red-600 text-lg">{{ locationsStore.error }}</p>
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
            <button
              @click="toggleFav"
              class="flex items-center justify-center w-11 h-11 rounded-full bg-black/30 backdrop-blur-md transition-colors"
              :class="isFav ? 'text-red-400 bg-red-500/30' : 'text-white hover:bg-black/50 hover:text-red-400'"
            >
              <Heart class="w-5 h-5" :fill="isFav ? 'currentColor' : 'none'" />
            </button>
          </div>
        </div>

        <!-- Title overlay on Hero -->
        <div class="absolute bottom-0 left-0 right-0 p-5 lg:px-8 pb-10 flex flex-col gap-2 z-10 text-white container mx-auto max-w-content">
          <div class="flex items-center gap-3 mb-1">
            <UiBadge
              v-if="locationsStore.currentLocation.density_level"
              class="rounded-xl px-3 py-1 font-body font-bold text-sm uppercase tracking-wider backdrop-blur-md border border-white/20"
              :class="densityClass[locationsStore.currentLocation.density_level] || ''"
            >
              {{ densityLabels[locationsStore.currentLocation.density_level] || locationsStore.currentLocation.density_level }}
            </UiBadge>
            <div
              v-if="locationsStore.currentLocation.access_level === 'hidden'"
              class="flex items-center gap-1.5 font-body font-bold text-sm uppercase tracking-wider bg-yellow-500/80 text-white px-3 py-1 rounded-xl backdrop-blur-md"
            >
              <Star class="w-3 h-3 text-white" />
              Секретно
            </div>
          </div>
          <h1 class="font-heading text-4xl lg:text-6xl text-white leading-tight drop-shadow-md" style="overflow-wrap: break-word; word-break: break-word; hyphens: auto;">
            {{ locationsStore.currentLocation.name }}
          </h1>
          <p class="font-body font-medium text-white/90 text-lg lg:text-base max-w-2xl drop-shadow line-clamp-2 mt-1">
            {{ locationsStore.currentLocation.description_short }}
          </p>
        </div>
      </div>

      <!-- Main Container (pulled up slightly) -->
      <div class="relative z-20 container mx-auto px-4 -mt-6 max-w-content">
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          <!-- Left Column (Main Info) -->
          <div class="lg:col-span-2 flex flex-col gap-6">
            
            <!-- Quick Info Ribbon -->
            <div class="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5 flex overflow-x-auto snap-x hide-scrollbar gap-4 items-center">
              <div class="flex flex-col gap-1 pr-4 border-r border-primary/10 shrink-0">
                <span class="font-body text-sm text-primary-light uppercase tracking-wider">Категория</span>
                <div class="flex items-center gap-1.5 font-body font-medium text-primary text-lg">
                  <span class="text-lg">{{ categoryEmoji[locationsStore.currentLocation.category] || '📍' }}</span>
                  <span class="capitalize">{{ locationsStore.currentLocation.category }}</span>
                </div>
              </div>
              
              <div class="flex flex-col gap-1 pr-4 border-r border-primary/10 shrink-0">
                <span class="font-body text-sm text-primary-light uppercase tracking-wider">Цена</span>
                <div class="flex items-center gap-1.5 font-body font-bold text-primary text-lg">
                  <Wallet class="w-4 h-4 text-accent" />
                  {{ formatPrice(locationsStore.currentLocation.price_per_night) }}
                </div>
              </div>
              
              <div class="flex flex-col gap-1 pr-4 border-r lg:border-none border-primary/10 shrink-0">
                <span class="font-body text-sm text-primary-light uppercase tracking-wider">Вместимость</span>
                <div class="flex items-center gap-1.5 font-body font-medium text-primary text-lg">
                  <Users class="w-4 h-4 text-accent" />
                  До {{ locationsStore.currentLocation.capacity || '?' }} чел.
                </div>
              </div>
              
              <div v-if="locationsStore.currentLocation.child_friendly" class="flex flex-col gap-1 shrink-0">
                <span class="font-body text-sm text-primary-light uppercase tracking-wider">С детьми</span>
                <div class="flex items-center gap-1.5 font-body font-medium text-primary text-lg">
                  👶 Подходит
                </div>
              </div>
            </div>

            <!-- About Section -->
            <div class="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5">
              <h2 class="font-body font-bold text-xl lg:text-2xl text-primary mb-4">О месте</h2>
              <p class="font-body font-medium text-xl text-primary/80 leading-relaxed whitespace-pre-line">
                {{ locationsStore.currentLocation.description_full || locationsStore.currentLocation.description_short }}
              </p>
              
              <!-- Tags -->
              <div v-if="locationsStore.currentLocation.tags?.length" class="flex flex-wrap gap-2 mt-6 pt-6 border-t border-primary/5">
                <span
                  v-for="tag in locationsStore.currentLocation.tags"
                  :key="tag"
                  class="font-body font-semibold text-sm text-accent-dark bg-accent/10 px-3 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <Tag class="w-3 h-3" />
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Gallery Section -->
            <div v-if="locationsStore.currentLocation.gallery_urls?.length" class="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5 overflow-hidden">
              <h2 class="font-body font-bold text-xl lg:text-2xl text-primary mb-5">Фотографии</h2>
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
              class="bg-primary rounded-3xl p-1 shadow-lg relative overflow-hidden group"
            >
              <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div class="bg-white/5 backdrop-blur-md rounded-[1.3rem] p-6 text-white border border-white/10 relative z-10 flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 ring-1 ring-white/20 group-hover:scale-110 group-hover:bg-accent/80 transition-all duration-300">
                  <Box class="w-8 h-8 text-white" />
                </div>
                <h3 class="font-body font-bold text-lg mb-2">3D-слепок локации</h3>
                <p class="font-body text-base text-white/70 mb-5 leading-relaxed">
                  Мы отсканировали это место. Прогуляйтесь по нему прямо сейчас.
                </p>
                <button
                  @click="openSplat"
                  :disabled="loadingSplat"
                  class="w-[80%] flex items-center justify-center gap-2 font-body font-bold text-base text-white bg-accent rounded-xl px-5 py-3 hover:bg-accent-light transition-colors disabled:opacity-50"
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
                <span class="font-body text-lg text-primary">Итого за ночь</span>
                <span class="font-body font-bold text-xl text-primary">{{ formatPrice(locationsStore.currentLocation.price_per_night) }}</span>
              </div>
              <button
                @click="openBookingModal"
                class="w-full flex items-center justify-center gap-2 font-body font-bold text-lg text-white bg-accent rounded-2xl px-6 py-4 transition-all duration-300 hover:bg-accent-dark hover:shadow-lg hover:-translate-y-0.5 mt-2 cursor-pointer"
              >
                <CalendarCheck class="w-5 h-5" />
                Забронировать
              </button>
              <NuxtLink to="/trip/new" class="w-full mt-3 flex items-center justify-center gap-2 font-body font-bold text-lg text-accent-dark bg-accent/10 border border-accent/20 rounded-2xl px-6 py-3.5 transition-all duration-300 hover:bg-accent/20 hover:border-accent/40 no-underline">
                <Route class="w-4 h-4" />
                В маршрут поездки
              </NuxtLink>
            </div>

            <!-- Location Meta -->
            <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5">
              <h3 class="font-body font-bold text-lg text-primary mb-3 flex items-center gap-2">
                <Navigation class="w-5 h-5 text-accent" />
                Где это
              </h3>
              <p v-if="locationsStore.currentLocation.address" class="font-body text-base text-primary/80 mb-3 leading-relaxed">
                {{ locationsStore.currentLocation.address }}
              </p>
              <div class="bg-primary/5 rounded-xl p-3 flex w-full justify-between items-center relative overflow-hidden group">
                 <div class="absolute inset-0 border border-primary/10 rounded-xl"></div>
                 <div class="font-code text-sm text-primary-light font-medium tracking-wide">
                   Координаты
                 </div>
                 <div class="font-code text-base text-primary font-semibold">
                   {{ locationsStore.currentLocation.latitude?.toFixed(5) }}, {{ locationsStore.currentLocation.longitude?.toFixed(5) }}
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div v-if="showBooking" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="showBooking = false">
      <div class="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div v-if="!bookingSubmitted">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-body font-bold text-lg text-primary">Бронирование</h3>
            <button @click="showBooking = false" class="p-1.5 hover:bg-primary/6 rounded-lg transition-colors">
              <X class="w-5 h-5 text-primary-light" />
            </button>
          </div>

          <!-- Slots info -->
          <div v-if="bookingsStore.slots.length > 0" class="mb-4 p-3 bg-green-500/8 rounded-2xl border border-green-500/15">
            <p class="font-body text-sm text-green-700 font-medium">
              ✅ Доступно дат в этом месяце: {{ bookingsStore.slots.filter(s => s.available_capacity > 0).length }}
            </p>
          </div>
          <div v-if="bookingsStore.slotsLoading" class="mb-4 flex items-center gap-2 text-primary-light">
            <Loader2 class="w-4 h-4 animate-spin" />
            <span class="font-body text-sm">Загрузка слотов…</span>
          </div>

          <div class="flex flex-col gap-3 mb-5">
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Заезд</label>
                <input v-model="bookingDateFrom" type="date" class="w-full rounded-xl px-3 py-2.5 bg-primary/4 border border-primary/10 font-body text-base text-primary focus:ring-2 focus:ring-accent/40 outline-none" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Выезд</label>
                <input v-model="bookingDateTo" type="date" class="w-full rounded-xl px-3 py-2.5 bg-primary/4 border border-primary/10 font-body text-base text-primary focus:ring-2 focus:ring-accent/40 outline-none" />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Гостей</label>
              <div class="flex items-center gap-3">
                <button @click="bookingGuests = Math.max(1, bookingGuests - 1)" class="w-9 h-9 rounded-xl bg-primary/6 flex items-center justify-center font-body font-bold text-primary hover:bg-primary/12 transition-colors cursor-pointer">−</button>
                <span class="font-body font-bold text-lg text-primary w-8 text-center">{{ bookingGuests }}</span>
                <button @click="bookingGuests = Math.min(20, bookingGuests + 1)" class="w-9 h-9 rounded-xl bg-primary/6 flex items-center justify-center font-body font-bold text-primary hover:bg-primary/12 transition-colors cursor-pointer">+</button>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Имя</label>
              <div class="relative">
                <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-light" />
                <input v-model="bookingContactName" type="text" placeholder="Ваше имя" class="w-full rounded-xl pl-9 pr-3 py-2.5 bg-primary/4 border border-primary/10 font-body text-base text-primary focus:ring-2 focus:ring-accent/40 outline-none" />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Телефон</label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-light" />
                <input v-model="bookingContactPhone" type="tel" placeholder="+7 (999) 123-45-67" class="w-full rounded-xl pl-9 pr-3 py-2.5 bg-primary/4 border border-primary/10 font-body text-base text-primary focus:ring-2 focus:ring-accent/40 outline-none" />
              </div>
            </div>
          </div>

          <div class="bg-accent/8 rounded-2xl p-4 mb-5">
            <div class="flex justify-between items-center mb-1">
              <span class="font-body text-base text-primary-light">{{ bookingNights }} {{ bookingNights === 1 ? 'ночь' : bookingNights < 5 ? 'ночи' : 'ночей' }}</span>
              <span class="font-body text-base text-primary">{{ formatPrice(locationsStore.currentLocation?.price_per_night || 0) }}</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-accent/20">
              <span class="font-body font-bold text-lg text-primary">Итого</span>
              <span class="font-body font-bold text-lg text-primary">{{ bookingTotal.toLocaleString('ru-RU') }} ₽</span>
            </div>
          </div>

          <!-- Error -->
          <div v-if="bookingError" class="mb-4 p-3 bg-red-500/8 rounded-2xl border border-red-500/15">
            <p class="font-body text-sm text-red-600 font-medium">{{ bookingError }}</p>
          </div>

          <button
            @click="submitBooking"
            :disabled="!bookingDateFrom || !bookingDateTo || !bookingContactName || !bookingContactPhone || bookingSubmitting"
            class="w-full flex items-center justify-center gap-2 font-body font-bold text-lg text-white bg-accent rounded-2xl px-6 py-4 transition-all duration-300 hover:bg-accent-dark hover:shadow-lg disabled:opacity-40 cursor-pointer"
          >
            <Loader2 v-if="bookingSubmitting" class="w-5 h-5 animate-spin" />
            <CalendarCheck v-else class="w-5 h-5" />
            {{ bookingSubmitting ? 'Отправляем…' : 'Подтвердить бронирование' }}
          </button>
        </div>

        <div v-else class="text-center py-4">
          <div class="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center mx-auto mb-4">
            <Clock class="w-8 h-8 text-yellow-600" />
          </div>
          <h3 class="font-body font-bold text-lg text-primary mb-2">Ожидаем подтверждения</h3>
          <p class="font-body text-base text-primary-light mb-1">{{ locationsStore.currentLocation?.name }}</p>
          <p class="font-body text-sm text-primary-light mb-4">{{ bookingDateFrom }} — {{ bookingDateTo }} · {{ bookingGuests }} гостей</p>
          <div class="bg-accent/8 rounded-xl p-3 mb-5">
            <span class="font-body font-bold text-lg text-primary">{{ bookingTotal.toLocaleString('ru-RU') }} ₽</span>
          </div>
          <p class="font-body text-sm text-primary-light mb-5">Хозяин получил ваш запрос. Подтверждение придёт в течение нескольких минут.</p>
          <button
            @click="showBooking = false"
            class="w-full font-body font-bold text-base text-accent-dark bg-accent/10 border border-accent/20 rounded-2xl px-6 py-3 hover:bg-accent/20 transition-colors cursor-pointer"
          >
            Закрыть
          </button>
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
