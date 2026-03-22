<script setup lang="ts">
import { useTripsStore } from "~~/store/trips";
import { Plus, X, Check, Car, Bus, Footprints, Bike, Users, Wallet, AlertCircle, CalendarIcon, Copy, Link2, ChevronDown, ChevronUp, User } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Поездки - КудыТуды",
});

const tripsStore = useTripsStore();
const showForm = ref(false);
const expandedTripId = ref<string | null>(null);
const copiedId = ref<string | null>(null);

const dateFrom = ref("");
const dateTo = ref("");
const budgetTier = ref("comfort");
const transport = ref("car");
const groupSize = ref(2);

const budgetOptions = [
  { label: "Эконом", value: "economy" },
  { label: "Комфорт", value: "comfort" },
  { label: "Премиум", value: "premium" },
];

const transportOptions = [
  { label: "Авто", value: "car" },
  { label: "Общественный", value: "public" },
  { label: "Пешком", value: "walk" },
  { label: "Велосипед", value: "bike" },
];

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
  return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

function getInviteUrl(trip: { id: string; invite_token: string }): string {
  return `${window.location.origin}/trip/${trip.id}/join?token=${trip.invite_token}`;
}

async function copyInvite(trip: { id: string; invite_token: string }) {
  try {
    await navigator.clipboard.writeText(getInviteUrl(trip));
    copiedId.value = trip.id;
    setTimeout(() => copiedId.value = null, 2000);
  } catch { /* noop */ }
}

async function toggleExpand(tripId: string) {
  if (expandedTripId.value === tripId) {
    expandedTripId.value = null;
    return;
  }
  expandedTripId.value = tripId;
  await tripsStore.fetchTripMembers(tripId);
}

onMounted(() => {
  tripsStore.fetchTrips();
});

async function handleCreate() {
  if (!dateFrom.value || !dateTo.value) return;
  const result = await tripsStore.createTrip({
    date_from: dateFrom.value,
    date_to: dateTo.value,
    budget_rub: 50000,
    budget_tier: budgetTier.value,
    transport: transport.value,
    group_size: groupSize.value,
  });
  if (result) {
    showForm.value = false;
    dateFrom.value = "";
    dateTo.value = "";
  }
}
</script>

<template>
  <div class="w-full">
    <div class="flex justify-end mb-5">
      <UiButton
        class="bg-accent hover:bg-accent-dark border-accent text-white font-body font-bold rounded-2xl"
        @click="showForm = !showForm"
      >
        <component :is="showForm ? X : Plus" class="w-4 h-4 mr-2" />
        {{ showForm ? 'Скрыть' : 'Новая поездка' }}
      </UiButton>
    </div>


    <Transition name="slide">
      <div v-if="showForm" class="bg-white/35 border border-accent/40 rounded-3xl p-8 mb-6">
        <h3 class="font-body font-bold text-2xl text-primary mb-6">Новая поездка</h3>
        <form class="flex flex-col gap-[18px]" @submit.prevent="handleCreate">
          <div class="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5">
            <div class="flex flex-col gap-1.5">
              <label class="font-body text-base font-bold text-primary">Дата начала</label>
              <UiInput v-model="dateFrom" type="date" class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent w-full" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-body text-base font-bold text-primary">Дата окончания</label>
              <UiInput v-model="dateTo" type="date" class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent w-full" />
            </div>
          </div>

          <div class="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5">
            <div class="flex flex-col gap-1.5">
              <label class="font-body text-base font-bold text-primary">Бюджет</label>
              <UiSelect v-model="budgetTier">
                <UiSelectTrigger class="rounded-2xl font-body bg-white/25 border border-accent/40">
                  <UiSelectValue placeholder="Комфорт" />
                </UiSelectTrigger>
                <UiSelectContent class="rounded-2xl">
                  <UiSelectItem v-for="opt in budgetOptions" :key="opt.value" :value="opt.value" class="font-body">
                    {{ opt.label }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-body text-base font-bold text-primary">Транспорт</label>
              <UiSelect v-model="transport">
                <UiSelectTrigger class="rounded-2xl font-body bg-white/25 border border-accent/40">
                  <UiSelectValue placeholder="Авто" />
                </UiSelectTrigger>
                <UiSelectContent class="rounded-2xl">
                  <UiSelectItem v-for="opt in transportOptions" :key="opt.value" :value="opt.value" class="font-body">
                    {{ opt.label }}
                  </UiSelectItem>
                </UiSelectContent>
              </UiSelect>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-body text-base font-bold text-primary">Размер группы</label>
            <UiInput v-model.number="groupSize" type="number" min="1" max="50" class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent max-w-[140px]" />
          </div>

          <UiAlert v-if="tripsStore.error" variant="destructive" class="rounded-2xl">
            <AlertCircle class="h-4 w-4" />
            <UiAlertDescription>{{ tripsStore.error }}</UiAlertDescription>
          </UiAlert>

          <UiButton
            type="submit"
            :disabled="!dateFrom || !dateTo || tripsStore.loading"
            class="bg-accent hover:bg-accent-dark border-accent text-white font-body font-bold rounded-2xl py-3.5 mt-1"
          >
            <span v-if="tripsStore.loading" class="inline-block w-4 h-4 border-2 border-primary-dark/30 border-t-primary-dark rounded-full animate-spin mr-2"></span>
            <Check v-else class="w-4 h-4 mr-2" />
            Создать
          </UiButton>
        </form>
      </div>
    </Transition>


    <div v-if="tripsStore.trips.length === 0 && !showForm" class="flex flex-col items-center gap-2 py-15">
      <Car class="w-10 h-10 text-primary-light opacity-30" />
      <p class="font-body text-lg text-primary">Поездок пока нет</p>
      <p class="font-body text-base text-primary-light">Создайте первую поездку, чтобы начать</p>
    </div>


    <div v-if="tripsStore.trips.length > 0" class="flex flex-col gap-3.5">
      <div
        v-for="trip in tripsStore.trips"
        :key="trip.id"
        class="flex flex-col bg-white/35 border border-accent/40 rounded-3xl transition-all duration-200 hover:border-accent/30 overflow-hidden"
      >
  
        <div class="flex flex-col gap-3 p-6">
          <div class="flex items-center justify-between gap-2">
            <span class="font-body font-bold text-lg text-primary">
              {{ formatDate(trip.date_from) }} — {{ formatDate(trip.date_to) }}
            </span>
            <UiBadge
              variant="secondary"
              class="rounded-lg text-xs font-bold"
              :class="statusBadgeClass[trip.status] || 'bg-primary/6 text-primary-light'"
            >
              {{ statusLabels[trip.status] || trip.status }}
            </UiBadge>
          </div>
          <div class="flex flex-wrap gap-3.5">
            <span class="inline-flex items-center gap-1 font-body text-sm text-primary-light">
              <component :is="transportIcons[trip.transport] || Car" class="w-3.5 h-3.5" />
              {{ transportOptions.find(o => o.value === trip.transport)?.label || trip.transport }}
            </span>
            <span class="inline-flex items-center gap-1 font-body text-sm text-primary-light">
              <Users class="w-3.5 h-3.5" />{{ trip.group_size }}
            </span>
            <span v-if="trip.budget_rub" class="inline-flex items-center gap-1 font-body text-sm text-primary-light">
              <Wallet class="w-3.5 h-3.5" />{{ trip.budget_rub.toLocaleString("ru-RU") }} ₽
            </span>
          </div>


          <div v-if="trip.invite_token" class="flex items-center gap-2 mt-1">
            <Link2 class="w-3.5 h-3.5 text-accent-dark shrink-0" />
            <input
              :value="getInviteUrl(trip)"
              readonly
              class="font-mono text-xs text-primary bg-white/60 border border-accent/40 rounded-lg px-2.5 py-1.5 flex-1 min-w-0 truncate"
            />
            <button
              class="font-body font-bold text-sm text-accent-dark bg-accent/10 hover:bg-accent/20 border-none rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors shrink-0"
              @click="copyInvite(trip)"
            >
              <Copy class="w-3 h-3 inline" />
              {{ copiedId === trip.id ? '✓' : '' }}
            </button>
          </div>


          <button
            class="flex items-center gap-1.5 font-body text-sm font-bold text-primary-light bg-transparent border-none cursor-pointer p-0 hover:text-accent-dark transition-colors self-start"
            @click="toggleExpand(trip.id)"
          >
            <component :is="expandedTripId === trip.id ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
            {{ expandedTripId === trip.id ? 'Скрыть участников' : 'Показать участников' }}
          </button>
        </div>


        <Transition name="slide">
          <div v-if="expandedTripId === trip.id" class="border-t px-6 py-4 bg-white/30 border border-accent/40">
            <div v-if="tripsStore.loading" class="flex items-center gap-2 py-3">
              <span class="inline-block w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></span>
              <span class="font-body text-base text-primary-light">Загрузка...</span>
            </div>
            <div v-else-if="tripsStore.currentMembers.length === 0" class="py-3">
              <span class="font-body text-base text-primary-light italic">Участников пока нет</span>
            </div>
            <div v-else class="flex flex-col gap-2.5">
              <div
                v-for="member in tripsStore.currentMembers"
                :key="member.id"
                class="flex items-center gap-3 py-2"
              >
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="member.role === 'creator' ? 'bg-accent/20' : 'bg-primary/8'">
                  <User class="w-4 h-4" :class="member.role === 'creator' ? 'text-accent-dark' : 'text-primary-light'" />
                </div>
                <div class="flex-1 min-w-0">
                  <span class="font-body text-base text-primary block truncate">{{ member.display_name || 'Без имени' }}</span>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span v-if="member.role === 'creator'" class="font-body text-xs font-bold text-accent-dark bg-accent/10 rounded px-1.5 py-0.5">Создатель</span>
                    <span v-if="member.is_child" class="font-body text-xs font-bold text-blue-600 bg-blue-500/10 rounded px-1.5 py-0.5">Ребёнок</span>
                  </div>
                </div>
                <div v-if="member.tags?.length" class="flex flex-wrap gap-1 justify-end max-w-[120px]">
                  <span v-for="tag in member.tags.slice(0, 3)" :key="tag" class="font-body text-2xs text-primary-light bg-primary/6 rounded-full px-1.5 py-0.5">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
