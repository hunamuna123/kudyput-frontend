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
  <div class="w-full max-w-narrow">
    <div class="bg-white/35 border border-accent/40 rounded-3xl py-10 px-7">
      <h1 class="font-body font-bold text-2xl text-primary mb-1 text-center">Войти</h1>
      <p class="font-body text-base text-primary-light text-center mb-8">Управляйте поездками и локациями</p>

      <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
        <div class="flex flex-col gap-2">
          <label for="login-email" class="font-body text-base font-bold text-primary">Email</label>
          <UiInput
            id="login-email"
            v-model="email"
            type="email"
            placeholder="tourist@deepkrai.ru"
            class="rounded-2xl px-4 py-3.5 font-body text-lg bg-white/60 border border-primary/12 placeholder:text-primary/30 focus-visible:ring-accent focus-visible:border-accent"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="login-password" class="font-body text-base font-bold text-primary">Пароль</label>
          <div class="relative">
            <UiInput
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Введите пароль"
              class="rounded-2xl px-4 py-3.5 pr-12 font-body text-lg bg-white/60 border border-primary/12 placeholder:text-primary/30 focus-visible:ring-accent focus-visible:border-accent w-full"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-light hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-1"
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
          class="w-full mt-1 bg-accent hover:bg-accent-dark border-accent hover:border-accent-dark text-white font-body font-bold rounded-2xl py-4 text-lg transition-all duration-200"
        >
          <span v-if="authStore.loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          Войти
        </UiButton>
      </form>

      <p class="font-body text-base text-primary-light text-center mt-6">
        Нет аккаунта?
        <NuxtLink to="/auth/register" class="text-accent-dark no-underline font-bold hover:text-accent">Зарегистрироваться</NuxtLink>
      </p>
    </div>
  </div>
</template>
