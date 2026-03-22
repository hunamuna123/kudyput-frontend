<script setup lang="ts">
import { Mic, Loader2, ArrowLeft } from "lucide-vue-next";
import { useVibeStore } from "~~/store/vibe";
import { useAuthStore } from "~~/store/auth";

useHead({
  title: "Голосовой ввод - КудыТуды",
});

const vibeStore = useVibeStore();
const authStore = useAuthStore();

const isRecording = ref(false);
const isProcessing = ref(false);
const recordingTime = ref(0);
const audioLevel = ref(0);

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingInterval: ReturnType<typeof setInterval> | null = null;
let analyser: AnalyserNode | null = null;
let animationFrame: number | null = null;

let isUnmountedComponent = false;

onMounted(() => {
  authStore.restoreSession();
  isUnmountedComponent = false;
});

let recordingStartTime = 0;

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    function updateLevel() {
      if (!analyser) return;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
      audioLevel.value = Math.min(avg / 128, 1);
      animationFrame = requestAnimationFrame(updateLevel);
    }
    updateLevel();

    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      if (animationFrame) cancelAnimationFrame(animationFrame);
      audioLevel.value = 0;

      if (isUnmountedComponent) return;
      
      const duration = Date.now() - recordingStartTime;
      if (duration < 3000) {
        vibeStore.error = "Запись слишком короткая. Пожалуйста, расскажите подробнее (минимум 3 секунды).";
        return;
      }

      if (audioChunks.length === 0) return;
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      isProcessing.value = true;

      const result = await vibeStore.voiceProfile(blob);
      
      if (isUnmountedComponent) return;
      
      isProcessing.value = false;

      if (result) {
        navigateTo("/vibe/result");
      }
    };

    mediaRecorder.start();
    recordingStartTime = Date.now();
    isRecording.value = true;
    recordingTime.value = 0;
    recordingInterval = setInterval(() => {
      recordingTime.value++;
    }, 1000);
  } catch {
    vibeStore.error = "Нет доступа к микрофону. Разрешите доступ в настройках браузера.";
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
  isRecording.value = false;
  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

onUnmounted(() => {
  isUnmountedComponent = true;
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
  if (recordingInterval) clearInterval(recordingInterval);
  if (animationFrame) cancelAnimationFrame(animationFrame);
});
</script>
<template>
  <div class="min-h-screen bg-white border border-accent/40 flex flex-col items-center justify-start relative overflow-hidden px-4 pt-6 pb-16">
    <div class="absolute w-[400px] h-[400px] rounded-full bg-accent/8 top-[-100px] right-[10%] blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 max-w-lg w-full text-center flex flex-col items-center">
      <NuxtLink to="/start" class="font-body text-sm text-primary-light no-underline mb-4 hover:text-primary transition-colors inline-flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        Назад
      </NuxtLink>


      <div v-if="isProcessing" class="flex flex-col items-center gap-4">
        <div class="relative w-28 h-28 flex items-center justify-center">

          <div class="absolute inset-0 animate-spin-slow">
            <div class="absolute w-2.5 h-2.5 rounded-full bg-accent top-0 left-1/2 -ml-1.25 animate-pulse"></div>
            <div class="absolute w-2 h-2 rounded-full bg-accent/60 bottom-2 right-0 animate-pulse" style="animation-delay: 0.5s;"></div>
            <div class="absolute w-1.5 h-1.5 rounded-full bg-primary/40 top-6 left-0 animate-pulse" style="animation-delay: 1s;"></div>
          </div>
          <div class="absolute inset-0 animate-spin-reverse">
            <div class="absolute w-1.5 h-1.5 rounded-full bg-accent/50 top-3 right-3 animate-pulse" style="animation-delay: 0.3s;"></div>
            <div class="absolute w-2 h-2 rounded-full bg-primary/30 bottom-6 left-4 animate-pulse" style="animation-delay: 0.7s;"></div>
          </div>

          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-accent/25 to-primary/15 flex items-center justify-center backdrop-blur-sm">
            <Loader2 class="w-8 h-8 text-accent-dark animate-spin" />
          </div>
        </div>
        <h2 class="font-body font-bold text-primary text-xl">ИИ создаёт ваш профиль…</h2>
        <p class="font-body font-light text-primary-light text-base">Анализируем настроение и предпочтения</p>
        <div class="flex gap-2 mt-2">
          <div class="w-2 h-2 rounded-full bg-accent animate-bounce" style="animation-delay: 0ms;"></div>
          <div class="w-2 h-2 rounded-full bg-accent animate-bounce" style="animation-delay: 200ms;"></div>
          <div class="w-2 h-2 rounded-full bg-accent animate-bounce" style="animation-delay: 400ms;"></div>
        </div>
      </div>


      <div v-else-if="vibeStore.error" class="flex flex-col items-center gap-3">
        <div class="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <span class="text-3xl">😔</span>
        </div>
        <p class="font-body text-red-600 text-md max-w-xs">{{ vibeStore.error }}</p>
        <button
          class="font-body font-bold text-base text-accent-dark bg-accent/10 rounded-2xl px-6 py-3 border-none cursor-pointer hover:bg-accent/20 transition-colors"
          @click="vibeStore.error = null"
        >
          Попробовать снова
        </button>
      </div>


      <div v-else class="flex flex-col items-center gap-3">
        <span class="inline-block font-body font-bold text-xs tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-3.5 py-1 rounded-full">
          Голосовой ввод
        </span>

        <h1 class="font-heading text-primary leading-[1.25] text-heading-voice">
          Расскажи, <span class="text-accent">чего хочешь</span>
        </h1>
        <p class="font-body font-light text-primary-light text-base leading-relaxed max-w-sm">
          Нажми и расскажи о своих мечтах — тишина, горы, вино, адреналин... Без фильтров.
        </p>


        <button
          class="relative w-28 h-28 rounded-full border-none cursor-pointer transition-all duration-300 mt-2"
          :class="isRecording
            ? 'bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.4)]'
            : 'bg-accent shadow-[0_8px_40px_rgba(164,190,79,0.3)] hover:scale-105 hover:shadow-[0_12px_50px_rgba(164,190,79,0.4)]'"
          :style="isRecording ? `transform: scale(${1.05 + audioLevel * 0.15})` : ''"
          @mousedown="startRecording"
          @mouseup="stopRecording"
          @mouseleave="isRecording && stopRecording()"
          @touchstart.prevent="startRecording"
          @touchend.prevent="stopRecording"
        >
          <Mic class="w-9 h-9 text-white mx-auto" />
          <div v-if="isRecording" class="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-30"></div>
        </button>


        <div v-if="isRecording" class="flex items-end gap-1 h-8">
          <div
            v-for="i in 7"
            :key="i"
            class="w-1.5 bg-red-400 rounded-full transition-all duration-100"
            :style="{ height: `${Math.max(4, audioLevel * 32 * Math.sin(i * 0.7 + recordingTime))}px` }"
          ></div>
        </div>

        <p class="font-body font-light text-primary-light text-sm mt-2">
          {{ isRecording ? `🔴 Запись ${formatTime(recordingTime)}… Отпустите для отправки` : 'Нажмите и удерживайте' }}
        </p>
      </div>
    </div>
  </div>
</template>
