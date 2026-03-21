<script setup lang="ts">
import { useAuthStore } from "~~/store/auth";
import { LogOut } from "lucide-vue-next";

const authStore = useAuthStore();
const route = useRoute();

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    "/dashboard": "Обзор",
    "/dashboard/locations": "Локации",
    "/dashboard/map": "Карта",
    "/dashboard/route": "Маршрут",
    "/dashboard/trips": "Поездки",
    "/dashboard/profile": "Профиль",
  };
  return titles[route.path] || "Панель";
});
</script>

<template>
  <header class="flex items-center justify-between px-5 py-4 md:px-8 md:py-5 border-b border-primary/6 bg-cream-light/80 backdrop-blur-lg">
    <div class="flex items-center gap-3">
      <h1 class="font-body font-bold text-[1.1rem] text-primary m-0">{{ pageTitle }}</h1>
    </div>
    <div class="flex items-center gap-4">
      <span class="hidden md:block font-body text-[0.82rem] font-light text-primary-light">
        {{ authStore.userName }}
      </span>
      <button
        class="w-9 h-9 flex items-center justify-center rounded-[10px] border border-primary/8 bg-transparent text-primary-light cursor-pointer transition-all duration-200 text-[0.9rem] hover:bg-red-500/8 hover:border-red-500/15 hover:text-red-500"
        @click="authStore.logout()"
      >
        <LogOut class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>
