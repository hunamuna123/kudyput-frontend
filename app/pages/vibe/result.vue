<script setup lang="ts">
import { Sparkles, ArrowRight, ArrowLeft, Loader2, MapPin, Star, Baby, Tag } from "lucide-vue-next";
import { useVibeStore } from "~~/store/vibe";
import { useAuthStore } from "~~/store/auth";

useHead({
  title: "Вайб-паспорт - КудыТуды",
});

const vibeStore = useVibeStore();
const authStore = useAuthStore();
const isLoadingRecs = ref(false);
const showRecs = ref(false);

onMounted(() => {
  authStore.restoreSession();
});

const axes = computed(() => {
  if (vibeStore.displayAxes.length > 0) return vibeStore.displayAxes;
  return [
    { label: "🔇 Уединение", opposite: "Компания 🎉", value: 0.7 },
    { label: "🧘 Релакс", opposite: "Адреналин ⚡", value: 0.3 },
    { label: "🍷 Гастрономия", opposite: "Природа 🌿", value: 0.6 },
    { label: "🏛 Культура", opposite: "Приключения 🗺", value: 0.4 },
  ];
});

const summary = computed(() =>
  vibeStore.profile?.vibe_summary ||
  "Вы цените тишину и уединение, тянетесь к гастрономическим открытиям. Идеальный маршрут — камерные винодельни и горные тропы вдали от туристов."
);

const title = computed(() =>
  vibeStore.profile?.vibe_passport_title || "Искатель тишины"
);

const tags = computed(() =>
  vibeStore.profile?.extracted_tags?.length
    ? vibeStore.profile.extracted_tags
    : ["тишина", "вино", "горы", "гастрономия", "уединение"]
);

const categoryEmoji: Record<string, string> = {
  winery: "🍷",
  farm: "🐐",
  trail: "🥾",
  gastro: "🍽",
  nature: "🌿",
  camping: "⛺",
  resort: "🏨",
  extreme: "⚡",
  cultural: "🏛",
  beach: "🏖",
};

const densityLabels: Record<string, { text: string; class: string }> = {
  green: { text: "Скрытое место", class: "bg-green-500/15 text-green-700" },
  yellow: { text: "Сезонное", class: "bg-yellow-500/15 text-yellow-700" },
  red: { text: "Популярное", class: "bg-red-500/15 text-red-700" },
};

async function handleShowRecommendations() {
  isLoadingRecs.value = true;
  await vibeStore.finalize({ limit: 10 });
  isLoadingRecs.value = false;
  showRecs.value = true;
}
</script>

<template>
  <div class="min-h-screen bg-cream-light flex flex-col items-center justify-center relative overflow-hidden px-5 py-12">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/10 -top-20 right-[5%] blur-[120px] pointer-events-none"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 -bottom-16 left-[8%] blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 w-full" :class="showRecs ? 'max-w-4xl' : 'max-w-xl'">
      <div class="text-center mb-8">
        <NuxtLink to="/vibe/voice" class="font-body text-[0.78rem] text-primary-light no-underline mb-6 inline-flex items-center gap-1.5 hover:text-primary transition-colors">
          <ArrowLeft class="w-3.5 h-3.5" />
          Назад
        </NuxtLink>

        <div class="flex flex-col items-center gap-3 mt-4">
          <span class="inline-flex items-center gap-1.5 font-body font-bold text-[0.65rem] tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-4 py-1.5 rounded-full">
            <Sparkles class="w-3.5 h-3.5" />
            Ваш вайб-паспорт
          </span>
          <h1 class="font-heading text-primary leading-[1.25]" style="font-size: clamp(1.2rem, 3vw, 1.8rem);">
            {{ title }}
          </h1>
        </div>
      </div>


      <div class="bg-cream/50 border border-cream/60 rounded-3xl p-8 md:p-10 mb-6">

        <div class="flex flex-col gap-5 mb-8">
          <div v-for="axis in axes" :key="axis.label" class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-[0.72rem] font-body">
              <span class="text-primary-light">{{ axis.label }}</span>
              <span class="text-primary-light">{{ axis.opposite }}</span>
            </div>
            <div class="w-full h-2.5 bg-primary/8 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-1000 ease-out"
                :style="{ width: `${axis.value * 100}%` }"
              ></div>
            </div>
          </div>
        </div>


        <div class="bg-cream-light/60 rounded-2xl p-5 mb-6">
          <p class="font-body text-[0.85rem] text-primary leading-relaxed italic">
            «{{ summary }}»
          </p>
        </div>


        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in tags"
            :key="tag"
            class="font-body font-bold text-[0.7rem] text-accent-dark bg-accent/10 px-3 py-1.5 rounded-full"
          >
            #{{ tag }}
          </span>
        </div>
      </div>


      <p v-if="vibeStore.profile?.processing_time_ms" class="text-center font-body text-[0.68rem] text-primary-light opacity-50 mb-4">
        Обработано за {{ (vibeStore.profile.processing_time_ms / 1000).toFixed(1) }}с
      </p>


      <div v-if="!showRecs" class="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          class="flex-1 flex items-center justify-center gap-2 font-body font-bold text-[0.88rem] text-white bg-accent rounded-2xl px-6 py-3.5 border-none cursor-pointer transition-all duration-200 hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoadingRecs"
          @click="handleShowRecommendations"
        >
          <Loader2 v-if="isLoadingRecs" class="w-4 h-4 animate-spin" />
          <template v-else>
            <Sparkles class="w-4 h-4" />
            Показать рекомендации
          </template>
        </button>
        <NuxtLink
          to="/vibe/swipe"
          class="flex items-center justify-center font-body font-bold text-[0.85rem] text-primary bg-transparent border-2 border-primary/20 rounded-2xl px-6 py-3.5 no-underline transition-all duration-200 hover:border-primary hover:bg-primary hover:text-cream"
        >
          Уточнить свайпами
        </NuxtLink>
      </div>


      <div v-if="showRecs" class="mt-8">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-heading text-primary text-[1.15rem]">
            Top-{{ vibeStore.recommendations.length }} для вас
          </h2>
          <span v-if="vibeStore.isCurated" class="font-body text-[0.68rem] text-primary-light bg-primary/8 rounded-full px-3 py-1">
            демо-подборка
          </span>
        </div>


        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <NuxtLink
            v-for="rec in vibeStore.recommendations"
            :key="rec.location_id"
            :to="`/location/${rec.location_id}`"
            class="group flex flex-col bg-cream/50 border border-cream/60 rounded-[24px] overflow-hidden no-underline transition-all duration-250 hover:border-accent/40 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(40,90,113,0.08)]"
          >

            <div v-if="rec.preview_image_url" class="h-36 overflow-hidden bg-primary/5">
              <img
                :src="rec.preview_image_url"
                :alt="rec.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div v-else class="h-24 bg-gradient-to-br from-accent/10 to-primary/8 flex items-center justify-center">
              <MapPin class="w-8 h-8 text-primary/20" />
            </div>

            <div class="flex flex-col gap-2.5 p-5">

              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-body text-[0.68rem] font-bold text-primary-light bg-primary/6 rounded-full px-2.5 py-0.5">
                  {{ categoryEmoji[rec.category] || '📍' }} {{ rec.category }}
                </span>
                <span
                  :class="densityLabels[rec.density_level]?.class"
                  class="font-body text-[0.65rem] font-bold rounded-full px-2.5 py-0.5"
                >
                  {{ densityLabels[rec.density_level]?.text }}
                </span>
                <span v-if="rec.child_friendly" class="font-body text-[0.65rem] font-bold text-blue-600 bg-blue-500/10 rounded-full px-2.5 py-0.5">
                  <Baby class="w-3 h-3 inline" /> Для детей
                </span>
              </div>


              <div class="flex items-start justify-between gap-2">
                <h3 class="font-heading text-[0.95rem] text-primary leading-snug">{{ rec.name }}</h3>
                <span class="shrink-0 flex items-center gap-1 font-body font-bold text-[0.75rem] text-accent-dark bg-accent/15 rounded-lg px-2 py-1">
                  <Star class="w-3 h-3" />
                  {{ Math.round(rec.score * 100) }}%
                </span>
              </div>


              <p v-if="rec.description_short" class="font-body text-[0.78rem] text-primary-light leading-relaxed line-clamp-2">
                {{ rec.description_short }}
              </p>


              <p v-if="rec.reason_short" class="font-body text-[0.72rem] text-accent-dark italic">
                {{ rec.reason_short }}
              </p>


              <div v-if="rec.tags_match?.length" class="flex flex-wrap gap-1.5">
                <span
                  v-for="mt in rec.tags_match"
                  :key="mt"
                  class="font-body text-[0.62rem] font-bold text-accent-dark bg-accent/10 rounded-full px-2 py-0.5 flex items-center gap-0.5"
                >
                  <Tag class="w-2.5 h-2.5" />
                  {{ mt }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>


        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink
            to="/trip/new"
            class="flex-1 flex items-center justify-center gap-2 font-body font-bold text-[0.88rem] text-white bg-accent rounded-2xl px-6 py-3.5 no-underline transition-all duration-200 hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-lg"
          >
            🗺 Собрать маршрут
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
          <NuxtLink
            to="/dashboard/map"
            class="flex items-center justify-center font-body font-bold text-[0.85rem] text-primary bg-transparent border-2 border-primary/20 rounded-2xl px-6 py-3.5 no-underline transition-all duration-200 hover:border-primary hover:bg-primary hover:text-cream"
          >
            Смотреть на карте
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
