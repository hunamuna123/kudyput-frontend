<script setup lang="ts">
import { CalendarIcon, Car, Bus, Footprints, Bike, Users, Check, ArrowLeft, Loader2, AlertCircle, Plus, Minus, Copy, Link2, Baby } from "lucide-vue-next";
import { useTripsStore } from "~~/store/trips";
import { useAuthStore } from "~~/store/auth";

useHead({
  title: "Новая поездка - КудыТуды",
});

const tripsStore = useTripsStore();
const authStore = useAuthStore();

const dateFrom = ref("");
const dateTo = ref("");
const budgetTier = ref("comfort");
const budgetRub = ref(50000);
const transport = ref("car");
const format = ref("weekend");
const groupSize = ref(2);
const adults = ref(2);
const children = ref<{ age: number }[]>([]);
const isSubmitting = ref(false);
const createdTrip = ref<{ id: string; invite_token: string } | null>(null);
const copied = ref(false);

const formatOptions = [
  { label: "☀️ Одним днём", value: "day_trip" },
  { label: "🌙 Выходные", value: "weekend" },
  { label: "🗓 Многодневный", value: "multi_day" },
];

const budgetOptions = [
  { label: "💰 Эконом", value: "economy", range: "до 30 000 ₽" },
  { label: "✨ Комфорт", value: "comfort", range: "30–80 000 ₽" },
  { label: "💎 Премиум", value: "premium", range: "от 80 000 ₽" },
];

const transportOptions = [
  { label: "Авто", value: "car", icon: Car },
  { label: "Общественный", value: "public", icon: Bus },
  { label: "Пешком", value: "walk", icon: Footprints },
  { label: "Велосипед", value: "bike", icon: Bike },
];

watch([adults, children], () => {
  groupSize.value = adults.value + children.value.length;
}, { deep: true });

onMounted(() => {
  authStore.restoreSession();
});

function addChild() {
  children.value.push({ age: 5 });
}
function removeChild(idx: number) {
  children.value.splice(idx, 1);
}

function inviteUrl(): string {
  if (!createdTrip.value) return "";
  return `${window.location.origin}/trip/${createdTrip.value.id}/join?token=${createdTrip.value.invite_token}`;
}

async function copyInvite() {
  try {
    await navigator.clipboard.writeText(inviteUrl());
    copied.value = true;
    setTimeout(() => copied.value = false, 2000);
  } catch { /* clipboard not available */ }
}

async function handleCreate() {
  if (!dateFrom.value || !dateTo.value) return;
  isSubmitting.value = true;

  const result = await tripsStore.createTrip({
    date_from: dateFrom.value,
    date_to: dateTo.value,
    budget_rub: budgetRub.value,
    budget_tier: budgetTier.value,
    transport: transport.value,
    group_size: groupSize.value,
    group_composition: {
      adults: adults.value,
      children: children.value,
    },
  });

  isSubmitting.value = false;

  if (result) {
    createdTrip.value = { id: result.id, invite_token: result.invite_token };
  }
}
</script>

<template>
  <div class="min-h-screen bg-white border border-accent/40 flex flex-col items-center justify-start relative overflow-hidden px-5 pt-8 pb-16">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/8 top-[-100px] left-[15%] blur-[120px] pointer-events-none"></div>

    <div class="relative z-10 max-w-lg w-full">
      <NuxtLink to="/start" class="font-body text-[0.78rem] text-primary-light no-underline mb-8 inline-flex items-center gap-1.5 hover:text-primary transition-colors">
        <ArrowLeft class="w-3.5 h-3.5" />
        Назад
      </NuxtLink>


      <div v-if="createdTrip" class="flex flex-col items-center gap-6 text-center mt-4">
        <div class="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
          <Check class="w-10 h-10 text-accent-dark" />
        </div>

        <div>
          <h1 class="font-heading text-primary mb-2" style="font-size: clamp(1.2rem, 3vw, 1.8rem);">
            Поездка <span class="text-accent">создана!</span>
          </h1>
          <p class="font-body font-light text-primary-light text-[0.85rem] leading-relaxed">
            Поделитесь ссылкой с участниками, чтобы они присоединились.
          </p>
        </div>


        <div class="w-full bg-white/50 border border-accent/40 rounded-[24px] p-5">
          <div class="flex items-center gap-2 mb-3">
            <Link2 class="w-4 h-4 text-accent-dark" />
            <span class="font-body font-bold text-[0.82rem] text-primary">Ссылка-приглашение</span>
          </div>
          <div class="flex gap-2">
            <input
              :value="inviteUrl()"
              readonly
              class="flex-1 font-mono text-[0.72rem] text-primary bg-white/60 border border-accent/40 rounded-xl px-3 py-2.5 truncate"
            />
            <button
              class="flex items-center gap-1.5 font-body font-bold text-[0.78rem] bg-accent hover:bg-accent-dark text-primary-dark border-none rounded-xl px-4 py-2.5 cursor-pointer transition-all duration-200 shrink-0"
              @click="copyInvite"
            >
              <Copy class="w-3.5 h-3.5" />
              {{ copied ? 'Скопировано!' : 'Копировать' }}
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full">
          <NuxtLink
            to="/dashboard/trips"
            class="flex-1 flex items-center justify-center gap-2 font-body font-bold text-[0.85rem] text-white bg-accent rounded-2xl px-6 py-3.5 no-underline transition-all duration-200 hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-lg"
          >
            Мои поездки
          </NuxtLink>
          <NuxtLink
            to="/map"
            class="flex-1 flex items-center justify-center font-body font-bold text-[0.85rem] text-primary bg-transparent border-2 border-primary/20 rounded-2xl px-6 py-3.5 no-underline transition-all duration-200 hover:border-primary hover:bg-primary hover:text-white"
          >
            Открыть карту
          </NuxtLink>
        </div>
      </div>


      <template v-else>
        <span class="inline-block font-body font-bold text-[0.65rem] tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-4 py-1.5 rounded-full mb-4">
          Детали поездки
        </span>

        <h1 class="font-heading text-primary mb-2 leading-[1.25]" style="font-size: clamp(1.2rem, 3vw, 1.8rem);">
          Расскажите о <span class="text-accent">путешествии</span>
        </h1>
        <p class="font-body font-light text-primary-light text-[0.85rem] leading-relaxed mb-8">
          Когда, как и на какой бюджет — мы подберём идеальные места.
        </p>

        <form class="flex flex-col gap-5" @submit.prevent="handleCreate">
          <div class="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5">
            <div class="flex flex-col gap-1.5">
              <label class="font-body text-[0.78rem] font-bold text-primary">Дата начала</label>
              <UiInput
                v-model="dateFrom"
                type="date"
                class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent w-full"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-body text-[0.78rem] font-bold text-primary">Дата окончания</label>
              <UiInput
                v-model="dateTo"
                type="date"
                class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent w-full"
              />
            </div>
          </div>


          <div class="flex flex-col gap-1.5">
            <label class="font-body text-[0.78rem] font-bold text-primary">Бюджет</label>
            <UiToggleGroup type="single" :model-value="budgetTier" @update:model-value="(v: unknown) => { if (v) budgetTier = String(v) }" class="justify-start flex-wrap">
              <UiToggleGroupItem
                v-for="opt in budgetOptions"
                :key="opt.value"
                :value="opt.value"
                class="rounded-2xl px-5 py-2.5 font-body text-[0.82rem] data-[state=on]:bg-accent data-[state=on]:text-primary-dark data-[state=on]:border-accent border border-accent/40 transition-all duration-200"
              >
                {{ opt.label }}
              </UiToggleGroupItem>
            </UiToggleGroup>
            <span class="font-body text-[0.68rem] text-primary-light">
              {{ budgetOptions.find(o => o.value === budgetTier)?.range }}
            </span>
          </div>


          <div class="flex flex-col gap-1.5">
            <label class="font-body text-[0.78rem] font-bold text-primary">Бюджет (₽)</label>
            <UiInput
              v-model.number="budgetRub"
              type="number"
              min="1000"
              step="1000"
              class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent max-w-[200px]"
            />
          </div>


          <div class="flex flex-col gap-1.5">
            <label class="font-body text-[0.78rem] font-bold text-primary">Транспорт</label>
            <UiToggleGroup type="single" :model-value="transport" @update:model-value="(v: unknown) => { if (v) transport = String(v) }" class="justify-start flex-wrap">
              <UiToggleGroupItem
                v-for="opt in transportOptions"
                :key="opt.value"
                :value="opt.value"
                class="rounded-2xl px-5 py-2.5 font-body text-[0.82rem] data-[state=on]:bg-accent data-[state=on]:text-primary-dark data-[state=on]:border-accent border border-accent/40 transition-all duration-200 inline-flex items-center gap-1.5"
              >
                <component :is="opt.icon" class="w-4 h-4" />
                {{ opt.label }}
              </UiToggleGroupItem>
            </UiToggleGroup>
          </div>


          <div class="flex flex-col gap-1.5">
            <label class="font-body text-[0.78rem] font-bold text-primary">Формат поездки</label>
            <UiToggleGroup type="single" :model-value="format" @update:model-value="(v: unknown) => { if (v) format = String(v) }" class="justify-start flex-wrap">
              <UiToggleGroupItem
                v-for="opt in formatOptions"
                :key="opt.value"
                :value="opt.value"
                class="rounded-2xl px-5 py-2.5 font-body text-[0.82rem] data-[state=on]:bg-accent data-[state=on]:text-primary-dark data-[state=on]:border-accent border border-accent/40 transition-all duration-200"
              >
                {{ opt.label }}
              </UiToggleGroupItem>
            </UiToggleGroup>
          </div>


          <div class="flex flex-col gap-3">
            <label class="font-body text-[0.78rem] font-bold text-primary flex items-center gap-1.5">
              <Users class="w-4 h-4" />
              Состав группы
            </label>

            <div class="bg-white/30 border border-accent/40 rounded-2xl p-5 flex flex-col gap-4">

              <div class="flex items-center justify-between">
                <span class="font-body text-[0.82rem] text-primary">Взрослые</span>
                <div class="flex items-center gap-2.5">
                  <button
                    type="button"
                    class="w-8 h-8 rounded-full bg-primary/8 hover:bg-primary/15 border-none cursor-pointer flex items-center justify-center transition-colors disabled:opacity-30"
                    :disabled="adults <= 1"
                    @click="adults = Math.max(1, adults - 1)"
                  >
                    <Minus class="w-3.5 h-3.5 text-primary" />
                  </button>
                  <span class="font-body font-bold text-[1rem] text-primary w-6 text-center">{{ adults }}</span>
                  <button
                    type="button"
                    class="w-8 h-8 rounded-full bg-primary/8 hover:bg-primary/15 border-none cursor-pointer flex items-center justify-center transition-colors"
                    @click="adults++"
                  >
                    <Plus class="w-3.5 h-3.5 text-primary" />
                  </button>
                </div>
              </div>


              <div class="h-px bg-primary/8"></div>
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <span class="font-body text-[0.82rem] text-primary flex items-center gap-1.5">
                    <Baby class="w-4 h-4 text-accent-dark" />
                    Дети
                  </span>
                  <button
                    type="button"
                    class="flex items-center gap-1 font-body font-bold text-[0.75rem] text-accent-dark bg-accent/10 hover:bg-accent/20 border-none rounded-full px-3 py-1.5 cursor-pointer transition-colors"
                    @click="addChild"
                  >
                    <Plus class="w-3 h-3" />
                    Добавить
                  </button>
                </div>
                <div v-for="(child, idx) in children" :key="idx" class="flex items-center gap-3">
                  <span class="font-body text-[0.78rem] text-primary-light shrink-0">Возраст:</span>
                  <UiInput
                    v-model.number="child.age"
                    type="number"
                    min="0"
                    max="17"
                    class="rounded-xl px-3 py-2 font-body text-[0.82rem] bg-white/25 border border-accent/40 focus-visible:ring-accent w-20"
                  />
                  <span class="font-body text-[0.68rem] text-primary-light">лет</span>
                  <button
                    type="button"
                    class="ml-auto w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border-none cursor-pointer flex items-center justify-center transition-colors"
                    @click="removeChild(idx)"
                  >
                    <Minus class="w-3 h-3 text-red-600" />
                  </button>
                </div>
                <p v-if="children.length === 0" class="font-body text-[0.72rem] text-primary-light italic">
                  Без детей
                </p>
              </div>

              <div class="h-px bg-primary/8"></div>
              <div class="flex items-center justify-between">
                <span class="font-body text-[0.78rem] text-primary-light">Всего участников</span>
                <span class="font-body font-bold text-[0.88rem] text-accent-dark">{{ groupSize }}</span>
              </div>
            </div>
          </div>

          <UiAlert v-if="tripsStore.error" variant="destructive" class="rounded-2xl">
            <AlertCircle class="h-4 w-4" />
            <UiAlertDescription>{{ tripsStore.error }}</UiAlertDescription>
          </UiAlert>

          <UiButton
            type="submit"
            :disabled="!dateFrom || !dateTo || isSubmitting"
            class="w-full mt-2 bg-accent hover:bg-accent-dark border-accent text-primary-dark font-body font-bold rounded-2xl py-3.5 text-[0.88rem] transition-all duration-200"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
            <Check v-else class="w-4 h-4 mr-2" />
            Создать поездку
          </UiButton>
        </form>
      </template>
    </div>
  </div>
</template>
