import { useAuthStore } from "~~/store/auth";

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();
  authStore.restoreSession();

  // Only check for token presence — profile is loaded async in the layout
  if (!authStore.accessToken) {
    return navigateTo("/auth/login");
  }
});
