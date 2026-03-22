<script setup lang="ts">
import { FileText, Users, MapPin, Car, CalendarCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Отчёты - КудыТуды",
});

const metrics = ref([
  { label: "Локации", value: 47, change: 12, icon: MapPin, color: "bg-accent/15 text-accent-dark" },
  { label: "Пользователи", value: 1284, change: 8, icon: Users, color: "bg-primary/8 text-primary" },
  { label: "Поездки", value: 312, change: -3, icon: Car, color: "bg-purple-500/12 text-purple-700" },
  { label: "Бронирования", value: 156, change: 22, icon: CalendarCheck, color: "bg-green-500/12 text-green-700" },
]);

interface RecentEvent {
  id: number;
  type: string;
  description: string;
  time: string;
  icon: string;
}

const recentEvents = ref<RecentEvent[]>([
  { id: 1, type: "booking", description: "Новое бронирование: Козья ферма дяди Вани", time: "5 мин назад", icon: "📅" },
  { id: 2, type: "location", description: "Опубликована локация: Винодельня Лефкадия", time: "32 мин назад", icon: "📍" },
  { id: 3, type: "user", description: "Новая регистрация: tourist@example.com", time: "1 ч назад", icon: "👤" },
  { id: 4, type: "trip", description: "Создана поездка: Сочи — Адлер (4 чел.)", time: "2 ч назад", icon: "🚗" },
  { id: 5, type: "review", description: "Новый отзыв: ⭐⭐⭐⭐⭐ — Горная тропа", time: "3 ч назад", icon: "⭐" },
  { id: 6, type: "booking", description: "Подтверждена бронь: Кемпинг в горах", time: "4 ч назад", icon: "✅" },
  { id: 7, type: "location", description: "Обновлена локация: Дольмены Геленджика", time: "5 ч назад", icon: "✏️" },
  { id: 8, type: "user", description: "Новый хост зарегистрирован: Ферма солнца", time: "6 ч назад", icon: "🏠" },
]);

const topCategories = ref([
  { name: "Пляж", count: 156, pct: 85 },
  { name: "Природа", count: 134, pct: 73 },
  { name: "Винодельня", count: 98, pct: 53 },
  { name: "Гастрономия", count: 87, pct: 47 },
  { name: "Кемпинг", count: 65, pct: 35 },
]);
</script>

<template>
  <div class="w-full">

    <div class="flex items-center gap-2.5 mb-6">
      <div class="w-10 h-10 flex items-center justify-center rounded-[12px] bg-accent/15 text-accent-dark">
        <FileText class="w-5 h-5" />
      </div>
      <h1 class="font-body font-bold text-2xl text-primary">Отчёты и метрики</h1>
    </div>


    <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
      <div
        v-for="m in metrics"
        :key="m.label"
        class="flex flex-col gap-2 p-5 bg-white/35 border border-accent/40 rounded-3xl"
      >
        <div class="flex items-center justify-between">
          <div class="w-9 h-9 flex items-center justify-center rounded-[10px]" :class="m.color">
            <component :is="m.icon" class="w-4.5 h-4.5" />
          </div>
          <div
            class="flex items-center gap-0.5 font-body font-bold text-xs rounded-full px-2 py-0.5"
            :class="m.change >= 0 ? 'text-green-700 bg-green-500/12' : 'text-red-600 bg-red-500/12'"
          >
            <ArrowUpRight v-if="m.change >= 0" class="w-3 h-3" />
            <ArrowDownRight v-else class="w-3 h-3" />
            {{ Math.abs(m.change) }}%
          </div>
        </div>
        <span class="font-body font-bold text-2xl text-primary">{{ m.value.toLocaleString("ru-RU") }}</span>
        <span class="font-body text-xs text-primary-light">{{ m.label }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <div class="bg-white/35 border border-accent/40 rounded-3xl p-6">
        <h2 class="font-body font-bold text-lg text-primary mb-4">Популярные категории</h2>
        <div class="flex flex-col gap-3">
          <div v-for="cat in topCategories" :key="cat.name" class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <span class="font-body font-bold text-base text-primary">{{ cat.name }}</span>
              <span class="font-body text-sm text-primary-light">{{ cat.count }} запросов</span>
            </div>
            <div class="w-full h-2 bg-primary/6 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-700"
                :style="{ width: `${cat.pct}%` }"
              />
            </div>
          </div>
        </div>
      </div>


      <div class="bg-white/35 border border-accent/40 rounded-3xl p-6">
        <h2 class="font-body font-bold text-lg text-primary mb-4">Последние события</h2>
        <div class="flex flex-col gap-0">
          <div
            v-for="event in recentEvents"
            :key="event.id"
            class="flex items-start gap-3 py-3 border-b border-primary/5 last:border-none"
          >
            <span class="text-lg shrink-0 mt-0.5">{{ event.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-body text-base text-primary truncate">{{ event.description }}</p>
              <span class="font-body text-xs text-primary-light">{{ event.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="mt-5 font-body text-xs text-primary-light opacity-40">
      Данные mock — демонстрация интерфейса аналитики
    </p>
  </div>
</template>
