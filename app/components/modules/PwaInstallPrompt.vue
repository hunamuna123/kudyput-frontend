<script setup lang="ts">
import { Download, X, Smartphone } from "lucide-vue-next";

const showPrompt = ref(false);
const deferredPrompt = ref<any>(null);
const isInstalled = ref(false);

onMounted(() => {
  if (import.meta.server) return;

  // Check if already installed
  if (window.matchMedia("(display-mode: standalone)").matches) {
    isInstalled.value = true;
    return;
  }

  // Dismiss flag
  const dismissed = localStorage.getItem("pwa_install_dismissed");
  if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
    return; // dismissed within 7 days
  }

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredPrompt.value = e;
    // Show after 10 seconds of browsing
    setTimeout(() => {
      showPrompt.value = true;
    }, 10_000);
  });
});

async function install() {
  if (!deferredPrompt.value) return;
  deferredPrompt.value.prompt();
  const result = await deferredPrompt.value.userChoice;
  if (result.outcome === "accepted") {
    isInstalled.value = true;
  }
  showPrompt.value = false;
  deferredPrompt.value = null;
}

function dismiss() {
  showPrompt.value = false;
  localStorage.setItem("pwa_install_dismissed", String(Date.now()));
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="showPrompt && !isInstalled"
        class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-[92%]"
      >
        <div class="bg-white/95 backdrop-blur-xl border border-accent/25 rounded-3xl p-5 shadow-2xl">
          <button
            class="absolute top-3 right-3 w-7 h-7 rounded-full hover:bg-primary/8 flex items-center justify-center cursor-pointer transition-colors bg-transparent border-none"
            @click="dismiss"
          >
            <X class="w-4 h-4 text-primary-light" />
          </button>

          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <Smartphone class="w-7 h-7 text-accent-dark" />
            </div>
            <div class="flex-1 min-w-0 pt-0.5">
              <p class="font-body font-bold text-base text-primary mb-1">
                Установите КудыТуды
              </p>
              <p class="font-body text-sm text-primary-light leading-relaxed">
                Работайте с картой и маршрутами без интернета. Приложение на домашнем экране.
              </p>
            </div>
          </div>

          <div class="flex gap-3 mt-4">
            <button
              class="flex-1 flex items-center justify-center gap-2 font-body font-bold text-base text-white bg-accent hover:bg-accent-dark rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 border-none shadow-md"
              @click="install"
            >
              <Download class="w-4 h-4" />
              Установить
            </button>
            <button
              class="flex items-center justify-center font-body font-bold text-sm text-primary-light bg-primary/5 hover:bg-primary/10 rounded-2xl px-5 py-3 cursor-pointer transition-colors border-none"
              @click="dismiss"
            >
              Потом
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slide-up-enter-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-leave-active {
  transition: all 0.3s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translate(-50%, 30px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
