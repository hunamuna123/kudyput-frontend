<script setup lang="ts">
import { useAuthStore } from "~~/store/auth";
import { LogIn, Eye, EyeOff, AlertCircle } from "lucide-vue-next";

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
});

useHead({
  title: "Вход - КудыТуды",
});

const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const showPassword = ref(false);

const route = useRoute();

async function handleLogin() {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    const redirect = route.query.redirect as string;
    if (redirect) {
      navigateTo(redirect);
    } else {
      navigateTo("/start");
    }
  }
}
</script>

<template>
  <div class="w-full max-w-[400px]">
    <div class="bg-white/35 border border-accent/40 rounded-3xl py-8 px-6">
      <h1 class="font-heading text-[1.4rem] text-primary mb-1 text-center">Войти</h1>
      <p class="font-body text-[0.82rem] text-primary-light text-center mb-6">Управляйте поездками и локациями</p>

      <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
        <div class="flex flex-col gap-1.5">
          <label for="login-email" class="font-body text-[0.75rem] font-bold text-primary">Email</label>
          <UiInput
            id="login-email"
            v-model="email"
            type="email"
            placeholder="tourist@deepkrai.ru"
            class="rounded-2xl px-3.5 py-3 font-body bg-white/25 border border-accent/40 placeholder:text-primary/40 focus-visible:ring-accent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="login-password" class="font-body text-[0.75rem] font-bold text-primary">Пароль</label>
          <div class="relative">
            <UiInput
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введите пароль"
              class="rounded-2xl px-3.5 py-3 pr-12 font-body bg-white/25 border border-accent/40 placeholder:text-primary/40 focus-visible:ring-accent w-full"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-light hover:text-primary transition-colors"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="!showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <UiAlert v-if="authStore.error" variant="destructive" class="rounded-2xl">
          <AlertCircle class="h-4 w-4" />
          <UiAlertDescription>{{ authStore.error }}</UiAlertDescription>
        </UiAlert>

        <UiButton
          type="submit"
          :disabled="!email || !password || authStore.loading"
          class="w-full mt-0.5 bg-accent hover:bg-accent-dark border-accent hover:border-accent-dark text-primary-dark font-body font-bold rounded-2xl py-3 text-[0.85rem] transition-all duration-200"
        >
          <span v-if="authStore.loading" class="inline-block w-4 h-4 border-2 border-primary-dark/30 border-t-primary-dark rounded-full animate-spin mr-2"></span>
          Войти
        </UiButton>
      </form>

      <p class="font-body text-[0.75rem] text-primary-light text-center mt-5">
        Нет аккаунта?
        <NuxtLink to="/auth/register" class="text-accent-dark no-underline font-bold hover:text-accent">Зарегистрироваться</NuxtLink>
      </p>
    </div>
  </div>
</template>
