<script setup lang="ts">
import { CloudRain, RefreshCw, X, Loader2 } from "lucide-vue-next";
import { useRoutesStore } from "~~/store/routes";

const visible = ref(false);
const alertMessage = ref("");
const routesStore = useRoutesStore();
const rebuilding = ref(false);

function showPrompt(message: string) {
  alertMessage.value = message;
  visible.value = true;
}

function dismiss() {
  visible.value = false;
}

async function handleReroute() {
  rebuilding.value = true;
  const currentRoute = routesStore.currentRoute as unknown as { id?: string };
  if (currentRoute?.id) {
    await routesStore.rebuildRoute(currentRoute.id);
  }
  rebuilding.value = false;
  visible.value = false;
}

onMounted(() => {
  if (import.meta.server) return;
  const ws = useWebSocket();
  ws.on("weather_alert", (event) => {
    const data = event.data as Record<string, string>;
    const msg = data.message || "Погодные условия изменились. Рекомендуем пересмотреть маршрут.";
    showPrompt(msg);
  });
});

defineExpose({ showPrompt });
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-scale">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="dismiss"
      >
        <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
          <div class="flex items-start gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <CloudRain class="w-6 h-6 text-amber-600" />
            </div>
            <div class="flex-1">
              <h3 class="font-body font-bold text-lg text-primary mb-1">Погода изменилась</h3>
              <p class="font-body text-sm text-primary-light leading-relaxed">{{ alertMessage }}</p>
            </div>
            <button
              class="w-7 h-7 rounded-full hover:bg-primary/8 flex items-center justify-center shrink-0 cursor-pointer transition-colors bg-transparent border-none -mt-1 -mr-1"
              @click="dismiss"
            >
              <X class="w-4 h-4 text-primary-light" />
            </button>
          </div>
          <div class="flex gap-3">
            <button
              :disabled="rebuilding"
              class="flex-1 flex items-center justify-center gap-2 font-body font-bold text-base text-white bg-accent hover:bg-accent-dark rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 disabled:opacity-50 border-none"
              @click="handleReroute"
            >
              <Loader2 v-if="rebuilding" class="w-4 h-4 animate-spin" />
              <RefreshCw v-else class="w-4 h-4" />
              Перестроить маршрут
            </button>
            <button
              class="flex items-center justify-center font-body font-bold text-base text-primary-light bg-primary/5 hover:bg-primary/10 rounded-2xl px-5 py-3 cursor-pointer transition-colors border-none"
              @click="dismiss"
            >
              Пропустить
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-scale-leave-active {
  transition: all 0.2s ease-in;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
}
.fade-scale-enter-from > div,
.fade-scale-leave-to > div {
  transform: scale(0.9);
}
</style>
