import { useAuthStore } from "~~/store/auth";

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const authStore = useAuthStore();

  try {
    authStore.restoreSession();
  } catch {
    return;
  }

  if (authStore.accessToken) {
    return navigateTo("/start");
  }
});
