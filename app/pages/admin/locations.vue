<script setup lang="ts">
import { useLocationsStore } from "~~/store/locations";
import { MapPin, Tag, Map, Wallet, Users, X, AlertCircle } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

useHead({
  title: "Локации - КудыТуды",
});

const locationsStore = useLocationsStore();
const categoryFilter = ref<string | null>(null);
const densityFilter = ref<string | null>(null);

const categoryOptions = [
  { label: "Винодельня", value: "winery" },
  { label: "Ферма", value: "farm" },
  { label: "Тропа", value: "trail" },
  { label: "Гастро", value: "gastro" },
  { label: "Природа", value: "nature" },
  { label: "Кемпинг", value: "camping" },
  { label: "Курорт", value: "resort" },
  { label: "Экстрим", value: "extreme" },
  { label: "Культура", value: "cultural" },
  { label: "Пляж", value: "beach" },
];

const densityOptions = [
  { label: "Hidden Gem", value: "green" },
  { label: "Сезонная", value: "yellow" },
  { label: "🔥 Популярная", value: "red" },
];

const densityBadgeClass: Record<string, string> = {
  green: "bg-green-500/15 text-green-700 border-green-500/20",
  yellow: "bg-yellow-500/15 text-yellow-700 border-yellow-500/20",
  red: "bg-orange-500/15 text-orange-700 border-orange-500/20",
};

function formatPrice(price: number): string {
  if (!price) return "Бесплатно";
  return `${price.toLocaleString("ru-RU")} ₽`;
}

async function applyFilters() {
  const filters: Record<string, string | number | boolean | undefined> = {};
  if (categoryFilter.value) filters.category = categoryFilter.value;
  if (densityFilter.value) filters.density_level = densityFilter.value;
  await locationsStore.fetchLocations(filters);
}

function clearFilters() {
  categoryFilter.value = null;
  densityFilter.value = null;
  locationsStore.fetchLocations();
}

async function handlePageChange(page: number) {
  const filters: Record<string, string | number | boolean | undefined> = { page };
  if (categoryFilter.value) filters.category = categoryFilter.value;
  if (densityFilter.value) filters.density_level = densityFilter.value;
  await locationsStore.fetchLocations(filters);
}

watch([categoryFilter, densityFilter], applyFilters);

onMounted(() => {
  locationsStore.fetchLocations();
});
</script>

<template>
  <div class="w-full">

    <div class="flex gap-3 mb-6 flex-wrap items-end">
      <div class="flex flex-col gap-1 min-w-[180px] flex-1 max-w-[260px]">
        <label class="font-body text-sm font-bold text-primary-light">Категория</label>
        <UiSelect v-model="categoryFilter">
          <UiSelectTrigger class="rounded-2xl font-body bg-white/25 border border-accent/40">
            <UiSelectValue placeholder="Все категории" />
          </UiSelectTrigger>
          <UiSelectContent class="rounded-2xl">
            <UiSelectItem v-for="opt in categoryOptions" :key="opt.value" :value="opt.value" class="font-body">
              {{ opt.label }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>
      <div class="flex flex-col gap-1 min-w-[180px] flex-1 max-w-[260px]">
        <label class="font-body text-sm font-bold text-primary-light">Плотность</label>
        <UiSelect v-model="densityFilter">
          <UiSelectTrigger class="rounded-2xl font-body bg-white/25 border border-accent/40">
            <UiSelectValue placeholder="Любая" />
          </UiSelectTrigger>
          <UiSelectContent class="rounded-2xl">
            <UiSelectItem v-for="opt in densityOptions" :key="opt.value" :value="opt.value" class="font-body">
              {{ opt.label }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>
      <UiButton
        v-if="categoryFilter || densityFilter"
        variant="ghost"
        class="self-end font-body text-base rounded-xl"
        @click="clearFilters"
      >
        <X class="w-4 h-4 mr-1" />
        Сбросить
      </UiButton>
    </div>


    <div v-if="locationsStore.loading" class="flex justify-center py-15">
      <div class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 w-full">
        <UiSkeleton v-for="i in 4" :key="i" class="h-48 rounded-3xl" />
      </div>
    </div>


    <UiAlert v-else-if="locationsStore.error" variant="destructive" class="rounded-2xl">
      <AlertCircle class="h-4 w-4" />
      <UiAlertDescription>{{ locationsStore.error }}</UiAlertDescription>
    </UiAlert>


    <div v-else-if="locationsStore.locations.length === 0" class="py-15">
      <div class="flex flex-col items-center gap-3">
        <MapPin class="w-10 h-10 text-primary-light opacity-30" />
        <p class="font-body text-md text-primary-light">Локации не найдены</p>
      </div>
    </div>


    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      <NuxtLink
        v-for="loc in locationsStore.locations"
        :key="loc.id"
        :to="`/location/${loc.id}`"
        class="flex flex-col gap-3 p-6 bg-white/35 border border-accent/40 rounded-3xl transition-all duration-200 hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] no-underline"
      >
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-body font-bold text-xl text-primary leading-snug">{{ loc.name }}</h3>
          <UiBadge
            v-if="loc.density_level"
            variant="outline"
            class="rounded-lg text-xs shrink-0"
            :class="densityBadgeClass[loc.density_level] || ''"
          >
            {{ loc.density_level === 'green' ? 'Hidden Gem' : loc.density_level === 'yellow' ? 'Сезонная' : '🔥 Популярная' }}
          </UiBadge>
        </div>

        <p v-if="loc.description_short" class="font-body text-base text-primary-light leading-relaxed line-clamp-2">{{ loc.description_short }}</p>

        <div class="flex flex-wrap gap-2.5">
          <span v-if="loc.category" class="inline-flex items-center gap-1 font-body text-sm text-primary-light">
            <Tag class="w-3 h-3" />{{ loc.category }}
          </span>
          <span v-if="loc.address" class="inline-flex items-center gap-1 font-body text-sm text-primary-light">
            <Map class="w-3 h-3" />{{ loc.address }}
          </span>
          <span class="inline-flex items-center gap-1 font-body text-sm text-primary-light">
            <Wallet class="w-3 h-3" />{{ formatPrice(loc.price_per_night) }}
          </span>
        </div>

        <div v-if="loc.tags?.length" class="flex flex-wrap gap-1.5">
          <UiBadge
            v-for="tag in loc.tags.slice(0, 4)"
            :key="tag"
            variant="secondary"
            class="rounded-lg bg-primary/6 text-primary-light font-body text-xs"
          >
            {{ tag }}
          </UiBadge>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-primary/4">
          <UiBadge
            :variant="loc.is_published ? 'default' : 'secondary'"
            class="rounded-lg text-xs"
            :class="loc.is_published ? 'bg-green-500/15 text-green-700' : 'bg-primary/6 text-primary-light'"
          >
            {{ loc.is_published ? 'Опубликована' : 'Черновик' }}
          </UiBadge>
          <span v-if="loc.capacity" class="inline-flex items-center gap-1 font-body text-sm text-primary-light">
            <Users class="w-3 h-3" />{{ loc.capacity }}
          </span>
        </div>
      </NuxtLink>
    </div>


    <div
      v-if="!locationsStore.loading && locationsStore.total > locationsStore.perPage"
      class="flex items-center justify-center gap-4 mt-6"
    >
      <UiButton
        variant="ghost"
        size="icon"
        class="rounded-full"
        :disabled="locationsStore.page <= 1"
        @click="handlePageChange(locationsStore.page - 1)"
      >
        ‹
      </UiButton>
      <span class="font-body text-base text-primary-light">
        {{ locationsStore.page }} / {{ Math.ceil(locationsStore.total / locationsStore.perPage) }}
      </span>
      <UiButton
        variant="ghost"
        size="icon"
        class="rounded-full"
        :disabled="locationsStore.page >= Math.ceil(locationsStore.total / locationsStore.perPage)"
        @click="handlePageChange(locationsStore.page + 1)"
      >
        ›
      </UiButton>
    </div>
  </div>
</template>
