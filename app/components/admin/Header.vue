<script setup lang="ts">
import { useAuthStore } from "~~/store/auth";
import { LogOut } from "lucide-vue-next";

const authStore = useAuthStore();
const route = useRoute();

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    "/admin": "Обзор",
    "/admin/locations": "Локации",
    "/profile": "Профиль",
    "/profile/trips": "Поездки",
  };
  return titles[route.path] || "Панель";
});
</script>

<template>
  <header class="flex items-center justify-between px-4 py-3 md:px-6 md:py-3 border-b bg-white/80 border border-accent/40 backdrop-blur-lg">
    <div class="flex items-center gap-2.5">
      <h1 class="font-body font-bold text-xl text-primary m-0">{{ pageTitle }}</h1>
    </div>
    <div class="flex items-center gap-3">
      <span class="hidden md:block font-body text-base font-light text-primary-light">
        {{ authStore.userName }}
      </span>
      <button
        class="w-8 h-8 flex items-center justify-center rounded-[10px] border border-primary/8 bg-transparent text-primary-light cursor-pointer transition-all duration-200 text-base hover:bg-red-500/8 hover:border-red-500/15 hover:text-red-500"
        @click="authStore.logout()"
      >
        <LogOut class="w-3.5 h-3.5" />
      </button>
    </div>
  </header>
</template>
