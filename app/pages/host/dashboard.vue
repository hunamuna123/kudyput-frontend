<script setup lang="ts">
import { MapPin, Plus, Eye, Pencil, BarChart3, CalendarCheck, AlertCircle, RefreshCw, Loader2 } from "lucide-vue-next";
import { useOnboardingStore } from "~~/store/onboarding";
import { useBookingsStore } from "~~/store/bookings";
import { useAuthStore } from "~~/store/auth";
import type { Location } from "~~/store/locations";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "host"],
});

useHead({
  title: "Панель хоста - КудыТуды",
});

const authStore = useAuthStore();
const onboardingStore = useOnboardingStore();
const bookingsStore = useBookingsStore();

const myLocations = ref<Location[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const stats = computed(() => ({
  total: myLocations.value.length,
  published: myLocations.value.filter((l) => l.is_published).length,
  bookings: bookingsStore.hostBookings.length,
  pending: bookingsStore.hostBookings.filter((b) => b.status === "pending").length,
}));

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    await onboardingStore.fetchHostLocations();
    myLocations.value = onboardingStore.hostLocations;
    await bookingsStore.fetchHostBookings();
  } catch {
    error.value = "Ошибка загрузки данных";
  } finally {
    loading.value = false;
  }
}

const categoryEmoji: Record<string, string> = {
  winery: "🍷", farm: "🐐", trail: "🥾", gastro: "🍽", nature: "🌿",
  camping: "🏕", resort: "🏖", extreme: "⚡", cultural: "🏛", beach: "🌊",
};

onMounted(loadData);
</script>

<template>
  <div class="w-full max-w-[960px]">

    <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
      <div class="flex items-center gap-3 p-4 bg-white/35 border border-accent/40 rounded-3xl">
        <div class="w-10 h-10 flex items-center justify-center rounded-[12px] shrink-0 bg-accent/15 text-accent-dark">
          <MapPin class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="font-body font-bold text-lg text-primary">{{ stats.total }}</span>
          <span class="font-body text-xs text-primary-light">Локаций</span>
        </div>
      </div>

      <div class="flex items-center gap-3 p-4 bg-white/35 border border-accent/40 rounded-3xl">
        <div class="w-10 h-10 flex items-center justify-center rounded-[12px] shrink-0 bg-green-500/12 text-green-700">
          <Eye class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="font-body font-bold text-lg text-primary">{{ stats.published }}</span>
          <span class="font-body text-xs text-primary-light">Опубликовано</span>
        </div>
      </div>

      <div class="flex items-center gap-3 p-4 bg-white/35 border border-accent/40 rounded-3xl">
        <div class="w-10 h-10 flex items-center justify-center rounded-[12px] shrink-0 bg-primary/8 text-primary">
          <CalendarCheck class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="font-body font-bold text-lg text-primary">{{ stats.bookings }}</span>
          <span class="font-body text-xs text-primary-light">Броней</span>
        </div>
      </div>

      <div class="flex items-center gap-3 p-4 bg-white/35 border border-accent/40 rounded-3xl">
        <div class="w-10 h-10 flex items-center justify-center rounded-[12px] shrink-0 bg-yellow-500/12 text-yellow-700">
          <BarChart3 class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="font-body font-bold text-lg text-primary">{{ stats.pending }}</span>
          <span class="font-body text-xs text-primary-light">Ожидают</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 text-accent animate-spin" />
    </div>

    <div v-else-if="error" class="flex flex-col gap-3 max-w-[400px]">
      <UiAlert variant="destructive" class="rounded-2xl">
        <AlertCircle class="h-4 w-4" />
        <UiAlertDescription>{{ error }}</UiAlertDescription>
      </UiAlert>
      <UiButton variant="secondary" class="self-start rounded-2xl font-body" @click="loadData">
        <RefreshCw class="w-4 h-4 mr-2" />
        Повторить
      </UiButton>
    </div>

    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-body font-bold text-2xl text-primary">Мои локации</h2>
        <NuxtLink
          to="/host"
          class="flex items-center gap-1.5 font-body font-bold text-base text-accent-dark bg-accent/10 border border-accent/20 px-3.5 py-2 rounded-xl no-underline hover:bg-accent/20 transition-colors"
        >
          <Plus class="w-3.5 h-3.5" />
          Добавить
        </NuxtLink>
      </div>

      <div v-if="myLocations.length === 0" class="text-center py-12">
        <span class="text-4xl mb-3 block">🏠</span>
        <p class="font-body text-primary-light text-lg mb-4">У вас пока нет локаций</p>
        <NuxtLink
          to="/host"
          class="inline-flex items-center gap-2 font-body font-bold text-base text-white bg-accent rounded-2xl px-6 py-3 no-underline hover:bg-accent-dark transition-colors"
        >
          <Plus class="w-4 h-4" />
          Добавить первую
        </NuxtLink>
      </div>

      <div v-else class="flex flex-col gap-2.5">
        <div
          v-for="loc in myLocations"
          :key="loc.id"
          class="flex items-center gap-4 p-4 bg-white/35 border border-accent/40 rounded-3xl hover:border-accent/60 transition-colors"
        >
          <div class="w-14 h-14 rounded-2xl bg-accent/10 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              v-if="loc.preview_image_url"
              :src="loc.preview_image_url"
              :alt="loc.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-2xl">{{ categoryEmoji[loc.category] || '📍' }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="font-body font-bold text-md text-primary truncate">{{ loc.name }}</h3>
            <div class="flex items-center gap-2 mt-0.5">
              <UiBadge
                variant="secondary"
                class="rounded-lg text-xs capitalize"
                :class="loc.is_published ? 'bg-green-500/12 text-green-700' : 'bg-primary/8 text-primary-light'"
              >
                {{ loc.is_published ? 'Опубликовано' : 'Черновик' }}
              </UiBadge>
              <span class="font-body text-sm text-primary-light capitalize">{{ loc.category }}</span>
            </div>
          </div>

          <div class="flex gap-1.5 shrink-0">
            <NuxtLink
              :to="`/location/${loc.id}`"
              class="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/6 text-primary-light hover:bg-primary/12 hover:text-primary transition-colors no-underline"
            >
              <Eye class="w-4 h-4" />
            </NuxtLink>
            <NuxtLink
              :to="`/host/location/${loc.id}/edit`"
              class="w-9 h-9 flex items-center justify-center rounded-xl bg-accent/10 text-accent-dark hover:bg-accent/20 transition-colors no-underline"
            >
              <Pencil class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-if="bookingsStore.hostBookings.length > 0" class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-body font-bold text-2xl text-primary">Последние бронирования</h2>
          <NuxtLink
            to="/host/bookings"
            class="font-body font-bold text-sm text-accent-dark hover:text-accent transition-colors no-underline"
          >
            Все →
          </NuxtLink>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="booking in bookingsStore.hostBookings.slice(0, 5)"
            :key="booking.id"
            class="flex items-center justify-between p-4 bg-white/35 border border-accent/40 rounded-2xl"
          >
            <div class="min-w-0 flex-1">
              <span class="font-body font-bold text-base text-primary block truncate">{{ booking.location_name }}</span>
              <span class="font-body text-sm text-primary-light">{{ booking.date_from }} — {{ booking.date_to }} · {{ booking.contact_name }}</span>
            </div>
            <UiBadge
              :variant="booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'"
              class="rounded-lg text-xs shrink-0 ml-3"
              :class="{
                'bg-green-500/12 text-green-700': booking.status === 'confirmed',
                'bg-yellow-500/12 text-yellow-700': booking.status === 'pending',
                'bg-red-500/12 text-red-600': booking.status === 'cancelled' || booking.status === 'rejected',
              }"
            >
              {{ { pending: 'Ожидает', confirmed: 'Подтверждено', rejected: 'Отклонено', cancelled: 'Отменено', completed: 'Завершено' }[booking.status] }}
            </UiBadge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
