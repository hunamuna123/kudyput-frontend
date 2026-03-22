<script setup lang="ts">
import { CalendarCheck, Loader2, Check, X, Clock, Ban, MessageSquare, MapPin, AlertCircle, RefreshCw } from "lucide-vue-next";
import { useBookingsStore } from "~~/store/bookings";
import type { Booking } from "~~/store/bookings";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "host"],
});

useHead({
  title: "Бронирования хоста - КудыТуды",
});

const bookingsStore = useBookingsStore();
const processingId = ref<string | null>(null);
const showCommentModal = ref(false);
const commentModalAction = ref<"confirm" | "reject">("confirm");
const commentModalBookingId = ref("");
const commentText = ref("");

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

function formatDates(from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${f.toLocaleDateString("ru-RU", opts)} — ${t.toLocaleDateString("ru-RU", opts)}`;
}

function openActionModal(bookingId: string, action: "confirm" | "reject") {
  commentModalBookingId.value = bookingId;
  commentModalAction.value = action;
  commentText.value = "";
  showCommentModal.value = true;
}

async function submitAction() {
  processingId.value = commentModalBookingId.value;
  await bookingsStore.confirmBooking(
    commentModalBookingId.value,
    commentModalAction.value,
    commentText.value || undefined,
  );
  processingId.value = null;
  showCommentModal.value = false;
}

// Tab filter
const activeTab = ref<"all" | "pending" | "confirmed">("all");

const filteredBookings = computed(() => {
  if (activeTab.value === "all") return bookingsStore.hostBookings;
  return bookingsStore.hostBookings.filter((b) => b.status === activeTab.value);
});

const tabCounts = computed(() => ({
  all: bookingsStore.hostBookings.length,
  pending: bookingsStore.hostBookings.filter((b) => b.status === "pending").length,
  confirmed: bookingsStore.hostBookings.filter((b) => b.status === "confirmed").length,
}));

onMounted(() => {
  bookingsStore.fetchHostBookings();
});
</script>

<template>
  <div class="w-full max-w-[960px]">
    <h1 class="font-heading text-3xl text-primary mb-6">Бронирования</h1>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in (['all', 'pending', 'confirmed'] as const)"
        :key="tab"
        @click="activeTab = tab"
        class="flex items-center gap-1.5 font-body font-bold text-sm px-4 py-2 rounded-xl border transition-colors cursor-pointer"
        :class="activeTab === tab
          ? 'bg-accent/15 text-accent-dark border-accent/30'
          : 'bg-white/50 text-primary-light border-primary/10 hover:bg-primary/6'"
      >
        {{ tab === 'all' ? 'Все' : tab === 'pending' ? 'Ожидают' : 'Подтверждённые' }}
        <span class="font-body text-xs bg-primary/8 text-primary px-1.5 py-0.5 rounded-md">{{ tabCounts[tab] }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="bookingsStore.loading && bookingsStore.hostBookings.length === 0" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 text-accent animate-spin" />
    </div>

    <!-- Error -->
    <div v-else-if="bookingsStore.error && bookingsStore.hostBookings.length === 0" class="flex flex-col gap-3 max-w-[400px]">
      <UiAlert variant="destructive" class="rounded-2xl">
        <AlertCircle class="h-4 w-4" />
        <UiAlertDescription>{{ bookingsStore.error }}</UiAlertDescription>
      </UiAlert>
      <UiButton variant="secondary" class="self-start rounded-2xl font-body" @click="bookingsStore.fetchHostBookings()">
        <RefreshCw class="w-4 h-4 mr-2" />
        Повторить
      </UiButton>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredBookings.length === 0" class="text-center py-16">
      <span class="text-5xl mb-4 block">📭</span>
      <p class="font-body text-lg text-primary-light">
        {{ activeTab === 'all' ? 'Пока нет бронирований' : activeTab === 'pending' ? 'Нет ожидающих бронирований' : 'Нет подтверждённых бронирований' }}
      </p>
    </div>

    <!-- Bookings list -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="bg-white/35 border border-accent/40 rounded-3xl p-5 flex flex-col sm:flex-row gap-4"
      >
        <!-- Preview -->
        <div class="w-full sm:w-20 h-16 sm:h-20 rounded-2xl bg-accent/10 shrink-0 overflow-hidden flex items-center justify-center">
          <img
            v-if="booking.location_preview_image_url"
            :src="booking.location_preview_image_url"
            :alt="booking.location_name"
            class="w-full h-full object-cover"
          />
          <MapPin v-else class="w-6 h-6 text-accent/40" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-3 mb-1.5">
            <div class="min-w-0">
              <h3 class="font-body font-bold text-base text-primary truncate">{{ booking.location_name }}</h3>
              <p class="font-body text-sm text-primary-light">
                {{ booking.contact_name }} · {{ booking.contact_phone }}
              </p>
            </div>
            <UiBadge
              class="rounded-lg text-xs shrink-0 border-0"
              :class="statusClass[booking.status] || ''"
            >
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

          <!-- Actions -->
          <div v-if="booking.status === 'pending'" class="flex items-center gap-2">
            <button
              @click="openActionModal(booking.id, 'confirm')"
              :disabled="processingId === booking.id"
              class="flex items-center gap-1.5 font-body font-bold text-sm text-white bg-green-600 rounded-xl px-4 py-2 hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Check class="w-3.5 h-3.5" />
              Подтвердить
            </button>
            <button
              @click="openActionModal(booking.id, 'reject')"
              :disabled="processingId === booking.id"
              class="flex items-center gap-1.5 font-body font-bold text-sm text-red-600 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-2 hover:bg-red-500/15 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Ban class="w-3.5 h-3.5" />
              Отклонить
            </button>
          </div>

          <div v-if="booking.host_comment" class="mt-2 bg-primary/4 rounded-xl p-3">
            <p class="font-body text-sm text-primary-light italic">💬 {{ booking.host_comment }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm/Reject Modal -->
    <div v-if="showCommentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" @click.self="showCommentModal = false">
      <div class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-body font-bold text-lg text-primary">
            {{ commentModalAction === 'confirm' ? 'Подтвердить бронь' : 'Отклонить бронь' }}
          </h3>
          <button @click="showCommentModal = false" class="p-1.5 hover:bg-primary/6 rounded-lg transition-colors">
            <X class="w-5 h-5 text-primary-light" />
          </button>
        </div>

        <div class="flex flex-col gap-1 mb-5">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">
            <MessageSquare class="w-3.5 h-3.5 inline mr-1" />
            Комментарий (необязательно)
          </label>
          <textarea
            v-model="commentText"
            rows="3"
            placeholder="Оставьте комментарий для гостя..."
            class="w-full rounded-xl px-3 py-2.5 bg-primary/4 border border-primary/10 font-body text-base text-primary focus:ring-2 focus:ring-accent/40 outline-none resize-none"
          />
        </div>

        <button
          @click="submitAction"
          :disabled="processingId !== null"
          class="w-full flex items-center justify-center gap-2 font-body font-bold text-base text-white rounded-2xl px-6 py-3.5 transition-all duration-300 hover:shadow-lg disabled:opacity-40 cursor-pointer"
          :class="commentModalAction === 'confirm' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
        >
          <Loader2 v-if="processingId !== null" class="w-4 h-4 animate-spin" />
          <Check v-else-if="commentModalAction === 'confirm'" class="w-4 h-4" />
          <Ban v-else class="w-4 h-4" />
          {{ commentModalAction === 'confirm' ? 'Подтвердить' : 'Отклонить' }}
        </button>
      </div>
    </div>
  </div>
</template>
