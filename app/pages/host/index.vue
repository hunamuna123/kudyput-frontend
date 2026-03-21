<script setup lang="ts">
import { Mic, Upload, Loader2, Check, ArrowRight, ArrowLeft, AlertCircle, Camera, Plus } from "lucide-vue-next";
import { useLocationsStore } from "~~/store/locations";
import { useAuthStore } from "~~/store/auth";

useHead({
  title: "Бизнесмен — Онбординг — КудыТуды",
});

const authStore = useAuthStore();
const locationsStore = useLocationsStore();

const step = ref(1);
const isUploading = ref(false);
const uploadError = ref<string | null>(null);
const uploadedUrl = ref<string | null>(null);
const mediaFile = ref<File | null>(null);

const form = reactive({
  name: "",
  category: "farm",
  description_short: "",
  description_full: "",
  address: "",
  latitude: 44.5,
  longitude: 39.0,
  tags: [] as string[],
  price_per_night: 0,
  capacity: 10,
  child_friendly: false,
});

const categoryOptions = [
  { label: "🐐 Ферма", value: "farm" },
  { label: "🍷 Винодельня", value: "winery" },
  { label: "🥾 Тропа", value: "trail" },
  { label: "🍽 Гастро", value: "gastro" },
  { label: "🌿 Природа", value: "nature" },
  { label: "🏕 Кемпинг", value: "camping" },
  { label: "🏖 Курорт", value: "resort" },
  { label: "🏛 Культура", value: "cultural" },
  { label: "🌊 Пляж", value: "beach" },
];

const tagInput = ref("");
function addTag() {
  const t = tagInput.value.trim().toLowerCase();
  if (t && !form.tags.includes(t)) {
    form.tags.push(t);
  }
  tagInput.value = "";
}
function removeTag(tag: string) {
  form.tags = form.tags.filter((t) => t !== tag);
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    mediaFile.value = input.files[0];
  }
}

async function uploadMedia() {
  if (!mediaFile.value) return;
  isUploading.value = true;
  uploadError.value = null;

  try {
    const { request } = useApiClient();
    const fd = new FormData();
    fd.append("file", mediaFile.value);
    const response = await request<{
      success: boolean;
      data: { url: string; object_name: string };
    }>("/api/v1/media/upload", {
      method: "POST",
      body: fd,
    });
    uploadedUrl.value = response.data?.url || "";
    step.value = 2;
  } catch (err: unknown) {
    const apiErr = err as { message?: string };
    uploadError.value = apiErr.message || "Ошибка загрузки файла";
  } finally {
    isUploading.value = false;
  }
}

async function handleCreateLocation() {
  const result = await locationsStore.createLocation({
    ...form,
    is_published: true,
  });
  if (result) {
    step.value = 3;
  }
}

onMounted(() => {
  authStore.restoreSession();
});
</script>

<template>
  <div class="min-h-screen bg-white border border-accent/40 flex flex-col items-center justify-start relative overflow-hidden px-4 pt-8 pb-16">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/8 top-[-100px] right-[5%] blur-[120px] pointer-events-none"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 bottom-[-80px] left-[8%] blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 max-w-xl w-full">
      <NuxtLink to="/" class="font-body font-bold text-[1.1rem] text-primary no-underline mb-4 block text-center hover:text-accent transition-colors">
        КудыТуды
      </NuxtLink>


      <div class="flex justify-center gap-2 mb-6">
        <div
          v-for="s in 3"
          :key="s"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="s <= step ? 'bg-accent w-12' : 'bg-primary/10 w-6'"
        ></div>
      </div>


      <div v-if="step === 1" class="bg-white/50 border border-accent/40 rounded-3xl p-6 md:p-8">
        <div class="text-center mb-4">
          <span class="inline-block font-body font-bold text-[0.62rem] tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-3.5 py-1 rounded-full mb-2">
            Шаг 1 из 3
          </span>
          <h1 class="font-heading text-primary" style="font-size: clamp(1.2rem, 3vw, 1.6rem);">
            Загрузите <span class="text-accent">фото или видео</span>
          </h1>
          <p class="font-body font-light text-primary-light text-[0.85rem] mt-2">
            Покажите вашу локацию — ИИ создаст карточку автоматически.
          </p>
        </div>


        <label class="flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-3xl cursor-pointer hover:border-accent/40 transition-colors mb-3">
          <div class="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
            <Camera class="w-7 h-7 text-accent-dark" />
          </div>
          <span class="font-body text-[0.85rem] text-primary-light">
            {{ mediaFile ? mediaFile.name : 'Нажмите или перетащите файл' }}
          </span>
          <span class="font-body text-[0.68rem] text-primary-light opacity-60">
            JPEG, PNG, MP4, WebM · до 100 МБ
          </span>
          <input type="file" accept="image/*,video/*" class="hidden" @change="handleFileSelect" />
        </label>

        <UiAlert v-if="uploadError" variant="destructive" class="rounded-2xl mb-4">
          <AlertCircle class="h-4 w-4" />
          <UiAlertDescription>{{ uploadError }}</UiAlertDescription>
        </UiAlert>

        <UiButton
          :disabled="!mediaFile || isUploading"
          class="w-full bg-accent hover:bg-accent-dark border-accent text-primary-dark font-body font-bold rounded-2xl py-3.5"
          @click="uploadMedia"
        >
          <Loader2 v-if="isUploading" class="w-4 h-4 mr-2 animate-spin" />
          <Upload v-else class="w-4 h-4 mr-2" />
          Загрузить
        </UiButton>

        <p class="mt-4 text-center">
          <NuxtLink to="/host/dashboard" class="font-body text-[0.78rem] text-primary-light no-underline hover:text-primary">
            Пропустить →
          </NuxtLink>
        </p>
      </div>


      <div v-else-if="step === 2" class="bg-white/50 border border-accent/40 rounded-3xl p-6 md:p-8">
        <div class="text-center mb-4">
          <span class="inline-block font-body font-bold text-[0.62rem] tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-3.5 py-1 rounded-full mb-2">
            Шаг 2 из 3
          </span>
          <h1 class="font-heading text-primary" style="font-size: clamp(1.2rem, 3vw, 1.6rem);">
            Расскажите о <span class="text-accent">месте</span>
          </h1>
        </div>

        <form class="flex flex-col gap-3" @submit.prevent="handleCreateLocation">
          <div class="flex flex-col gap-1.5">
            <label class="font-body text-[0.78rem] font-bold text-primary">Название</label>
            <UiInput v-model="form.name" placeholder="Ферма дядя Гурам" class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-body text-[0.78rem] font-bold text-primary">Категория</label>
            <UiSelect v-model="form.category">
              <UiSelectTrigger class="rounded-2xl font-body bg-white/25 border border-accent/40">
                <UiSelectValue placeholder="Выберите" />
              </UiSelectTrigger>
              <UiSelectContent class="rounded-2xl">
                <UiSelectItem v-for="opt in categoryOptions" :key="opt.value" :value="opt.value" class="font-body">
                  {{ opt.label }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-body text-[0.78rem] font-bold text-primary">Краткое описание</label>
            <UiInput v-model="form.description_short" placeholder="Горная ферма с козами и домашним вином" class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-body text-[0.78rem] font-bold text-primary">Адрес</label>
            <UiInput v-model="form.address" placeholder="с. Дивноморское, ул. Горная 15" class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="font-body text-[0.78rem] font-bold text-primary">Цена ₽/ночь</label>
              <UiInput v-model.number="form.price_per_night" type="number" min="0" class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="font-body text-[0.78rem] font-bold text-primary">Вместимость</label>
              <UiInput v-model.number="form.capacity" type="number" min="1" class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent" />
            </div>
          </div>


          <div class="flex flex-col gap-1.5">
            <label class="font-body text-[0.78rem] font-bold text-primary">Теги</label>
            <div class="flex gap-2">
              <UiInput
                v-model="tagInput"
                placeholder="Введите тег"
                class="rounded-2xl px-4 py-3 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent flex-1"
                @keydown.enter.prevent="addTag"
              />
              <UiButton type="button" variant="outline" class="rounded-2xl shrink-0" @click="addTag">
                <Plus class="w-4 h-4" />
              </UiButton>
            </div>
            <div v-if="form.tags.length" class="flex flex-wrap gap-1.5 mt-1">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="inline-flex items-center gap-1 font-body text-[0.72rem] text-accent-dark bg-accent/10 px-3 py-1 rounded-full cursor-pointer hover:bg-accent/20"
                @click="removeTag(tag)"
              >
                #{{ tag }} ×
              </span>
            </div>
          </div>

          <UiAlert v-if="locationsStore.error" variant="destructive" class="rounded-2xl">
            <AlertCircle class="h-4 w-4" />
            <UiAlertDescription>{{ locationsStore.error }}</UiAlertDescription>
          </UiAlert>

          <UiButton
            type="submit"
            :disabled="!form.name || locationsStore.loading"
            class="w-full mt-2 bg-accent hover:bg-accent-dark border-accent text-primary-dark font-body font-bold rounded-2xl py-3.5"
          >
            <Loader2 v-if="locationsStore.loading" class="w-4 h-4 mr-2 animate-spin" />
            <Check v-else class="w-4 h-4 mr-2" />
            Создать локацию
          </UiButton>
        </form>
      </div>


      <div v-else class="bg-white/50 border border-accent/40 rounded-3xl p-6 md:p-8 text-center">
        <div class="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
          <Check class="w-10 h-10 text-accent-dark" />
        </div>
        <h2 class="font-heading text-primary text-[1.4rem] mb-2">Локация создана!</h2>
        <p class="font-body font-light text-primary-light text-[0.88rem] max-w-sm mx-auto mb-6">
          Ваше место уже доступно туристам на карте КудыТуды.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink
            to="/host/dashboard"
            class="font-body font-bold text-[0.88rem] text-white bg-accent rounded-2xl px-6 py-3.5 no-underline hover:bg-accent-dark transition-colors inline-flex items-center justify-center gap-2"
          >
            Мои локации
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
          <button
            class="font-body font-bold text-[0.85rem] text-primary border-2 border-primary/20 rounded-2xl px-6 py-3.5 bg-transparent cursor-pointer hover:bg-primary hover:text-white transition-all"
            @click="step = 1; mediaFile = null"
          >
            Добавить ещё
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
