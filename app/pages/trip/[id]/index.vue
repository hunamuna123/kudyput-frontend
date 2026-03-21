<script setup lang="ts">
import { useTripsStore } from "~~/store/trips";
import {
  Car, Bus, Footprints, Bike, Users, Wallet, CalendarIcon,
  ArrowLeft, Link2, Copy, User, Loader2, AlertCircle, ChevronRight,
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

onMounted(async () => {
  await tripsStore.fetchTrip(tripId);
  await tripsStore.fetchTripMembers(tripId);
});
</script>

<template>
  <div class="w-full">
    <NuxtLink
      to="/profile/trips"
      class="inline-flex items-center gap-1.5 font-body text-[0.82rem] text-primary-light hover:text-accent-dark transition-colors no-underline mb-6"
    >
      <ArrowLeft class="w-4 h-4" />
      Все поездки
    </NuxtLink>

    <div v-if="tripsStore.loading && !tripsStore.currentTrip" class="flex flex-col items-center gap-3 py-20">
      <Loader2 class="w-8 h-8 text-accent animate-spin" />
      <span class="font-body text-[0.85rem] text-primary-light">Загрузка поездки...</span>
    </div>

    <div v-else-if="tripsStore.error && !tripsStore.currentTrip" class="flex flex-col items-center gap-3 py-20">
      <UiAlert variant="destructive" class="rounded-2xl max-w-md">
        <AlertCircle class="h-4 w-4" />
        <UiAlertDescription>{{ tripsStore.error }}</UiAlertDescription>
      </UiAlert>
      <NuxtLink
        to="/profile/trips"
        class="font-body text-[0.82rem] text-accent-dark hover:text-accent transition-colors no-underline mt-2"
      >
        Вернуться к поездкам
      </NuxtLink>
    </div>

    <div v-else-if="tripsStore.currentTrip" class="flex flex-col gap-5">
      <div class="bg-white/35 border border-accent/40 rounded-3xl p-8">
        <div class="flex items-start justify-between gap-3 mb-5">
          <div class="flex flex-col gap-1">
            <h1 class="font-heading text-[1.4rem] text-primary m-0">
              {{ formatDate(tripsStore.currentTrip.date_from) }} — {{ formatDate(tripsStore.currentTrip.date_to) }}
            </h1>
            <span class="font-body text-[0.75rem] text-primary-light">
              ID: {{ tripsStore.currentTrip.id }}
            </span>
          </div>
          <UiBadge
            variant="secondary"
            class="rounded-lg text-[0.72rem] font-bold shrink-0"
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
              <span class="font-body text-[0.68rem] text-primary-light">Транспорт</span>
              <span class="font-body font-bold text-[0.88rem] text-primary">
                {{ transportLabels[tripsStore.currentTrip.transport] || tripsStore.currentTrip.transport }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2.5 bg-white/40 border border-accent/20 rounded-2xl px-5 py-4">
            <Users class="w-5 h-5 text-accent-dark shrink-0" />
            <div class="flex flex-col">
              <span class="font-body text-[0.68rem] text-primary-light">Группа</span>
              <span class="font-body font-bold text-[0.88rem] text-primary">
                {{ tripsStore.currentTrip.group_size }} чел.
              </span>
            </div>
          </div>

          <div v-if="tripsStore.currentTrip.budget_rub" class="flex items-center gap-2.5 bg-white/40 border border-accent/20 rounded-2xl px-5 py-4">
            <Wallet class="w-5 h-5 text-accent-dark shrink-0" />
            <div class="flex flex-col">
              <span class="font-body text-[0.68rem] text-primary-light">Бюджет</span>
              <span class="font-body font-bold text-[0.88rem] text-primary">
                {{ tripsStore.currentTrip.budget_rub.toLocaleString("ru-RU") }} ₽
              </span>
            </div>
          </div>
        </div>

        <div v-if="tripsStore.currentTrip.invite_token" class="flex items-center gap-2 mt-5 pt-5 border-t border-accent/20">
          <Link2 class="w-4 h-4 text-accent-dark shrink-0" />
          <span class="font-body text-[0.75rem] text-primary-light shrink-0">Пригласить:</span>
          <input
            :value="getInviteUrl()"
            readonly
            class="font-mono text-[0.68rem] text-primary bg-white/60 border border-accent/40 rounded-lg px-2.5 py-1.5 flex-1 min-w-0 truncate"
          />
          <button
            class="font-body font-bold text-[0.72rem] text-accent-dark bg-accent/10 hover:bg-accent/20 border-none rounded-lg px-3 py-1.5 cursor-pointer transition-colors shrink-0"
            @click="copyInvite"
          >
            <Copy class="w-3 h-3 inline mr-1" />
            {{ copiedInvite ? "Скопировано ✓" : "Копировать" }}
          </button>
        </div>
      </div>

      <div class="bg-white/35 border border-accent/40 rounded-3xl p-8">
        <h2 class="font-heading text-[1.1rem] text-primary m-0 mb-5">Участники</h2>

        <div v-if="tripsStore.loading && tripsStore.currentMembers.length === 0" class="flex items-center gap-2 py-4">
          <Loader2 class="w-4 h-4 text-accent animate-spin" />
          <span class="font-body text-[0.82rem] text-primary-light">Загрузка участников...</span>
        </div>

        <div v-else-if="tripsStore.currentMembers.length === 0" class="flex flex-col items-center gap-2 py-6">
          <Users class="w-8 h-8 text-primary-light opacity-30" />
          <span class="font-body text-[0.82rem] text-primary-light">Участников пока нет</span>
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
              <span class="font-body font-bold text-[0.88rem] text-primary block truncate">
                {{ member.display_name || "Без имени" }}
              </span>
              <div class="flex items-center gap-2 mt-0.5">
                <span
                  v-if="member.role === 'creator'"
                  class="font-body text-[0.65rem] font-bold text-accent-dark bg-accent/10 rounded px-1.5 py-0.5"
                >
                  Создатель
                </span>
                <span
                  v-if="member.is_child"
                  class="font-body text-[0.65rem] font-bold text-blue-600 bg-blue-500/10 rounded px-1.5 py-0.5"
                >
                  Ребёнок
                </span>
              </div>
            </div>
            <div v-if="member.tags?.length" class="flex flex-wrap gap-1 justify-end max-w-[150px]">
              <span
                v-for="tag in member.tags"
                :key="tag"
                class="font-body text-[0.62rem] text-primary-light bg-primary/6 rounded-full px-2 py-0.5"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
