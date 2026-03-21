<script setup lang="ts">
import { useAuthStore } from "~~/store/auth";

const authStore = useAuthStore();

onMounted(() => {
  authStore.restoreSession();
  if (authStore.accessToken && !authStore.user) {
    authStore.fetchProfile();
  }
});
</script>

<template>
  <div class="flex min-h-screen bg-white border border-accent/40 text-primary font-body">
    <DashboardSidebar class="hidden md:flex" />
    <div class="flex-1 flex flex-col min-w-0">
      <DashboardHeader class="shrink-0" />
      <main class="flex-1 p-4 pb-20 md:px-8 md:py-6 md:pb-6">
        <slot />
      </main>
    </div>
    <DashboardBottomNav class="block md:hidden" />
  </div>
</template>
