<script setup lang="ts">
import { useAuthStore } from "~~/store/auth";
import { Eye, EyeOff, AlertCircle } from "lucide-vue-next";

definePageMeta({
  layout: "auth",
  middleware: ["guest"],
});

useHead({
  title: "Регистрация - КудыТуды",
});

const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const displayName = ref("");
const role = ref("tourist");
const showPassword = ref(false);

const roleOptions = [
  { label: "Турист", value: "tourist" },
  { label: "Бизнесмен", value: "host" },
];

async function handleRegister() {
  const success = await authStore.register(
    email.value,
    password.value,
    displayName.value || undefined,
    role.value,
  );
  if (success) {
    navigateTo(role.value === "host" ? "/host" : "/start");
  }
}
</script>

<template>
  <div class="w-full max-w-[400px]">
    <div class="bg-white/35 border border-accent/40 rounded-3xl py-8 px-6">
      <h1 class="font-heading text-primary mb-1 text-center" style="font-size: clamp(0.85rem, 4.5vw, 1.1rem);">Регистрация</h1>
      <p class="font-body text-[0.82rem] text-primary-light text-center mb-6">Создайте аккаунт для доступа</p>

      <form class="flex flex-col gap-4" @submit.prevent="handleRegister">
        <div class="flex flex-col gap-1.5">
          <label for="reg-name" class="font-body text-[0.75rem] font-bold text-primary">Имя</label>
          <UiInput
            id="reg-name"
            v-model="displayName"
            placeholder="Иван"
            class="rounded-2xl px-3.5 py-3 font-body bg-white/25 border border-accent/40 placeholder:text-primary/40 focus-visible:ring-accent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="reg-email" class="font-body text-[0.75rem] font-bold text-primary">Email</label>
          <UiInput
            id="reg-email"
            v-model="email"
            type="email"
            placeholder="tourist@deepkrai.ru"
            class="rounded-2xl px-3.5 py-3 font-body bg-white/25 border border-accent/40 placeholder:text-primary/40 focus-visible:ring-accent"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="reg-password" class="font-body text-[0.75rem] font-bold text-primary">Пароль</label>
          <div class="relative">
            <UiInput
              id="reg-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Минимум 8 символов"
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

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-[0.75rem] font-bold text-primary">Роль</label>
          <UiToggleGroup type="single" :model-value="role" @update:model-value="(v: unknown) => { if (v) role = String(v) }" class="justify-start">
            <UiToggleGroupItem
              v-for="opt in roleOptions"
              :key="opt.value"
              :value="opt.value"
              class="rounded-2xl px-4 py-2 font-body text-[0.78rem] data-[state=on]:bg-accent data-[state=on]:text-primary-dark data-[state=on]:border-accent border border-primary/15 transition-all duration-200"
            >
              {{ opt.label }}
            </UiToggleGroupItem>
          </UiToggleGroup>
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
          Создать аккаунт
        </UiButton>
      </form>

      <p class="font-body text-[0.75rem] text-primary-light text-center mt-5">
        Уже есть аккаунт?
        <NuxtLink to="/auth/login" class="text-accent-dark no-underline font-bold hover:text-accent">Войти</NuxtLink>
      </p>
    </div>
  </div>
</template>
