<script setup lang="ts">
import {
  Mic, MicOff, Upload, Loader2, Check, ArrowRight,
  AlertCircle, Camera, MapPin, Send, RotateCcw, Sparkles,
} from "lucide-vue-next";
import { useOnboardingStore } from "~~/store/onboarding";
import { useAuthStore } from "~~/store/auth";

useHead({
  title: "Бизнесмен — Онбординг — КудыТуды",
});

const authStore = useAuthStore();
const onboarding = useOnboardingStore();

const step = ref(1);
const address = ref("");
const mediaFile = ref<File | null>(null);
const uploadedMediaUrl = ref<string | null>(null);
const isUploadingMedia = ref(false);
const mediaError = ref<string | null>(null);

// ——— Voice recording ———
const isRecording = ref(false);
const recordingDuration = ref(0);
const audioBlob = ref<Blob | null>(null);
const audioUrl = ref<string | null>(null);
const analyserLevel = ref(0);

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingInterval: ReturnType<typeof setInterval> | null = null;
let audioContext: AudioContext | null = null;
let analyserNode: AnalyserNode | null = null;
let animFrameId: number | null = null;

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Set up analyser for volume visualization
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 256;
    source.connect(analyserNode);

    function updateLevel() {
      if (!analyserNode) return;
      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
      analyserNode.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
      analyserLevel.value = Math.min(avg / 128, 1);
      animFrameId = requestAnimationFrame(updateLevel);
    }
    updateLevel();

    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      audioBlob.value = blob;
      audioUrl.value = URL.createObjectURL(blob);
      stream.getTracks().forEach((t) => t.stop());
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (audioContext) audioContext.close();
      analyserLevel.value = 0;
    };

    mediaRecorder.start();
    isRecording.value = true;
    recordingDuration.value = 0;
    recordingInterval = setInterval(() => {
      recordingDuration.value++;
    }, 1000);
  } catch {
    onboarding.error = "Нет доступа к микрофону. Разрешите доступ в настройках браузера.";
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  isRecording.value = false;
  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }
}

function resetRecording() {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
  audioBlob.value = null;
  audioUrl.value = null;
  recordingDuration.value = 0;
  onboarding.reset();
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ——— Media upload (optional photo/video) ———
function handleMediaSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    mediaFile.value = input.files[0];
  }
}

async function uploadMedia() {
  if (!mediaFile.value) return;
  isUploadingMedia.value = true;
  mediaError.value = null;
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
    uploadedMediaUrl.value = response.data?.url || "";
  } catch (err: unknown) {
    const apiErr = err as { message?: string };
    mediaError.value = apiErr.message || "Ошибка загрузки файла";
  } finally {
    isUploadingMedia.value = false;
  }
}

// ——— Submit onboarding ———
async function submitOnboarding() {
  if (!audioBlob.value) return;

  // Upload media first if selected but not yet uploaded
  if (mediaFile.value && !uploadedMediaUrl.value) {
    await uploadMedia();
    if (mediaError.value) return;
  }

  const mediaUrls = uploadedMediaUrl.value ? [uploadedMediaUrl.value] : undefined;

  await onboarding.startOnboarding(
    audioBlob.value,
    address.value || undefined,
    undefined,
    undefined,
    mediaUrls,
  );

  step.value = 2;
}

// ——— Processing step labels ———
const processingLabel = computed(() => {
  const p = onboarding.progress;
  if (p < 30) return "Распознаём речь…";
  if (p < 60) return "Извлекаем данные…";
  if (p < 90) return "Создаём черновик…";
  return "Почти готово…";
});

// Watch for completion
watch(
  () => onboarding.status,
  (status) => {
    if (status === "completed") {
      step.value = 3;
    }
  },
);

// ——— Category labels ———
const categoryLabels: Record<string, string> = {
  farm: "🐐 Ферма",
  winery: "🍷 Винодельня",
  trail: "🥾 Тропа",
  gastro: "🍽 Гастро",
  nature: "🌿 Природа",
  camping: "🏕 Кемпинг",
  resort: "🏖 Курорт",
  cultural: "🏛 Культура",
  beach: "🌊 Пляж",
};

function startOver() {
  resetRecording();
  mediaFile.value = null;
  uploadedMediaUrl.value = null;
  address.value = "";
  step.value = 1;
}

onMounted(() => {
  authStore.restoreSession();
});

onUnmounted(() => {
  onboarding.stopPolling();
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
});
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-start relative overflow-hidden px-4 pt-6 pb-20">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/8 top-[-100px] right-[5%] blur-[120px] pointer-events-none"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 bottom-[-80px] left-[8%] blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 w-full" style="max-width: 540px;">
      <NuxtLink to="/" class="font-body font-bold text-2xl text-primary no-underline mb-5 block text-center hover:text-accent transition-colors">
        КудыТуды
      </NuxtLink>

      <!-- Progress bar -->
      <div class="flex justify-center gap-2 mb-8">
        <div
          v-for="s in 3"
          :key="s"
          class="h-1.5 rounded-full transition-all duration-300"
          :class="s <= step ? 'bg-accent w-14' : 'bg-primary/10 w-6'"
        ></div>
      </div>


      <!-- ═══════ STEP 1 — Voice Recording ═══════ -->
      <div v-if="step === 1" class="flex flex-col gap-5">
        <div class="text-center">
          <span class="inline-block font-body font-bold text-xs tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-3.5 py-1 rounded-full mb-3">
            Шаг 1 из 3
          </span>
          <h1 class="font-body font-bold text-primary text-xl leading-tight">
            Расскажите о <span class="text-accent">вашем месте</span>
          </h1>
          <p class="font-body text-primary-light text-md mt-2">
            Запишите голосовое описание — ИИ создаст карточку автоматически.
          </p>
        </div>

        <!-- Voice recorder -->
        <div class="flex flex-col items-center gap-4 py-6">
          <!-- Recording button -->
          <div class="relative">
            <!-- Pulse rings -->
            <div
              v-if="isRecording"
              class="absolute inset-0 rounded-full bg-red-500/20 animate-pulse-record"
              :style="{ transform: `scale(${1.3 + analyserLevel * 0.5})` }"
            ></div>
            <div
              v-if="isRecording"
              class="absolute inset-0 rounded-full bg-red-500/10 animate-pulse-record"
              style="animation-delay: 0.3s;"
              :style="{ transform: `scale(${1.6 + analyserLevel * 0.7})` }"
            ></div>

            <button
              class="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border-0"
              :class="isRecording
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : audioBlob
                  ? 'bg-accent/15 text-accent-dark'
                  : 'bg-accent text-white shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:scale-105'"
              @click="isRecording ? stopRecording() : (audioBlob ? null : startRecording())"
            >
              <MicOff v-if="isRecording" class="w-10 h-10" />
              <Check v-else-if="audioBlob" class="w-10 h-10" />
              <Mic v-else class="w-10 h-10" />
            </button>
          </div>

          <!-- Timer / Status -->
          <div class="text-center">
            <p v-if="isRecording" class="font-body font-bold text-lg text-red-500">
              {{ formatTime(recordingDuration) }}
            </p>
            <p v-else-if="audioBlob" class="font-body font-bold text-md text-accent-dark">
              Записано {{ formatTime(recordingDuration) }}
            </p>
            <p v-else class="font-body text-md text-primary-light">
              Нажмите и расскажите про место
            </p>
          </div>

          <!-- Audio preview + re-record -->
          <div v-if="audioBlob && !isRecording" class="flex flex-col items-center gap-3 w-full">
            <audio :src="audioUrl!" controls class="w-full max-w-[360px] h-10 rounded-xl" />
            <button
              class="flex items-center gap-1.5 font-body text-base text-primary-light hover:text-accent cursor-pointer bg-transparent border-0 transition-colors"
              @click="resetRecording"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              Записать заново
            </button>
          </div>
        </div>

        <!-- Address field -->
        <div class="flex flex-col gap-2">
          <label class="font-body text-base font-bold text-primary flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-accent-dark" />
            Адрес (необязательно)
          </label>
          <UiInput
            v-model="address"
            placeholder="с. Дивноморское, ул. Горная 15"
            class="rounded-2xl px-4 py-3.5 font-body text-lg bg-white/60 border border-primary/12 focus-visible:ring-accent focus-visible:border-accent"
          />
        </div>

        <!-- Optional media upload -->
        <div class="flex flex-col gap-2">
          <label class="font-body text-base font-bold text-primary flex items-center gap-1.5">
            <Camera class="w-3.5 h-3.5 text-accent-dark" />
            Фото или видео (необязательно)
          </label>
          <label class="flex items-center gap-3 p-4 border border-dashed border-primary/15 rounded-2xl cursor-pointer hover:border-accent/50 hover:bg-accent/3 transition-all">
            <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Upload class="w-4.5 h-4.5 text-accent-dark" />
            </div>
            <span class="font-body text-md text-primary-light">
              {{ mediaFile ? mediaFile.name : 'Нажмите чтобы выбрать' }}
            </span>
            <input type="file" accept="image/*,video/*" class="hidden" @change="handleMediaSelect" />
          </label>
        </div>

        <!-- Error -->
        <UiAlert v-if="onboarding.error" variant="destructive" class="rounded-2xl">
          <AlertCircle class="h-4 w-4" />
          <UiAlertDescription>{{ onboarding.error }}</UiAlertDescription>
        </UiAlert>

        <!-- Submit -->
        <UiButton
          :disabled="!audioBlob || onboarding.status === 'uploading'"
          class="w-full bg-accent hover:bg-accent-dark border-accent text-white font-body font-bold rounded-2xl py-4 text-lg"
          @click="submitOnboarding"
        >
          <Loader2 v-if="onboarding.status === 'uploading'" class="w-4 h-4 mr-2 animate-spin" />
          <Send v-else class="w-4 h-4 mr-2" />
          Отправить на обработку
        </UiButton>

        <p class="text-center">
          <NuxtLink to="/host/dashboard" class="font-body text-base text-primary-light no-underline hover:text-accent transition-colors">
            Пропустить →
          </NuxtLink>
        </p>
      </div>


      <!-- ═══════ STEP 2 — AI Processing ═══════ -->
      <div v-else-if="step === 2" class="flex flex-col gap-6 items-center py-8">
        <div class="text-center">
          <span class="inline-block font-body font-bold text-xs tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-3.5 py-1 rounded-full mb-3">
            Шаг 2 из 3
          </span>
          <h1 class="font-body font-bold text-primary text-xl leading-tight">
            ИИ <span class="text-accent">обрабатывает</span> запись
          </h1>
        </div>

        <!-- Animated processing circle -->
        <div class="relative w-36 h-36 flex items-center justify-center">
          <!-- Spinning ring -->
          <svg class="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 144 144">
            <circle
              cx="72" cy="72" r="64"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-dasharray="100 302"
              stroke-linecap="round"
              class="text-accent/30"
            />
          </svg>
          <!-- Progress arc -->
          <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle
              cx="72" cy="72" r="64"
              fill="none"
              stroke="currentColor"
              stroke-width="5"
              stroke-linecap="round"
              class="text-accent transition-all duration-500"
              :stroke-dasharray="`${(onboarding.progress / 100) * 402} 402`"
            />
          </svg>
          <!-- Center icon + percent -->
          <div class="flex flex-col items-center gap-1 z-10">
            <Sparkles class="w-7 h-7 text-accent-dark" />
            <span class="font-body font-bold text-xl text-primary">{{ onboarding.progress }}%</span>
          </div>
        </div>

        <!-- Status label -->
        <p v-if="onboarding.status === 'failed'" class="font-body font-bold text-md text-red-500 text-center">
          {{ onboarding.error || 'Ошибка обработки' }}
        </p>
        <p v-else class="font-body font-bold text-md text-primary-light text-center">
          {{ processingLabel }}
        </p>

        <!-- Error: retry -->
        <div v-if="onboarding.status === 'failed'" class="flex flex-col gap-3 w-full">
          <UiAlert variant="destructive" class="rounded-2xl">
            <AlertCircle class="h-4 w-4" />
            <UiAlertDescription>{{ onboarding.error }}</UiAlertDescription>
          </UiAlert>
          <UiButton
            class="w-full bg-accent hover:bg-accent-dark border-accent text-white font-body font-bold rounded-2xl py-4 text-lg"
            @click="startOver"
          >
            <RotateCcw class="w-4 h-4 mr-2" />
            Попробовать снова
          </UiButton>
        </div>
      </div>


      <!-- ═══════ STEP 3 — Draft Preview ═══════ -->
      <div v-else class="flex flex-col gap-5">
        <div class="text-center">
          <span class="inline-block font-body font-bold text-xs tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-3.5 py-1 rounded-full mb-3">
            Шаг 3 из 3
          </span>
          <div class="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <Check class="w-10 h-10 text-accent-dark" />
          </div>
          <h1 class="font-body font-bold text-primary text-xl leading-tight mb-1">
            Черновик <span class="text-accent">готов!</span>
          </h1>
          <p class="font-body text-primary-light text-md">
            ИИ создал карточку по вашему описанию.
          </p>
        </div>

        <!-- Draft card -->
        <div v-if="onboarding.extractedData" class="bg-white/50 border border-accent/30 rounded-3xl p-5 flex flex-col gap-4">
          <!-- Name -->
          <div>
            <span class="font-body text-xs text-primary-light uppercase tracking-wider">Название</span>
            <h2 class="font-body font-bold text-lg text-primary mt-0.5">
              {{ onboarding.extractedData.name_suggestion }}
            </h2>
          </div>

          <!-- Description -->
          <div>
            <span class="font-body text-xs text-primary-light uppercase tracking-wider">Описание</span>
            <p class="font-body text-md text-primary mt-0.5">
              {{ onboarding.extractedData.description_short }}
            </p>
          </div>

          <!-- Category + Price + Capacity row -->
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-accent/8 rounded-2xl p-3 text-center">
              <span class="font-body text-xs text-primary-light block">Категория</span>
              <span class="font-body font-bold text-md text-primary">
                {{ categoryLabels[onboarding.extractedData.category] || onboarding.extractedData.category }}
              </span>
            </div>
            <div class="bg-accent/8 rounded-2xl p-3 text-center">
              <span class="font-body text-xs text-primary-light block">Цена/ночь</span>
              <span class="font-body font-bold text-md text-primary">
                {{ onboarding.extractedData.price_per_night?.toLocaleString('ru-RU') }} ₽
              </span>
            </div>
            <div class="bg-accent/8 rounded-2xl p-3 text-center">
              <span class="font-body text-xs text-primary-light block">Мест</span>
              <span class="font-body font-bold text-md text-primary">
                {{ onboarding.extractedData.capacity }}
              </span>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="onboarding.extractedData.tags?.length">
            <span class="font-body text-xs text-primary-light uppercase tracking-wider block mb-1.5">Теги</span>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in onboarding.extractedData.tags"
                :key="tag"
                class="font-body text-sm font-medium text-accent-dark bg-accent/10 px-3 py-1.5 rounded-full"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <!-- Amenities -->
          <div v-if="onboarding.extractedData.amenities?.length">
            <span class="font-body text-xs text-primary-light uppercase tracking-wider block mb-1.5">Удобства</span>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="amenity in onboarding.extractedData.amenities"
                :key="amenity"
                class="font-body text-sm text-primary bg-primary/6 px-3 py-1.5 rounded-full"
              >
                {{ amenity }}
              </span>
            </div>
          </div>
        </div>

        <!-- No data fallback -->
        <div v-else class="text-center py-4">
          <p class="font-body text-primary-light text-md">
            Черновик локации создан и доступен в вашем кабинете.
          </p>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col gap-3">
          <NuxtLink
            to="/host/dashboard"
            class="w-full font-body font-bold text-lg text-white bg-accent rounded-2xl px-6 py-4 no-underline hover:bg-accent-dark transition-colors inline-flex items-center justify-center gap-2"
          >
            Мои локации
            <ArrowRight class="w-4 h-4" />
          </NuxtLink>
          <button
            class="w-full font-body font-bold text-md text-primary border-2 border-primary/15 rounded-2xl px-6 py-3.5 bg-transparent cursor-pointer hover:bg-accent hover:text-white hover:border-accent transition-all"
            @click="startOver"
          >
            Добавить ещё
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
