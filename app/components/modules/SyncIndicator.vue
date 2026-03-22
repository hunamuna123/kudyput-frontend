<script setup lang="ts">
import { Wifi, WifiOff, CloudOff, Loader2, Check, RefreshCw } from "lucide-vue-next";
import { useOfflineQueueStore } from "~~/store/offlineQueue";

const queueStore = useOfflineQueueStore();
const { isOnline, initListeners } = useOffline();

const showDetails = ref(false);

onMounted(() => {
  initListeners();
  queueStore.load();
});

// Auto-sync when coming back online
watch(isOnline, (online) => {
  if (online && queueStore.hasPending) {
    queueStore.syncAll();
  }
});

function formatTime(ts: number | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="!isOnline || queueStore.hasPending"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%]"
    >
      <div
        class="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-md border transition-all duration-300"
        :class="isOnline
          ? 'bg-white/90 border-accent/30'
          : 'bg-amber-50/95 border-amber-300/60'"
        @click="showDetails = !showDetails"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          :class="isOnline ? 'bg-accent/15' : 'bg-amber-500/15'"
        >
          <WifiOff v-if="!isOnline" class="w-4 h-4 text-amber-600" />
          <Loader2 v-else-if="queueStore.syncing" class="w-4 h-4 text-accent animate-spin" />
          <CloudOff v-else class="w-4 h-4 text-accent-dark" />
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-body font-bold text-sm text-primary truncate">
            {{ !isOnline ? 'Офлайн-режим' : queueStore.syncing ? 'Синхронизация…' : `${queueStore.pendingCount} в очереди` }}
          </p>
          <p class="font-body text-xs text-primary-light truncate">
            {{ !isOnline
              ? 'Действия сохраняются локально'
              : queueStore.syncing
                ? 'Отправка данных на сервер'
                : `Последняя синхр.: ${formatTime(queueStore.lastSyncAt)}`
            }}
          </p>
        </div>

        <button
          v-if="isOnline && queueStore.hasPending && !queueStore.syncing"
          class="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 cursor-pointer border-none hover:bg-accent/25 transition-colors"
          @click.stop="queueStore.syncAll()"
        >
          <RefreshCw class="w-4 h-4 text-accent-dark" />
        </button>
      </div>

      <Transition name="slide">
        <div v-if="showDetails && queueStore.hasPending" class="mt-2 bg-white/95 backdrop-blur-md border border-primary/10 rounded-2xl p-4 shadow-lg">
          <p class="font-body text-xs font-bold text-primary-light uppercase tracking-wider mb-2">
            Очередь действий
          </p>
          <div class="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            <div
              v-for="item in queueStore.queue.slice(0, 10)"
              :key="item.id"
              class="flex items-center gap-2 px-2 py-1.5 bg-primary/3 rounded-lg"
            >
              <span class="font-body text-xs text-primary-light capitalize">{{ item.type }}</span>
              <span class="font-body text-2xs text-primary-light opacity-60 ml-auto">{{ formatTime(item.createdAt) }}</span>
            </div>
          </div>
          <div v-if="queueStore.syncError" class="mt-2 p-2 bg-red-500/8 rounded-lg">
            <p class="font-body text-xs text-red-600">{{ queueStore.syncError }}</p>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
