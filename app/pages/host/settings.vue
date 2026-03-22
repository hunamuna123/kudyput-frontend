<script setup lang="ts">
import { Settings, Bell, ToggleRight, ArrowLeft, Check } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "host"],
});

useHead({
  title: "Настройки хоста - КудыТуды",
});

const autoConfirm = ref(false);
const notifyEmail = ref(true);
const notifyPush = ref(true);
const saved = ref(false);

function loadSettings() {
  if (import.meta.server) return;
  try {
    const raw = localStorage.getItem("dk_host_settings");
    if (raw) {
      const s = JSON.parse(raw);
      autoConfirm.value = s.autoConfirm ?? false;
      notifyEmail.value = s.notifyEmail ?? true;
      notifyPush.value = s.notifyPush ?? true;
    }
  } catch { /* ignore */ }
}

function saveSettings() {
  if (import.meta.server) return;
  localStorage.setItem("dk_host_settings", JSON.stringify({
    autoConfirm: autoConfirm.value,
    notifyEmail: notifyEmail.value,
    notifyPush: notifyPush.value,
  }));
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 2500);
}

onMounted(loadSettings);
</script>

<template>
  <div class="w-full max-w-[600px]">

    <div class="flex items-center gap-3 mb-6">
      <NuxtLink
        to="/host/dashboard"
        class="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/6 text-primary-light hover:bg-primary/12 transition-colors no-underline"
      >
        <ArrowLeft class="w-4 h-4" />
      </NuxtLink>
      <h1 class="font-body font-bold text-2xl text-primary">Настройки</h1>
    </div>

    <UiAlert v-if="saved" class="rounded-2xl bg-green-500/10 border-green-500/20 text-green-700 mb-4">
      <Check class="h-4 w-4" />
      <UiAlertDescription>Настройки сохранены</UiAlertDescription>
    </UiAlert>


    <div class="bg-white/35 border border-accent/40 rounded-3xl p-6 mb-4">
      <div class="flex items-center gap-2.5 mb-5">
        <Settings class="w-4.5 h-4.5 text-accent-dark" />
        <span class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Бронирования</span>
      </div>

      <div class="flex items-center justify-between py-3 border-b border-primary/5">
        <div class="flex flex-col gap-0.5">
          <span class="font-body font-bold text-base text-primary">Автоподтверждение</span>
          <span class="font-body text-sm text-primary-light">Автоматически подтверждать новые бронирования</span>
        </div>
        <button
          @click="autoConfirm = !autoConfirm"
          class="w-12 h-7 rounded-full flex items-center px-0.5 transition-colors duration-300 cursor-pointer"
          :class="autoConfirm ? 'bg-accent' : 'bg-primary/15'"
        >
          <div
            class="w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
            :class="autoConfirm ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>


    <div class="bg-white/35 border border-accent/40 rounded-3xl p-6 mb-6">
      <div class="flex items-center gap-2.5 mb-5">
        <Bell class="w-4.5 h-4.5 text-accent-dark" />
        <span class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Уведомления</span>
      </div>

      <div class="flex items-center justify-between py-3 border-b border-primary/5">
        <div class="flex flex-col gap-0.5">
          <span class="font-body font-bold text-base text-primary">Email-уведомления</span>
          <span class="font-body text-sm text-primary-light">Получать уведомления на почту</span>
        </div>
        <button
          @click="notifyEmail = !notifyEmail"
          class="w-12 h-7 rounded-full flex items-center px-0.5 transition-colors duration-300 cursor-pointer"
          :class="notifyEmail ? 'bg-accent' : 'bg-primary/15'"
        >
          <div
            class="w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
            :class="notifyEmail ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <div class="flex items-center justify-between py-3">
        <div class="flex flex-col gap-0.5">
          <span class="font-body font-bold text-base text-primary">Push-уведомления</span>
          <span class="font-body text-sm text-primary-light">Push-уведомления в браузере</span>
        </div>
        <button
          @click="notifyPush = !notifyPush"
          class="w-12 h-7 rounded-full flex items-center px-0.5 transition-colors duration-300 cursor-pointer"
          :class="notifyPush ? 'bg-accent' : 'bg-primary/15'"
        >
          <div
            class="w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
            :class="notifyPush ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <UiButton
      class="w-full rounded-2xl font-body font-bold bg-accent hover:bg-accent-dark text-white py-3.5"
      @click="saveSettings"
    >
      Сохранить настройки
    </UiButton>
  </div>
</template>
