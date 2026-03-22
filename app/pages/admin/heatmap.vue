<script setup lang="ts">
import { Flame, TrendingUp } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Тепловая карта - КудыТуды",
});

interface HeatCell {
  region: string;
  category: string;
  intensity: number;
}

const regions = ["Сочи", "Анапа", "Геленджик", "Новороссийск", "Краснодар", "Горячий Ключ", "Адыгея", "Туапсе"];
const categories = ["Пляж", "Природа", "Вино", "Гастро", "Ферма", "Экстрим", "Культура", "Кемпинг"];

const heatData = ref<HeatCell[]>([]);

function generateMockData() {
  const cells: HeatCell[] = [];
  for (const region of regions) {
    for (const category of categories) {
      cells.push({
        region,
        category,
        intensity: Math.round(Math.random() * 100),
      });
    }
  }
  heatData.value = cells;
}

function getIntensity(region: string, category: string): number {
  return heatData.value.find((c) => c.region === region && c.category === category)?.intensity || 0;
}

function intensityColor(val: number): string {
  if (val >= 80) return "bg-red-500/70 text-white";
  if (val >= 60) return "bg-orange-400/60 text-white";
  if (val >= 40) return "bg-yellow-400/50 text-primary";
  if (val >= 20) return "bg-green-400/30 text-primary";
  return "bg-primary/5 text-primary-light";
}

onMounted(generateMockData);
</script>

<template>
  <div class="w-full">

    <div class="flex items-center gap-2.5 mb-6">
      <div class="w-10 h-10 flex items-center justify-center rounded-[12px] bg-red-500/12 text-red-600">
        <Flame class="w-5 h-5" />
      </div>
      <div>
        <h1 class="font-body font-bold text-2xl text-primary">Тепловая карта спроса</h1>
        <p class="font-body text-sm text-primary-light">Интенсивность запросов по регионам и категориям</p>
      </div>
    </div>


    <div class="overflow-x-auto rounded-3xl border border-accent/40 bg-white/35">
      <table class="w-full border-collapse min-w-[700px]">
        <thead>
          <tr>
            <th class="sticky left-0 z-10 bg-white/90 backdrop-blur-sm px-4 py-3 text-left font-body font-bold text-sm text-primary-light uppercase tracking-wider border-b border-accent/20">
              Регион
            </th>
            <th
              v-for="cat in categories"
              :key="cat"
              class="px-3 py-3 text-center font-body font-bold text-xs text-primary-light uppercase tracking-wider border-b border-accent/20 whitespace-nowrap"
            >
              {{ cat }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="region in regions" :key="region" class="hover:bg-accent/4 transition-colors">
            <td class="sticky left-0 z-10 bg-white/90 backdrop-blur-sm px-4 py-2.5 font-body font-bold text-base text-primary border-b border-accent/10 whitespace-nowrap">
              {{ region }}
            </td>
            <td
              v-for="cat in categories"
              :key="cat"
              class="px-2 py-2 border-b border-accent/10 text-center"
            >
              <div
                class="w-full rounded-lg px-2 py-1.5 font-body font-bold text-sm transition-colors"
                :class="intensityColor(getIntensity(region, cat))"
              >
                {{ getIntensity(region, cat) }}%
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


    <div class="mt-5 flex items-center gap-4 flex-wrap">
      <span class="font-body text-xs text-primary-light">Интенсивность:</span>
      <div class="flex gap-1.5">
        <span class="w-8 h-5 rounded bg-primary/5 flex items-center justify-center font-body text-2xs text-primary-light">0</span>
        <span class="w-8 h-5 rounded bg-green-400/30 flex items-center justify-center font-body text-2xs">20</span>
        <span class="w-8 h-5 rounded bg-yellow-400/50 flex items-center justify-center font-body text-2xs">40</span>
        <span class="w-8 h-5 rounded bg-orange-400/60 flex items-center justify-center font-body text-2xs text-white">60</span>
        <span class="w-8 h-5 rounded bg-red-500/70 flex items-center justify-center font-body text-2xs text-white">80+</span>
      </div>
    </div>

    <p class="mt-3 font-body text-xs text-primary-light opacity-40">
      Данные mock — демонстрация интерфейса B2G-аналитики
    </p>
  </div>
</template>
