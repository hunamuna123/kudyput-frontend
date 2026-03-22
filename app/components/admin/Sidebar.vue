<script setup lang="ts">
import { Home, MapPin, Globe, Car, User, Navigation, Flame, FileText, Heart, LayoutDashboard, Settings, Route, CalendarCheck, TrendingUp } from "lucide-vue-next";
import { useAuthStore } from "~~/store/auth";

const { isActive } = useNavActive();
const authStore = useAuthStore();

interface NavItem {
  label: string;
  icon: typeof Home;
  to: string;
}

const isHost = computed(() => authStore.user?.role === "host" || authStore.user?.role === "b2g_admin");

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { label: "Обзор", icon: Home, to: "/admin" },
    { label: "Локации", icon: MapPin, to: "/admin/locations" },
    { label: "Карта", icon: Globe, to: "/map" },
    { label: "Маршрут", icon: Route, to: "/route" },
    { label: "Тепл. карта", icon: Flame, to: "/admin/heatmap" },
    { label: "Прогнозы", icon: TrendingUp, to: "/admin/predictions" },
    { label: "Отчёты", icon: FileText, to: "/admin/reports" },
    { label: "Поездки", icon: Car, to: "/profile/trips" },
    { label: "Избранное", icon: Heart, to: "/profile/favorites" },
    { label: "Профиль", icon: User, to: "/profile" },
  ];
  if (isHost.value) {
    items.splice(1, 0, { label: "Мои локации", icon: LayoutDashboard, to: "/host/dashboard" });
    items.splice(2, 0, { label: "Бронирования", icon: CalendarCheck, to: "/host/bookings" });
    items.push({ label: "Настройки", icon: Settings, to: "/host/settings" });
  }
  return items;
});
</script>

<template>
  <aside class="w-52 min-h-screen bg-white border border-accent/40 border-r flex flex-col py-4 px-3 shrink-0">
    <div class="flex items-center gap-2 mb-6 px-1.5">
      <NuxtLink to="/" class="font-body font-bold text-xl text-primary no-underline transition-colors duration-200 hover:text-accent">
        КудыТуды
      </NuxtLink>
      <span class="font-body text-2xs font-bold uppercase tracking-widest text-accent-dark bg-accent/15 px-1.5 py-0.5 rounded-md">Panel</span>
    </div>

    <nav class="flex flex-col gap-0.5 flex-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 px-3 py-2 rounded-xl no-underline text-primary-light font-body text-base font-light transition-all duration-200 hover:bg-primary/6 hover:text-primary"
        :class="{ 'bg-accent/15 text-accent-dark !font-bold': isActive(item.to) }"
      >
        <component :is="item.icon" class="w-[18px] h-[18px]" />
        <span class="whitespace-nowrap">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="px-1.5">
      <span class="font-body text-xs text-primary-light opacity-40">v1.0.0</span>
    </div>
  </aside>
</template>
