<script setup lang="ts">
import {
  ArrowLeft, Save, Loader2, AlertCircle, Check, Tag, X,
  Upload, Image, Trash2, Box, Sparkles, RotateCcw,
} from "lucide-vue-next";
import { useLocationsStore } from "~~/store/locations";
import { useOnboardingStore } from "~~/store/onboarding";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth", "host"],
});

useHead({
  title: "Редактирование локации - КудыТуды",
});

const route = useRoute();
const locationsStore = useLocationsStore();
const onboarding = useOnboardingStore();
const locationId = route.params.id as string;

const loading = ref(true);
const saving = ref(false);
const saved = ref(false);
const error = ref<string | null>(null);

const form = reactive({
  name: "",
  category: "nature",
  description_short: "",
  description_full: "",
  address: "",
  price_per_night: 0,
  capacity: 4,
  child_friendly: false,
  tags: [] as string[],
  is_published: false,
  preview_image_url: "" as string,
  gallery_urls: [] as string[],
});

const newTag = ref("");
const isUploadingPreview = ref(false);
const isUploadingGallery = ref(false);
const hasSplat = ref(false);
const splatVideoFile = ref<File | null>(null);
const currentSplatUrl = ref<string | null>(null);

const categories = [
  { value: "winery", label: "🍷 Винодельня" },
  { value: "farm", label: "🐐 Ферма" },
  { value: "trail", label: "🥾 Маршрут" },
  { value: "gastro", label: "🍽 Гастрономия" },
  { value: "nature", label: "🌿 Природа" },
  { value: "camping", label: "🏕 Кемпинг" },
  { value: "resort", label: "🏖 Курорт" },
  { value: "extreme", label: "⚡ Экстрим" },
  { value: "cultural", label: "🏛 Культура" },
  { value: "beach", label: "🌊 Пляж" },
];

function addTag() {
  const tag = newTag.value.trim();
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag);
  }
  newTag.value = "";
}

function removeTag(tag: string) {
  form.tags = form.tags.filter((t) => t !== tag);
}

// ——— Photo upload ———
async function uploadFile(file: File): Promise<string | null> {
  try {
    const { request } = useApiClient();
    const fd = new FormData();
    fd.append("file", file);
    const response = await request<{
      success: boolean;
      data: { url: string; object_name: string };
    }>("/api/v1/media/upload", {
      method: "POST",
      body: fd,
    });
    return response.data?.url || null;
  } catch {
    return null;
  }
}

async function handlePreviewUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  isUploadingPreview.value = true;
  const url = await uploadFile(file);
  if (url) form.preview_image_url = url;
  isUploadingPreview.value = false;
  input.value = "";
}

async function handleGalleryUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files?.length) return;
  isUploadingGallery.value = true;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    const url = await uploadFile(file);
    if (url) form.gallery_urls.push(url);
  }
  isUploadingGallery.value = false;
  input.value = "";
}

function removeGalleryImage(index: number) {
  form.gallery_urls.splice(index, 1);
}

function removePreview() {
  form.preview_image_url = "";
}

// ——— Splatting ———
function handleSplatVideoSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    splatVideoFile.value = input.files[0];
  }
}

async function generateSplat() {
  if (!splatVideoFile.value) return;
  onboarding.resetSplat();
  await onboarding.startSplatting(locationId, splatVideoFile.value);
}

watch(
  () => onboarding.splatStatus,
  (status) => {
    if (status === "completed" && onboarding.splatUrl) {
      currentSplatUrl.value = onboarding.splatUrl;
      hasSplat.value = true;
    }
  },
);

const splatLabel = computed(() => {
  const p = onboarding.splatProgress;
  if (p < 15) return "Подготовка данных…";
  if (p < 30) return "Загрузка изображений…";
  if (p < 45) return "Выравнивание камер…";
  if (p < 60) return "Создание облака точек…";
  if (p < 75) return "Оптимизация сплатов…";
  if (p < 90) return "Рендеринг результата…";
  return "Финализация…";
});

// ——— Save ———
async function save() {
  saving.value = true;
  error.value = null;
  saved.value = false;
  try {
    await locationsStore.updateLocation(locationId, {
      name: form.name,
      category: form.category,
      description_short: form.description_short,
      description_full: form.description_full,
      address: form.address,
      price_per_night: form.price_per_night,
      capacity: form.capacity,
      child_friendly: form.child_friendly,
      tags: form.tags,
      is_published: form.is_published,
      preview_image_url: form.preview_image_url || null,
      gallery_urls: form.gallery_urls,
    });
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 2500);
  } catch {
    error.value = locationsStore.error || "Ошибка сохранения";
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  const loc = await locationsStore.fetchLocationById(locationId);
  if (loc) {
    form.name = loc.name || "";
    form.category = loc.category || "nature";
    form.description_short = loc.description_short || "";
    form.description_full = loc.description_full || "";
    form.address = loc.address || "";
    form.price_per_night = loc.price_per_night || 0;
    form.capacity = loc.capacity || 4;
    form.child_friendly = loc.child_friendly || false;
    form.tags = [...(loc.tags || [])];
    form.is_published = loc.is_published || false;
    form.preview_image_url = loc.preview_image_url || "";
    form.gallery_urls = [...(loc.gallery_urls || [])];
    hasSplat.value = !!loc.splat_url;
    currentSplatUrl.value = loc.splat_url || null;
  } else {
    error.value = "Локация не найдена";
  }
  loading.value = false;
});

onUnmounted(() => {
  onboarding.stopSplatPolling();
});
</script>

<template>
  <div class="w-full max-w-[720px]">

    <div class="flex items-center gap-3 mb-6">
      <NuxtLink
        to="/host/dashboard"
        class="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/6 text-primary-light hover:bg-primary/12 transition-colors no-underline"
      >
        <ArrowLeft class="w-4 h-4" />
      </NuxtLink>
      <h1 class="font-body font-bold text-2xl text-primary">Редактирование</h1>
    </div>


    <div v-if="loading" class="flex justify-center py-16">
      <Loader2 class="w-8 h-8 text-accent animate-spin" />
    </div>


    <div v-else class="flex flex-col gap-4">

      <UiAlert v-if="error" variant="destructive" class="rounded-2xl">
        <AlertCircle class="h-4 w-4" />
        <UiAlertDescription>{{ error }}</UiAlertDescription>
      </UiAlert>

      <UiAlert v-if="saved" class="rounded-2xl bg-green-500/10 border-green-500/20 text-green-700">
        <Check class="h-4 w-4" />
        <UiAlertDescription>Сохранено</UiAlertDescription>
      </UiAlert>

      <!-- ═══ Basic Info ═══ -->
      <div class="bg-white/35 border border-accent/40 rounded-3xl p-6 flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Название</label>
          <UiInput v-model="form.name" placeholder="Название локации" class="rounded-2xl bg-white/25 border-accent/40" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Категория</label>
          <select v-model="form.category" class="w-full rounded-2xl px-4 py-2.5 bg-white/25 border border-accent/40 font-body text-base text-primary focus:ring-2 focus:ring-accent/40 outline-none">
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Краткое описание</label>
          <UiInput v-model="form.description_short" placeholder="Описание для карточки" class="rounded-2xl bg-white/25 border-accent/40" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Полное описание</label>
          <textarea
            v-model="form.description_full"
            rows="4"
            placeholder="Расскажите подробнее о месте"
            class="w-full rounded-2xl px-4 py-3 bg-white/25 border border-accent/40 font-body text-base text-primary resize-none focus:ring-2 focus:ring-accent/40 outline-none"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Адрес</label>
          <UiInput v-model="form.address" placeholder="Краснодарский край, ..." class="rounded-2xl bg-white/25 border-accent/40" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Цена / ночь (₽)</label>
            <UiInput v-model.number="form.price_per_night" type="number" min="0" class="rounded-2xl bg-white/25 border-accent/40" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Вместимость</label>
            <UiInput v-model.number="form.capacity" type="number" min="1" class="rounded-2xl bg-white/25 border-accent/40" />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <input id="child-friendly" v-model="form.child_friendly" type="checkbox" class="w-4 h-4 accent-accent" />
          <label for="child-friendly" class="font-body text-base text-primary cursor-pointer">Подходит для детей</label>
        </div>

        <div class="flex items-center gap-3">
          <input id="is-published" v-model="form.is_published" type="checkbox" class="w-4 h-4 accent-accent" />
          <label for="is-published" class="font-body text-base text-primary cursor-pointer">Опубликована</label>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Теги</label>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in form.tags"
              :key="tag"
              class="inline-flex items-center gap-1 font-body font-bold text-sm text-accent-dark bg-accent/10 px-2.5 py-1 rounded-full"
            >
              <Tag class="w-3 h-3" />
              {{ tag }}
              <button @click="removeTag(tag)" class="ml-0.5 text-accent-dark/50 hover:text-red-500 transition-colors">
                <X class="w-3 h-3" />
              </button>
            </span>
          </div>
          <div class="flex gap-2 items-center">
            <UiInput
              v-model="newTag"
              placeholder="Добавить тег"
              class="rounded-2xl bg-white/25 border-accent/40 flex-1"
              @keydown.enter.prevent="addTag"
            />
            <UiButton size="sm" variant="secondary" class="rounded-xl font-body" @click="addTag">+</UiButton>
          </div>
        </div>
      </div>

      <!-- ═══ Photos ═══ -->
      <div class="bg-white/35 border border-accent/40 rounded-3xl p-6 flex flex-col gap-4">
        <h2 class="font-body font-bold text-lg text-primary flex items-center gap-2">
          <Image class="w-4.5 h-4.5 text-accent-dark" />
          Фотографии
        </h2>

        <!-- Preview image -->
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Обложка</label>
          <div v-if="form.preview_image_url" class="relative rounded-2xl overflow-hidden border border-accent/30">
            <img :src="form.preview_image_url" alt="Обложка" class="w-full h-48 object-cover" />
            <button
              class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors border-0"
              @click="removePreview"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
          <label v-else class="flex items-center gap-3 p-4 border border-dashed border-primary/15 rounded-2xl cursor-pointer hover:border-accent/50 hover:bg-accent/3 transition-all">
            <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Upload v-if="!isUploadingPreview" class="w-4.5 h-4.5 text-accent-dark" />
              <Loader2 v-else class="w-4.5 h-4.5 text-accent-dark animate-spin" />
            </div>
            <span class="font-body text-md text-primary-light">Загрузить обложку</span>
            <input type="file" accept="image/*" class="hidden" @change="handlePreviewUpload" />
          </label>
        </div>

        <!-- Gallery -->
        <div class="flex flex-col gap-1.5">
          <label class="font-body text-sm font-bold text-primary-light uppercase tracking-wider">Галерея</label>
          <div v-if="form.gallery_urls.length" class="grid grid-cols-3 gap-2">
            <div
              v-for="(url, i) in form.gallery_urls"
              :key="i"
              class="relative rounded-xl overflow-hidden border border-accent/20 aspect-square"
            >
              <img :src="url" alt="Фото" class="w-full h-full object-cover" />
              <button
                class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors border-0"
                @click="removeGalleryImage(i)"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>
          <label class="flex items-center gap-3 p-3 border border-dashed border-primary/15 rounded-2xl cursor-pointer hover:border-accent/50 hover:bg-accent/3 transition-all">
            <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Upload v-if="!isUploadingGallery" class="w-3.5 h-3.5 text-accent-dark" />
              <Loader2 v-else class="w-3.5 h-3.5 text-accent-dark animate-spin" />
            </div>
            <span class="font-body text-sm text-primary-light">Добавить фото в галерею</span>
            <input type="file" accept="image/*" multiple class="hidden" @change="handleGalleryUpload" />
          </label>
        </div>
      </div>

      <!-- ═══ 3D Splatting ═══ -->
      <div class="bg-white/35 border border-accent/40 rounded-3xl p-6 flex flex-col gap-4">
        <h2 class="font-body font-bold text-lg text-primary flex items-center gap-2">
          <Box class="w-4.5 h-4.5 text-accent-dark" />
          3D Модель
        </h2>

        <!-- Already has splat -->
        <div v-if="hasSplat && onboarding.splatStatus === 'idle'" class="flex items-center gap-3 p-4 bg-green-500/8 border border-green-500/20 rounded-2xl">
          <Check class="w-5 h-5 text-green-600 shrink-0" />
          <div class="flex-1 min-w-0">
            <span class="font-body font-bold text-base text-primary block">3D-модель готова</span>
            <span class="font-body text-sm text-primary-light">Посетители могут просмотреть локацию в 3D</span>
          </div>
          <UiButton
            size="sm"
            variant="secondary"
            class="rounded-xl font-body shrink-0"
            @click="generateSplat"
          >
            <RotateCcw class="w-3.5 h-3.5 mr-1" />
            Пересоздать
          </UiButton>
        </div>

        <!-- Processing -->
        <div v-else-if="onboarding.splatStatus === 'starting' || onboarding.splatStatus === 'processing'" class="flex flex-col gap-3 p-4 bg-accent/5 border border-accent/20 rounded-2xl">
          <div class="flex items-center gap-3">
            <Loader2 class="w-5 h-5 text-accent animate-spin shrink-0" />
            <div class="flex-1 min-w-0">
              <span class="font-body font-bold text-base text-primary block">{{ splatLabel }}</span>
              <span class="font-body text-sm text-primary-light">{{ onboarding.splatProgress }}%</span>
            </div>
          </div>
          <div class="w-full h-2 bg-primary/8 rounded-full overflow-hidden">
            <div
              class="h-full bg-accent rounded-full transition-all duration-500"
              :style="{ width: `${onboarding.splatProgress}%` }"
            ></div>
          </div>
        </div>

        <!-- Failed -->
        <div v-else-if="onboarding.splatStatus === 'failed'" class="flex flex-col gap-3">
          <UiAlert variant="destructive" class="rounded-2xl">
            <AlertCircle class="h-4 w-4" />
            <UiAlertDescription>{{ onboarding.splatError || 'Ошибка генерации' }}</UiAlertDescription>
          </UiAlert>
          <UiButton
            class="w-full rounded-2xl font-body font-bold bg-accent hover:bg-accent-dark text-white py-3"
            @click="generateSplat"
          >
            <RotateCcw class="w-4 h-4 mr-2" />
            Попробовать снова
          </UiButton>
        </div>

        <!-- Completed just now -->
        <div v-else-if="onboarding.splatStatus === 'completed'" class="flex items-center gap-3 p-4 bg-green-500/8 border border-green-500/20 rounded-2xl">
          <Sparkles class="w-5 h-5 text-green-600 shrink-0" />
          <div class="flex-1 min-w-0">
            <span class="font-body font-bold text-base text-primary block">3D-модель создана!</span>
            <span class="font-body text-sm text-primary-light">Сохраните локацию, чтобы применить.</span>
          </div>
        </div>

        <!-- Generate button (no splat yet) -->
        <div v-else class="flex flex-col gap-3">
          <p class="font-body text-md text-primary-light">
            Загрузите видео обхода локации — ИИ создаст 3D-модель.
          </p>

          <label class="flex items-center gap-3 p-4 border border-dashed border-primary/15 rounded-2xl cursor-pointer hover:border-accent/50 hover:bg-accent/3 transition-all">
            <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Upload class="w-4.5 h-4.5 text-accent-dark" />
            </div>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="font-body text-md text-primary truncate">
                {{ splatVideoFile ? splatVideoFile.name : 'Выберите видео' }}
              </span>
              <span class="font-body text-xs text-primary-light">MP4, WebM · видео обхода</span>
            </div>
            <input type="file" accept="video/mp4,video/webm" class="hidden" @change="handleSplatVideoSelect" />
          </label>

          <UiButton
            class="w-full rounded-2xl font-body font-bold bg-accent hover:bg-accent-dark text-white py-3.5"
            :disabled="!splatVideoFile"
            @click="generateSplat"
          >
            <Box class="w-4 h-4 mr-2" />
            Сгенерировать 3D
          </UiButton>
        </div>
      </div>

      <!-- ═══ Save ═══ -->
      <UiButton
        class="w-full rounded-2xl font-body font-bold bg-accent hover:bg-accent-dark text-white py-3.5"
        :disabled="saving || !form.name.trim()"
        @click="save"
      >
        <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
        <Save v-else class="w-4 h-4 mr-2" />
        Сохранить
      </UiButton>
    </div>
  </div>
</template>
