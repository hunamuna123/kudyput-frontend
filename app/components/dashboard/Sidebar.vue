<script setup lang="ts">
import { Home, MapPin, Globe, Car, User, Navigation } from "lucide-vue-next";

const { isActive } = useNavActive();

interface NavItem {
  label: string;
  icon: typeof Home;
  to: string;
}

const navItems: NavItem[] = [
  { label: "Обзор", icon: Home, to: "/dashboard" },
  { label: "Локации", icon: MapPin, to: "/dashboard/locations" },
  { label: "Карта", icon: Globe, to: "/dashboard/map" },
  { label: "Маршрут", icon: Navigation, to: "/dashboard/route" },
  { label: "Поездки", icon: Car, to: "/dashboard/trips" },
  { label: "Профиль", icon: User, to: "/dashboard/profile" },
];
</script>

<template>
  <aside class="w-60 min-h-screen bg-cream border-r border-primary/8 flex flex-col py-6 px-4 shrink-0">
    <div class="flex items-center gap-2.5 mb-10 px-2">
      <NuxtLink to="/" class="font-body font-bold text-[1.1rem] text-primary no-underline transition-colors duration-200 hover:text-accent">
        КудыТуды
      </NuxtLink>
      <span class="font-body text-[0.6rem] font-bold uppercase tracking-widest text-accent-dark bg-accent/15 px-2 py-0.5 rounded-md">Panel</span>
    </div>

    <nav class="flex flex-col gap-1 flex-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3.5 py-3 rounded-xl no-underline text-primary-light font-body text-[0.88rem] font-light transition-all duration-200 hover:bg-primary/6 hover:text-primary"
        :class="{ 'bg-accent/15 text-accent-dark !font-bold': isActive(item.to) }"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span class="whitespace-nowrap">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="px-2">
      <span class="font-body text-[0.7rem] text-primary-light opacity-40">v1.0.0</span>
    </div>
  </aside>
</template>
