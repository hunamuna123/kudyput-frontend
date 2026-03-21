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
  <div class="flex min-h-screen bg-cream-light text-primary font-body">
    <DashboardSidebar class="hidden md:flex" />
    <div class="flex-1 flex flex-col min-w-0">
      <DashboardHeader class="shrink-0" />
      <main class="flex-1 p-5 pb-25 md:px-10 md:py-8 md:pb-8">
        <slot />
      </main>
    </div>
    <DashboardBottomNav class="block md:hidden" />
  </div>
</template>
