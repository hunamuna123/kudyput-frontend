<script setup lang="ts">
import { Server, Code, CheckCircle, Heart, RefreshCw, AlertCircle } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Обзор - КудыТуды",
});

interface ServiceHealth {
  status: "up" | "down";
  latency_ms: number;
  error?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded";
  timestamp: string;
  services: Record<string, ServiceHealth>;
}

interface ServerInfo {
  service: string;
  version: string;
  status: string;
}

const healthData = ref<HealthResponse | null>(null);
const serverInfo = ref<ServerInfo | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const serviceNames: Record<string, string> = {
  postgres: "PostgreSQL",
  redis: "Redis",
  qdrant: "Qdrant",
  neo4j: "Neo4j",
  clickhouse: "ClickHouse",
  minio: "MinIO",
};

const healthyCount = computed(() => {
  if (!healthData.value?.services) return 0;
  return Object.values(healthData.value.services).filter((s) => s.status === "up").length;
});

const totalServices = computed(() => {
  if (!healthData.value?.services) return 0;
  return Object.keys(healthData.value.services).length;
});

async function fetchData() {
  loading.value = true;
  error.value = null;
  try {
    const { request } = useApiClient();
    const [health, info] = await Promise.all([
      request<HealthResponse>("/api/v1/health", { skipAuth: true }),
      request<ServerInfo>("/", { skipAuth: true }),
    ]);
    healthData.value = health;
    serverInfo.value = info;
  } catch (err: unknown) {
    const apiErr = err as { message?: string };
    error.value = apiErr.message || "Ошибка загрузки данных";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>

<template>
  <div class="w-full">

    <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 mb-6">
      <div class="flex items-center gap-3 p-4 bg-white/35 border border-accent/40 rounded-3xl">
        <div class="w-10 h-10 flex items-center justify-center rounded-[12px] shrink-0 bg-accent/15 text-accent-dark">
          <Server class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="font-body font-bold text-lg text-primary whitespace-nowrap overflow-hidden text-ellipsis">{{ serverInfo?.status === "running" ? "Активен" : "—" }}</span>
          <span class="font-body text-xs text-primary-light">Сервер</span>
        </div>
      </div>

      <div class="flex items-center gap-3 p-4 bg-white/35 border border-accent/40 rounded-3xl">
        <div class="w-10 h-10 flex items-center justify-center rounded-[12px] shrink-0 bg-primary/8 text-primary">
          <Code class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="font-body font-bold text-lg text-primary whitespace-nowrap overflow-hidden text-ellipsis">{{ serverInfo?.version || "—" }}</span>
          <span class="font-body text-xs text-primary-light">Версия API</span>
        </div>
      </div>

      <div class="flex items-center gap-3.5 p-5 bg-white/35 border border-accent/40 rounded-3xl">
        <div class="w-11 h-11 flex items-center justify-center rounded-[14px] shrink-0 bg-accent/15 text-accent-dark">
          <CheckCircle class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="font-body font-bold text-lg text-primary whitespace-nowrap overflow-hidden text-ellipsis">{{ healthyCount }}/{{ totalServices }}</span>
          <span class="font-body text-xs text-primary-light">Сервисы</span>
        </div>
      </div>

      <div class="flex items-center gap-3.5 p-5 bg-white/35 border border-accent/40 rounded-3xl">
        <div
          class="w-10 h-10 flex items-center justify-center rounded-[12px] shrink-0"
          :class="healthData?.status === 'healthy' ? 'bg-accent/15 text-accent-dark' : 'bg-yellow-500/12 text-yellow-700'"
        >
          <Heart class="w-5 h-5" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="font-body font-bold text-lg text-primary whitespace-nowrap overflow-hidden text-ellipsis">{{ healthData?.status === "healthy" ? "Норма" : healthData?.status || "—" }}</span>
          <span class="font-body text-xs text-primary-light">Статус</span>
        </div>
      </div>
    </div>


    <div v-if="loading" class="flex justify-center py-15">
      <div class="flex flex-col items-center gap-3">
        <UiSkeleton class="h-8 w-40 rounded-xl" />
        <div class="grid grid-cols-3 gap-3 w-full max-w-md">
          <UiSkeleton class="h-24 rounded-3xl" />
          <UiSkeleton class="h-24 rounded-3xl" />
          <UiSkeleton class="h-24 rounded-3xl" />
        </div>
      </div>
    </div>


    <div v-else-if="error" class="flex flex-col gap-3 max-w-[400px]">
      <UiAlert variant="destructive" class="rounded-2xl">
        <AlertCircle class="h-4 w-4" />
        <UiAlertDescription>{{ error }}</UiAlertDescription>
      </UiAlert>
      <UiButton variant="secondary" class="self-start rounded-2xl font-body" @click="fetchData">
        <RefreshCw class="w-4 h-4 mr-2" />
        Повторить
      </UiButton>
    </div>


    <div v-else>
      <h2 class="font-body font-bold text-xl text-primary mb-3">Сервисы</h2>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
        <div
          v-for="(service, key) in healthData?.services"
          :key="key"
          class="flex flex-col gap-1.5 p-4 bg-white/35 border border-accent/40 border rounded-3xl transition-colors duration-200 hover:border-accent/30"
          :class="service.status !== 'up' ? 'border-red-500/20' : 'border-white/50'"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="font-body font-bold text-base text-primary">{{ serviceNames[key as string] || key }}</span>
            <UiBadge
              :variant="service.status === 'up' ? 'default' : 'destructive'"
              class="rounded-lg text-xs"
              :class="service.status === 'up' ? 'bg-green-500/15 text-green-700 border-green-500/20' : ''"
            >
              {{ service.status === 'up' ? 'Online' : 'Down' }}
            </UiBadge>
          </div>
          <span v-if="service.status === 'up'" class="font-body text-sm text-primary-light">{{ service.latency_ms }}ms</span>
          <span v-if="service.error" class="font-body text-sm text-red-600 break-all">{{ service.error }}</span>
        </div>
      </div>
    </div>

    <p v-if="healthData" class="mt-5 font-body text-xs text-primary-light opacity-50">
      Обновлено: {{ new Date(healthData.timestamp).toLocaleString("ru-RU") }}
    </p>
  </div>
</template>
