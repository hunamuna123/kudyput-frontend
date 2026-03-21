<script setup lang="ts">
import { Home, Globe, Navigation, Car, User } from "lucide-vue-next";

const { isActive } = useNavActive();

interface NavTab {
  label: string;
  icon: typeof Home;
  to: string;
}

const tabs: NavTab[] = [
  { label: "Обзор", icon: Home, to: "/dashboard" },
  { label: "Карта", icon: Globe, to: "/dashboard/map" },
  { label: "Маршрут", icon: Navigation, to: "/dashboard/route" },
  { label: "Поездки", icon: Car, to: "/dashboard/trips" },
  { label: "Профиль", icon: User, to: "/dashboard/profile" },
];
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-[1000] px-3 pb-2 md:hidden">
    <div class="flex items-center justify-around bg-cream/92 border border-primary/8 rounded-[28px] px-1 py-2 shadow-[0_-4px_24px_rgba(40,90,113,0.08)] backdrop-blur-2xl">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-col items-center gap-1 no-underline px-2 py-1 min-w-14 transition-all duration-200"
      >
        <div
          class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-250"
          :class="isActive(tab.to) ? 'bg-primary shadow-[0_4px_16px_rgba(40,90,113,0.25)]' : ''"
        >
          <component
            :is="tab.icon"
            class="w-5 h-5 transition-colors duration-200"
            :class="isActive(tab.to) ? 'text-cream-light' : 'text-primary-light'"
          />
        </div>
        <span
          class="font-body text-[0.62rem] font-bold whitespace-nowrap transition-colors duration-200"
          :class="isActive(tab.to) ? 'text-primary' : 'text-primary-light'"
        >
          {{ tab.label }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
