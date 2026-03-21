<script setup lang="ts">
import { Home, MapPin, Globe, Car, User, Navigation } from "lucide-vue-next";

const { isActive } = useNavActive();

interface NavItem {
  label: string;
  icon: typeof Home;
  to: string;
}

const navItems: NavItem[] = [
  { label: "Обзор", icon: Home, to: "/admin" },
  { label: "Локации", icon: MapPin, to: "/admin/locations" },
  { label: "Карта", icon: Globe, to: "/map" },
  { label: "Поездки", icon: Car, to: "/profile/trips" },
  { label: "Профиль", icon: User, to: "/profile" },
];
</script>

<template>
  <aside class="w-52 min-h-screen bg-white border border-accent/40 border-r flex flex-col py-4 px-3 shrink-0">
    <div class="flex items-center gap-2 mb-6 px-1.5">
      <NuxtLink to="/" class="font-body font-bold text-[1rem] text-primary no-underline transition-colors duration-200 hover:text-accent">
        КудыТуды
      </NuxtLink>
      <span class="font-body text-[0.55rem] font-bold uppercase tracking-widest text-accent-dark bg-accent/15 px-1.5 py-0.5 rounded-md">Panel</span>
    </div>

    <nav class="flex flex-col gap-0.5 flex-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 px-3 py-2 rounded-xl no-underline text-primary-light font-body text-[0.82rem] font-light transition-all duration-200 hover:bg-primary/6 hover:text-primary"
        :class="{ 'bg-accent/15 text-accent-dark !font-bold': isActive(item.to) }"
      >
        <component :is="item.icon" class="w-[18px] h-[18px]" />
        <span class="whitespace-nowrap">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="px-1.5">
      <span class="font-body text-[0.65rem] text-primary-light opacity-40">v1.0.0</span>
    </div>
  </aside>
</template>
