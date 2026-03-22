import { defineStore } from "pinia";

interface QueuedAction {
  id: string;
  type: "review" | "swipe" | "telemetry" | "booking";
  endpoint: string;
  method: "POST" | "PUT" | "DELETE";
  body: Record<string, unknown>;
  createdAt: number;
}

interface OfflineQueueState {
  queue: QueuedAction[];
  syncing: boolean;
  lastSyncAt: number | null;
  syncError: string | null;
}

const STORAGE_KEY = "dk_offline_queue";

function loadQueue(): QueuedAction[] {
  if (import.meta.server) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistQueue(queue: QueuedAction[]) {
  if (import.meta.server) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export const useOfflineQueueStore = defineStore("offlineQueue", {
  state: (): OfflineQueueState => ({
    queue: [],
    syncing: false,
    lastSyncAt: null,
    syncError: null,
  }),

  getters: {
    pendingCount: (state): number => state.queue.length,
    hasPending: (state): boolean => state.queue.length > 0,
  },

  actions: {
    load() {
      this.queue = loadQueue();
    },

    enqueue(action: Omit<QueuedAction, "id" | "createdAt">) {
      const entry: QueuedAction = {
        ...action,
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: Date.now(),
      };
      this.queue.push(entry);
      persistQueue(this.queue);
    },

    async syncAll() {
      if (this.syncing || this.queue.length === 0) return;
      this.syncing = true;
      this.syncError = null;

      const { request } = useApiClient();
      const succeeded: string[] = [];

      for (const action of this.queue) {
        try {
          await request(`${action.endpoint}`, {
            method: action.method,
            body: action.body,
          });
          succeeded.push(action.id);
        } catch {
          // Stop at first failure — keep remaining in queue
          break;
        }
      }

      this.queue = this.queue.filter((a) => !succeeded.includes(a.id));
      persistQueue(this.queue);

      if (succeeded.length > 0) {
        this.lastSyncAt = Date.now();
      }

      if (this.queue.length > 0 && succeeded.length === 0) {
        this.syncError = "Не удалось синхронизировать данные";
      }

      this.syncing = false;
    },

    clearQueue() {
      this.queue = [];
      persistQueue(this.queue);
    },
  },
});
