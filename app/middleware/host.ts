import { useAuthStore } from "~~/store/auth";

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const authStore = useAuthStore();

  if (authStore.user?.role !== "host" && authStore.user?.role !== "b2g_admin") {
    return navigateTo("/start");
  }
});
