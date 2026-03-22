<script setup lang="ts">
import { CloudRain, Sun, Wind, CloudSnow, Cloud, CloudLightning, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Loader2 } from "lucide-vue-next";
import { useWeatherStore } from "~~/store/weather";
import type { WeatherPoint } from "~~/store/weather";

const emit = defineEmits<{
  rebuild: [];
}>();

const weatherStore = useWeatherStore();
const collapsed = ref(true);

const conditionConfig: Record<string, { icon: typeof Sun; label: string }> = {
  clear: { icon: Sun, label: "Ясно" },
  rain: { icon: CloudRain, label: "Дождь" },
  snow: { icon: CloudSnow, label: "Снег" },
  cloudy: { icon: Cloud, label: "Облачно" },
  storm: { icon: CloudLightning, label: "Гроза" },
  wind: { icon: Wind, label: "Ветер" },
};

const severityStyles: Record<string, string> = {
  normal: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warning: "bg-amber-50 border-amber-300 text-amber-900",
  danger: "bg-red-50 border-red-300 text-red-900",
};

const severityDot: Record<string, string> = {
  normal: "bg-emerald-400",
  warning: "bg-amber-400 animate-pulse",
  danger: "bg-red-500 animate-pulse",
};

function getCondition(point: WeatherPoint) {
  return conditionConfig[point.condition] || conditionConfig.cloudy!;
}

onMounted(() => {
  weatherStore.fetchRegionWeather();
});
</script>

<template>
  <Transition name="slide">
    <div v-if="weatherStore.weatherPoints.length > 0 || weatherStore.loading" class="mb-4">

      <div v-if="weatherStore.loading" class="flex items-center gap-2 px-4 py-3 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl">
        <Loader2 class="w-4 h-4 text-primary-light animate-spin" />
        <span class="font-body text-sm text-primary-light">Загрузка погоды…</span>
      </div>

      <div v-else class="bg-white/60 backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300"
        :class="weatherStore.hasWarnings ? 'border-amber-300 shadow-amber-100 shadow-md' : 'border-white/50'"
      >
        <button
          class="w-full flex items-center justify-between px-4 py-3 cursor-pointer bg-transparent border-none"
          @click="collapsed = !collapsed"
        >
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <AlertTriangle v-if="weatherStore.hasWarnings" class="w-4 h-4 text-amber-500" />
              <Cloud v-else class="w-4 h-4 text-primary-light" />
            </div>
            <span class="font-body font-bold text-sm text-primary">
              Погода в регионе
            </span>
            <span v-if="weatherStore.hasWarnings" class="font-body text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              {{ weatherStore.warningPoints.length }} {{ weatherStore.warningPoints.length === 1 ? 'предупреждение' : 'предупреждений' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-1">
              <span
                v-for="wp in weatherStore.weatherPoints"
                :key="wp.point"
                class="w-2 h-2 rounded-full shrink-0"
                :class="severityDot[wp.severity] || 'bg-gray-300'"
              ></span>
            </div>
            <ChevronUp v-if="!collapsed" class="w-4 h-4 text-primary-light transition-transform" />
            <ChevronDown v-else class="w-4 h-4 text-primary-light transition-transform" />
          </div>
        </button>

        <Transition name="slide">
          <div v-if="!collapsed" class="px-4 pb-4 flex flex-col gap-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div
                v-for="wp in weatherStore.weatherPoints"
                :key="wp.point"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all"
                :class="severityStyles[wp.severity] || 'bg-white/50 border-white/50 text-primary'"
              >
                <component :is="getCondition(wp).icon" class="w-5 h-5 shrink-0 opacity-80" />
                <div class="flex-1 min-w-0">
                  <p class="font-body font-bold text-sm truncate">{{ wp.point }}</p>
                  <p class="font-body text-xs opacity-70">{{ getCondition(wp).label }}, {{ wp.temp }}°C</p>
                </div>
                <div class="flex flex-col items-end gap-0.5 shrink-0">
                  <span class="font-body text-lg font-black leading-none">{{ wp.temp }}°</span>
                  <span class="font-body text-2xs opacity-60 flex items-center gap-0.5">
                    <Wind class="w-3 h-3" /> {{ wp.wind_speed }} м/с
                  </span>
                </div>
              </div>
            </div>

            <button
              v-if="weatherStore.needsRebuild"
              class="flex items-center justify-center gap-2 mt-1 w-full font-body font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white border-none rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
              @click="emit('rebuild')"
            >
              <RefreshCw class="w-4 h-4" />
              Перестроить маршрут с учётом погоды
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
