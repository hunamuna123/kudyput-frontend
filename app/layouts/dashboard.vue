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
  <div class="flex min-h-screen bg-gradient-to-br from-white to-accent/3 text-primary font-body">
    <AdminSidebar class="hidden md:flex" />
    <div class="flex-1 flex flex-col min-w-0">
      <AdminHeader class="shrink-0" />
      <main class="flex-1 px-5 py-6 pb-20 md:px-10 md:py-8 md:pb-8">
        <slot />
      </main>
    </div>
    <AdminBottomNav class="block md:hidden" />
  </div>
</template>
