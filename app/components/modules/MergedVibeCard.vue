<script setup lang="ts">

interface VibeAxis {
  label: string;
  emoji: string;
  value: number;
}

const props = defineProps<{
  axes?: VibeAxis[];
  memberCount?: number;
}>();

const defaultAxes: VibeAxis[] = [
  { label: "Активность", emoji: "🏃", value: 65 },
  { label: "Природа", emoji: "🌿", value: 80 },
  { label: "Гастро", emoji: "🍷", value: 55 },
  { label: "Культура", emoji: "🏛", value: 40 },
  { label: "Релакс", emoji: "🧘", value: 70 },
];

const vibeAxes = computed(() => props.axes?.length ? props.axes : defaultAxes);
const maxVal = computed(() => Math.max(1, ...vibeAxes.value.map((a) => a.value)));
</script>

<template>
  <div class="bg-gradient-to-br from-accent/5 via-white to-primary/3 border border-accent/20 rounded-3xl p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-body font-bold text-base text-primary flex items-center gap-1.5">
        ✨ Общий вайб группы
      </h3>
      <span v-if="memberCount" class="font-body text-xs text-primary-light bg-primary/5 px-2.5 py-1 rounded-full">
        {{ memberCount }} участников
      </span>
    </div>

    <div class="flex flex-col gap-3">
      <div
        v-for="axis in vibeAxes"
        :key="axis.label"
        class="flex items-center gap-3"
      >
        <span class="text-lg w-6 text-center shrink-0">{{ axis.emoji }}</span>
        <span class="font-body text-sm text-primary w-20 shrink-0">{{ axis.label }}</span>
        <div class="flex-1 h-3 bg-primary/5 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent transition-all duration-1000 ease-out"
            :style="{ width: `${(axis.value / maxVal) * 100}%` }"
          ></div>
        </div>
        <span class="font-body font-bold text-sm text-accent-dark w-8 text-right">{{ axis.value }}</span>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-accent/10">
      <p class="font-body text-xs text-primary-light text-center">
        Усреднённый вектор вайба всех участников поездки
      </p>
    </div>
  </div>
</template>
