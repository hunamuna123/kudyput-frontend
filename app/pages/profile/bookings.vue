<script setup lang="ts">
import { CalendarCheck, Loader2, X, Clock, Check, Ban, MapPin, AlertCircle, RefreshCw } from "lucide-vue-next";
import { useBookingsStore } from "~~/store/bookings";
import { useAuthStore } from "~~/store/auth";

definePageMeta({
  layout: "default",
  middleware: ["auth"],
});

useHead({
  title: "Мои бронирования - КудыТуды",
});

const bookingsStore = useBookingsStore();
const authStore = useAuthStore();
const cancellingId = ref<string | null>(null);

const statusLabels: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждено",
  rejected: "Отклонено",
  cancelled: "Отменено",
  completed: "Завершено",
};

const statusClass: Record<string, string> = {
  pending: "bg-yellow-500/12 text-yellow-700",
  confirmed: "bg-green-500/12 text-green-700",
  rejected: "bg-red-500/12 text-red-600",
  cancelled: "bg-primary/8 text-primary-light",
  completed: "bg-accent/12 text-accent-dark",
};

const statusIcon: Record<string, typeof Check> = {
  pending: Clock,
  confirmed: Check,
  rejected: Ban,
  cancelled: X,
  completed: CalendarCheck,
};

async function cancelBooking(id: string) {
  cancellingId.value = id;
  await bookingsStore.cancelBooking(id);
  cancellingId.value = null;
}

function canCancel(status: string): boolean {
  return status === "pending" || status === "confirmed";
}

function formatDates(from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${f.toLocaleDateString("ru-RU", opts)} — ${t.toLocaleDateString("ru-RU", opts)}`;
}

onMounted(async () => {
  authStore.restoreSession();
  await bookingsStore.fetchMyBookings();
});
</script>

<template>
  <div class="min-h-screen bg-cream/30">
    <div class="container mx-auto px-4 py-8 max-w-[720px]">
      <h1 class="font-heading text-3xl lg:text-4xl text-primary mb-6">Мои бронирования</h1>

      <!-- Loading -->
      <div v-if="bookingsStore.loading && bookingsStore.myBookings.length === 0" class="flex justify-center py-16">
        <Loader2 class="w-8 h-8 text-accent animate-spin" />
      </div>

      <!-- Error -->
      <div v-else-if="bookingsStore.error && bookingsStore.myBookings.length === 0" class="flex flex-col gap-3 max-w-[400px]">
        <UiAlert variant="destructive" class="rounded-2xl">
          <AlertCircle class="h-4 w-4" />
          <UiAlertDescription>{{ bookingsStore.error }}</UiAlertDescription>
        </UiAlert>
        <UiButton variant="secondary" class="self-start rounded-2xl font-body" @click="bookingsStore.fetchMyBookings()">
          <RefreshCw class="w-4 h-4 mr-2" />
          Повторить
        </UiButton>
      </div>

      <!-- Empty -->
      <div v-else-if="bookingsStore.myBookings.length === 0" class="text-center py-16">
        <span class="text-5xl mb-4 block">📋</span>
        <p class="font-body text-lg text-primary-light mb-2">У вас пока нет бронирований</p>
        <p class="font-body text-base text-primary-light/70 mb-6">Найдите интересное место на карте и забронируйте</p>
        <NuxtLink
          to="/map"
          class="inline-flex items-center gap-2 font-body font-bold text-base text-white bg-accent rounded-2xl px-6 py-3 no-underline hover:bg-accent-dark transition-colors"
        >
          <MapPin class="w-4 h-4" />
          Открыть карту
        </NuxtLink>
      </div>

      <!-- Bookings List -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="booking in bookingsStore.myBookings"
          :key="booking.id"
          class="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-primary/5 flex flex-col sm:flex-row gap-4"
        >
          <!-- Location Preview -->
          <div class="w-full sm:w-24 h-20 sm:h-24 rounded-2xl bg-accent/10 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              v-if="booking.location_preview_image_url"
              :src="booking.location_preview_image_url"
              :alt="booking.location_name"
              class="w-full h-full object-cover"
            />
            <MapPin v-else class="w-8 h-8 text-accent/40" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3 mb-2">
              <NuxtLink
                :to="`/location/${booking.location_id}`"
                class="font-body font-bold text-lg text-primary no-underline hover:text-accent-dark transition-colors truncate"
              >
                {{ booking.location_name }}
              </NuxtLink>
              <UiBadge
                class="rounded-lg text-xs shrink-0 border-0"
                :class="statusClass[booking.status] || ''"
              >
                <component :is="statusIcon[booking.status]" class="w-3 h-3 mr-1" />
                {{ statusLabels[booking.status] || booking.status }}
              </UiBadge>
            </div>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-primary-light mb-3">
              <span class="flex items-center gap-1">
                <CalendarCheck class="w-3.5 h-3.5" />
                {{ formatDates(booking.date_from, booking.date_to) }}
              </span>
              <span>{{ booking.guests_count }} {{ booking.guests_count === 1 ? 'гость' : booking.guests_count < 5 ? 'гостя' : 'гостей' }}</span>
              <span v-if="booking.total_price" class="font-bold text-primary">{{ booking.total_price.toLocaleString('ru-RU') }} ₽</span>
            </div>

            <div v-if="booking.host_comment" class="bg-primary/4 rounded-xl p-3 mb-3">
              <p class="font-body text-sm text-primary-light italic">💬 {{ booking.host_comment }}</p>
            </div>

            <button
              v-if="canCancel(booking.status)"
              @click="cancelBooking(booking.id)"
              :disabled="cancellingId === booking.id"
              class="flex items-center gap-1.5 font-body font-bold text-sm text-red-600 bg-red-500/8 border border-red-500/15 rounded-xl px-3.5 py-2 hover:bg-red-500/15 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Loader2 v-if="cancellingId === booking.id" class="w-3.5 h-3.5 animate-spin" />
              <X v-else class="w-3.5 h-3.5" />
              Отменить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
