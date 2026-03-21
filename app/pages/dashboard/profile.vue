<script setup lang="ts">
import { useAuthStore } from "~~/store/auth";
import { useVibeStore } from "~~/store/vibe";
import { User, Pencil, Check, X, LogOut, AlertCircle, Sparkles, ArrowRight } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Профиль - КудыТуды",
});

const authStore = useAuthStore();
const vibeStore = useVibeStore();
onMounted(() => {
  authStore.fetchProfile();
});

const editing = ref(false);
const editName = ref("");

function startEdit() {
  editName.value = authStore.user?.display_name || "";
  editing.value = true;
}

async function saveProfile() {
  if (!editName.value.trim()) return;
  const success = await authStore.updateProfile(editName.value.trim());
  if (success) {
    editing.value = false;
  }
}

const roleLabels: Record<string, string> = {
  tourist: "Турист",
  host: "Бизнесмен",
  b2g_admin: "Администратор",
};

function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


const karmaLevel = computed(() => {
  const k = authStore.user?.karma ?? 0;
  if (k >= 100) return { emoji: "💎", label: "Легенда", color: "text-purple-600 bg-purple-500/15" };
  if (k >= 50) return { emoji: "🌳", label: "Опытный", color: "text-green-700 bg-green-500/15" };
  if (k >= 20) return { emoji: "🌿", label: "Исследователь", color: "text-emerald-600 bg-emerald-500/15" };
  return { emoji: "🌱", label: "Новичок", color: "text-lime-600 bg-lime-500/15" };
});

const karmaProgress = computed(() => {
  const k = authStore.user?.karma ?? 0;
  const thresholds = [0, 20, 50, 100] as const;
  let currentMin = 0;
  let currentMax = 20;
  for (let i = 0; i < thresholds.length - 1; i++) {
    const lo = thresholds[i] as number;
    const hi = thresholds[i + 1] as number;
    if (k >= lo && k < hi) {
      currentMin = lo;
      currentMax = hi;
      break;
    }
    if (k >= (thresholds[thresholds.length - 1] as number)) {
      return 100;
    }
  }
  return Math.round(((k - currentMin) / (currentMax - currentMin)) * 100);
});

const vibeAxes = computed(() => vibeStore.displayAxes);
const hasVibe = computed(() => !!authStore.user?.vibe_vector_id);
</script>

<template>
  <div class="w-full max-w-[720px] flex flex-col gap-5">

    <div class="flex items-center gap-6 p-8 bg-white/35 border border-accent/40 rounded-3xl max-sm:flex-col max-sm:text-center">
      <div class="w-[72px] h-[72px] rounded-full bg-accent/20 flex items-center justify-center shrink-0">
        <User class="w-8 h-8 text-accent-dark" />
      </div>
      <div class="flex-1 min-w-0">
        <div v-if="!editing">
          <h2 class="font-heading text-[1.3rem] text-primary mb-0.5">{{ authStore.user?.display_name || "Без имени" }}</h2>
          <p class="font-body text-[0.82rem] text-primary-light mb-2">{{ authStore.user?.email }}</p>
          <button
            class="font-body text-[0.78rem] font-bold text-accent-dark bg-transparent border-none cursor-pointer p-0 flex items-center gap-1.5 hover:text-accent transition-colors max-sm:mx-auto"
            @click="startEdit"
          >
            <Pencil class="w-3.5 h-3.5" />
            Изменить имя
          </button>
        </div>
        <div v-else class="flex flex-col gap-2">
          <div class="flex gap-2 items-center">
            <UiInput
              v-model="editName"
              placeholder="Введите имя"
              class="rounded-2xl px-4 py-3 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent flex-1"
            />
            <UiButton
              size="icon"
              class="bg-accent hover:bg-accent-dark border-accent text-primary-dark rounded-xl shrink-0"
              :disabled="authStore.loading"
              @click="saveProfile"
            >
              <Check class="w-4 h-4" />
            </UiButton>
            <UiButton
              size="icon"
              variant="ghost"
              class="rounded-xl shrink-0"
              @click="editing = false"
            >
              <X class="w-4 h-4" />
            </UiButton>
          </div>
          <UiAlert v-if="authStore.error" variant="destructive" class="rounded-xl">
            <AlertCircle class="h-4 w-4" />
            <UiAlertDescription>{{ authStore.error }}</UiAlertDescription>
          </UiAlert>
        </div>
      </div>
    </div>


    <div class="bg-white/35 border border-accent/40 rounded-3xl p-6">
      <div class="flex items-center justify-between mb-3">
        <span class="font-body text-[0.7rem] font-bold text-primary-light uppercase tracking-wider">Карма</span>
        <span class="font-body text-[0.72rem] font-bold rounded-full px-2.5 py-1" :class="karmaLevel.color">
          {{ karmaLevel.emoji }} {{ karmaLevel.label }}
        </span>
      </div>
      <div class="flex items-center gap-3 mb-2">
        <span class="font-heading text-[1.6rem] text-primary">{{ authStore.user?.karma ?? 0 }}</span>
        <span class="font-body text-[0.72rem] text-primary-light">очков</span>
      </div>
      <div class="w-full h-2 bg-primary/6 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-700 ease-out"
          :style="{ width: `${karmaProgress}%` }"
        ></div>
      </div>
      <div class="flex justify-between mt-1.5">
        <span class="font-body text-[0.6rem] text-primary-light">🌱 0</span>
        <span class="font-body text-[0.6rem] text-primary-light">🌿 20</span>
        <span class="font-body text-[0.6rem] text-primary-light">🌳 50</span>
        <span class="font-body text-[0.6rem] text-primary-light">💎 100</span>
      </div>
    </div>


    <div v-if="hasVibe && vibeAxes.length > 0" class="bg-white/35 border border-accent/40 rounded-3xl p-6">
      <div class="flex items-center gap-2 mb-5">
        <Sparkles class="w-4 h-4 text-accent-dark" />
        <span class="font-body text-[0.7rem] font-bold text-primary-light uppercase tracking-wider">Вайб-паспорт</span>
      </div>

      <div class="flex flex-col gap-4 mb-5">
        <div v-for="axis in vibeAxes" :key="axis.label" class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-[0.68rem] font-body">
            <span class="text-primary-light">{{ axis.label }}</span>
            <span class="text-primary-light">{{ axis.opposite }}</span>
          </div>
          <div class="w-full h-2 bg-primary/8 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-700 ease-out"
              :style="{ width: `${axis.value * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div v-if="vibeStore.profile?.extracted_tags?.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in vibeStore.profile.extracted_tags"
          :key="tag"
          class="font-body font-bold text-[0.65rem] text-accent-dark bg-accent/10 px-2.5 py-1 rounded-full"
        >
          #{{ tag }}
        </span>
      </div>
    </div>


    <NuxtLink
      v-if="!hasVibe"
      to="/vibe/voice"
      class="flex items-center gap-4 p-6 bg-accent/8 border border-accent/20 rounded-3xl no-underline transition-all duration-200 hover:bg-accent/15 hover:border-accent/40 group"
    >
      <div class="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
        <Sparkles class="w-5 h-5 text-accent-dark" />
      </div>
      <div class="flex-1">
        <span class="font-body font-bold text-[0.88rem] text-primary block">Пройти профилирование</span>
        <span class="font-body text-[0.75rem] text-primary-light">ИИ подберёт места по вашему настроению</span>
      </div>
      <ArrowRight class="w-5 h-5 text-accent-dark group-hover:translate-x-1 transition-transform" />
    </NuxtLink>


    <div class="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
      <div class="flex flex-col gap-2 py-5 px-6 bg-white/35 border border-accent/40 rounded-3xl">
        <span class="font-body text-[0.7rem] font-bold text-primary-light uppercase tracking-wider">Роль</span>
        <UiBadge variant="secondary" class="self-start rounded-lg bg-primary/10 text-primary font-body text-[0.78rem]">
          {{ roleLabels[authStore.user?.role || 'tourist'] || 'Турист' }}
        </UiBadge>
      </div>

      <div class="flex flex-col gap-2 py-5 px-6 bg-white/35 border border-accent/40 rounded-3xl">
        <span class="font-body text-[0.7rem] font-bold text-primary-light uppercase tracking-wider">Дата регистрации</span>
        <span class="font-body text-[0.92rem] text-primary">{{ formatDateTime(authStore.user?.created_at) }}</span>
      </div>
    </div>


    <div class="pt-2">
      <UiButton
        variant="outline"
        class="rounded-2xl font-body border-red-500/30 text-red-600 hover:bg-red-500/8 hover:text-red-700"
        @click="authStore.logout()"
      >
        <LogOut class="w-4 h-4 mr-2" />
        Выйти из аккаунта
      </UiButton>
    </div>
  </div>
</template>
