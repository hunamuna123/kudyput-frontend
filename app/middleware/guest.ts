import { useAuthStore } from "~~/store/auth";

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  authStore.restoreSession();

  if (authStore.isAuthenticated) {
    return navigateTo("/dashboard");
  }
});
