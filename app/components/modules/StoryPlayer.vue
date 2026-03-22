<script setup lang="ts">
import { Headphones, Play, Pause, Loader2, AlertCircle, Clock, Mic } from "lucide-vue-next";
import { useStoriesStore } from "~~/store/stories";

const props = defineProps<{
  routeId: string;
}>();

const storiesStore = useStoriesStore();
const currentlyPlaying = ref<string | null>(null);
const audioRefs = ref<Record<string, HTMLAudioElement>>({});

const generated = ref(false);

async function handleGenerate() {
  const ok = await storiesStore.generateStories(props.routeId);
  if (ok) {
    generated.value = true;
    await storiesStore.fetchStories(props.routeId);
  }
}

function togglePlay(pointId: string, audioUrl: string) {
  if (currentlyPlaying.value === pointId) {
    audioRefs.value[pointId]?.pause();
    currentlyPlaying.value = null;
    return;
  }

  // Pause any currently-playing audio
  if (currentlyPlaying.value && audioRefs.value[currentlyPlaying.value]) {
    audioRefs.value[currentlyPlaying.value]!.pause();
  }

  // Play selected
  if (!audioRefs.value[pointId]) {
    const audio = new Audio(audioUrl);
    audio.addEventListener("ended", () => {
      currentlyPlaying.value = null;
    });
    audioRefs.value[pointId] = audio;
  }
  audioRefs.value[pointId]!.play();
  currentlyPlaying.value = pointId;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

onMounted(async () => {
  // Check if stories already exist for this route
  await storiesStore.fetchStories(props.routeId);
  if (storiesStore.stories.length > 0) {
    generated.value = true;
  } else {
    // Stories may have been auto-triggered by buildFinalRoute (202 Accepted).
    // Try again after a delay — TTS generation takes a few seconds.
    setTimeout(async () => {
      if (!generated.value && !storiesStore.generating) {
        await storiesStore.fetchStories(props.routeId);
        if (storiesStore.stories.length > 0) {
          generated.value = true;
        }
      }
    }, 8000);
  }
});

onUnmounted(() => {
  // Cleanup audio
  Object.values(audioRefs.value).forEach((audio) => {
    audio.pause();
    audio.src = "";
  });
  audioRefs.value = {};
});
</script>

<template>
  <div class="bg-gradient-to-b from-white/70 to-white/30 backdrop-blur-md border border-accent/30 shadow-sm rounded-[2rem] p-5">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/30">
        <Headphones class="w-5 h-5 text-accent-dark" />
      </div>
      <div>
        <h3 class="font-heading text-lg font-bold text-primary leading-tight">Аудиогид</h3>
        <p class="font-body text-xs text-primary-light">ИИ-рассказ о каждой точке маршрута</p>
      </div>
    </div>

    <!-- Generate button -->
    <div v-if="!generated && !storiesStore.generating">
      <button
        class="w-full flex items-center justify-center gap-2 font-body font-bold text-sm bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent text-white border-none rounded-2xl px-4 py-3.5 cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]"
        @click="handleGenerate"
      >
        <Mic class="w-4 h-4" />
        Послушать аудиогид 🎙
      </button>
      <p class="font-body text-xs text-primary-light text-center mt-2 opacity-60">
        Генерация занимает ~5 секунд
      </p>
    </div>

    <!-- Generating state -->
    <div v-else-if="storiesStore.generating" class="flex flex-col items-center gap-3 py-6">
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 border-4 border-accent/30 rounded-full animate-ping"></div>
        <Loader2 class="w-8 h-8 text-accent animate-spin relative z-10" />
      </div>
      <p class="font-body font-medium text-sm text-primary">ИИ генерирует аудиогид…</p>
      <p class="font-body text-xs text-primary-light">ElevenLabs озвучивает точки маршрута</p>
    </div>

    <!-- Error -->
    <UiAlert v-else-if="storiesStore.error" variant="destructive" class="rounded-2xl border-red-200 bg-red-50 text-red-800 shadow-sm">
      <AlertCircle class="h-4 w-4" />
      <UiAlertDescription class="font-medium text-sm">{{ storiesStore.error }}</UiAlertDescription>
    </UiAlert>

    <!-- Stories list -->
    <div v-else-if="storiesStore.hasStories" class="flex flex-col gap-2">
      <div class="flex items-center justify-between mb-1">
        <span class="font-body text-xs font-bold text-primary-light uppercase tracking-widest">
          {{ storiesStore.stories.length }} {{ storiesStore.stories.length === 1 ? 'история' : 'историй' }}
        </span>
        <span class="font-body text-xs text-primary-light flex items-center gap-1">
          <Clock class="w-3 h-3" />
          {{ formatDuration(storiesStore.totalDuration) }}
        </span>
      </div>

      <div
        v-for="(story, idx) in storiesStore.stories"
        :key="story.point_id"
        class="flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 group"
        :class="currentlyPlaying === story.point_id
          ? 'bg-accent/10 border-accent/40 shadow-sm'
          : 'bg-white/60 border-white hover:border-accent/20 hover:bg-white'"
      >
        <button
          class="w-10 h-10 rounded-full shrink-0 flex items-center justify-center cursor-pointer transition-all duration-200 border-none shadow-sm"
          :class="currentlyPlaying === story.point_id
            ? 'bg-accent text-white shadow-accent/30'
            : 'bg-white text-accent-dark group-hover:bg-accent/10 border border-accent/30'"
          @click="togglePlay(story.point_id, story.audio_url)"
        >
          <Pause v-if="currentlyPlaying === story.point_id" class="w-4 h-4" />
          <Play v-else class="w-4 h-4 ml-0.5" />
        </button>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-xs font-black shrink-0">
              {{ idx + 1 }}
            </span>
            <p class="font-heading font-bold text-sm text-primary truncate">{{ story.location_name }}</p>
          </div>
          <p class="font-body text-xs text-primary-light mt-1 line-clamp-2">{{ story.story_text }}</p>
          <span class="font-body text-2xs text-primary-light opacity-60 mt-1 inline-block">
            {{ formatDuration(story.duration_sec) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="generated" class="text-center py-4">
      <p class="font-body text-sm text-primary-light">Истории пока не готовы</p>
      <button
        class="font-body text-sm text-accent-dark font-bold mt-2 bg-transparent border-none cursor-pointer underline"
        @click="storiesStore.fetchStories(props.routeId)"
      >
        Обновить
      </button>
    </div>
  </div>
</template>
