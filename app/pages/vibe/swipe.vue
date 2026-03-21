<script setup lang="ts">
import { Heart, X, ArrowLeft, Loader2, Sparkles } from "lucide-vue-next";
import { useVibeStore } from "~~/store/vibe";
import { useAuthStore } from "~~/store/auth";

useHead({
  title: "Эмоциональный свайп - КудыТуды",
});

const vibeStore = useVibeStore();
const authStore = useAuthStore();
const currentIndex = ref(0);
const swipedCount = ref(0);
const isFinishing = ref(false);

const isDragging = ref(false);
const dragX = ref(0);
const dragY = ref(0);
const dragStartX = ref(0);
const dragStartY = ref(0);
const flyDirection = ref<"left" | "right" | null>(null);

const fallbackScenes = [
  { id: "00000000-0001-4000-8000-000000000001", title: "Костёр в тишине", description: "Треск дров, сверчки, звёздное небо. Ты наедине с природой в горном ущелье.", image_url: "", display_order: 1 },
  { id: "00000000-0002-4000-8000-000000000002", title: "Винный погреб", description: "Звон бокалов, приглушённый джаз. Дегустация аутентичных вин под каменными сводами.", image_url: "", display_order: 2 },
  { id: "00000000-0003-4000-8000-000000000003", title: "Горная тропа", description: "Ветер, птицы, хруст камней под ногами. Тропа уходит к облакам.", image_url: "", display_order: 3 },
  { id: "00000000-0004-4000-8000-000000000004", title: "Уединённый берег", description: "Шёпот волн, тёплый песок. Ни души на километры — только ты и море.", image_url: "", display_order: 4 },
  { id: "00000000-0005-4000-8000-000000000005", title: "Деревенский фестиваль", description: "Живая музыка, смех, запах жарки. Народные танцы под открытым небом.", image_url: "", display_order: 5 },
  { id: "00000000-0006-4000-8000-000000000006", title: "Ферма на рассвете", description: "Блеяние коз, звон ведра, запах свежего хлеба из печи.", image_url: "", display_order: 6 },
  { id: "00000000-0007-4000-8000-000000000007", title: "Палатка у реки", description: "Шум воды, далёкие молнии, уют спального мешка.", image_url: "", display_order: 7 },
  { id: "00000000-0008-4000-8000-000000000008", title: "Старый дом с историей", description: "Скрип двери, тиканье часов, запах старых книг и дерева.", image_url: "", display_order: 8 },
];

const titleEmojiMap: [string[], string][] = [
  [["костёр", "огонь", "fire"], "🔥"],
  [["вин", "погреб", "дегустац", "гастроном"], "🍷"],
  [["гор", "рассвет", "summit"], "🏔"],
  [["берег", "мор", "закат", "пляж", "ocean"], "🌊"],
  [["фестиваль", "празд", "деревен"], "🎪"],
  [["ферм", "завтрак", "козы", "сыр"], "🐐"],
  [["палатк", "лес", "тропа", "хвой"], "🏕"],
  [["дом", "истор", "старин", "культур", "крепость", "наследи"], "🏛"],
  [["город", "ночн", "небоскрёб"], "🌃"],
  [["зимн", "снег", "горнолыж", "спорт"], "⛷"],
];

const scenes = computed(() => {
  if (vibeStore.scenes.length > 0) return vibeStore.scenes;
  return fallbackScenes;
});

const currentScene = computed(() => scenes.value[currentIndex.value]);
const nextScene = computed(() => scenes.value[currentIndex.value + 1]);
const totalRequired = computed(() => Math.min(scenes.value.length, 6));
const isFinished = computed(() => swipedCount.value >= totalRequired.value || currentIndex.value >= scenes.value.length);
const progress = computed(() => swipedCount.value / totalRequired.value);

function getEmoji(scene: { title: string }) {
  const lower = scene.title.toLowerCase();
  for (const [keywords, emoji] of titleEmojiMap) {
    if (keywords.some(kw => lower.includes(kw))) return emoji;
  }
  return "✨";
}

const cardStyle = computed(() => {
  if (flyDirection.value) {
    const flyX = flyDirection.value === "right" ? 600 : -600;
    const flyRotate = flyDirection.value === "right" ? 30 : -30;
    return {
      transform: `translate(${flyX}px, -80px) rotate(${flyRotate}deg)`,
      transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease",
      opacity: "0",
    };
  }
  if (!isDragging.value && dragX.value === 0) {
    return {
      transform: "translate(0, 0) rotate(0)",
      transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
    };
  }
  const rotation = dragX.value * 0.08;
  return {
    transform: `translate(${dragX.value}px, ${dragY.value * 0.3}px) rotate(${rotation}deg)`,
    transition: isDragging.value ? "none" : "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
    cursor: isDragging.value ? "grabbing" : "grab",
  };
});

const likeOpacity = computed(() => Math.min(Math.max(dragX.value / 100, 0), 1));
const nopeOpacity = computed(() => Math.min(Math.max(-dragX.value / 100, 0), 1));

const nextCardStyle = computed(() => {
  const absX = Math.abs(dragX.value);
  const scale = 0.92 + Math.min(absX / 300, 0.08);
  const opacity = 0.5 + Math.min(absX / 300, 0.5);
  return {
    transform: `scale(${scale})`,
    opacity: String(opacity),
    transition: isDragging.value ? "none" : "all 0.4s ease",
  };
});

function onPointerDown(e: PointerEvent) {
  if (flyDirection.value) return;
  isDragging.value = true;
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return;
  dragX.value = e.clientX - dragStartX.value;
  dragY.value = e.clientY - dragStartY.value;
}

function onPointerUp() {
  if (!isDragging.value) return;
  isDragging.value = false;

  const threshold = 100;
  if (dragX.value > threshold) {
    executeSwipe("right");
  } else if (dragX.value < -threshold) {
    executeSwipe("left");
  } else {
    // Spring back
    dragX.value = 0;
    dragY.value = 0;
  }
}

async function executeSwipe(direction: "left" | "right") {
  const scene = currentScene.value;
  if (!scene) return;
  flyDirection.value = direction;

  vibeStore.swipeScene(scene.id, direction);

  await new Promise(resolve => setTimeout(resolve, 400));

  flyDirection.value = null;
  dragX.value = 0;
  dragY.value = 0;
  swipedCount.value++;
  currentIndex.value++;

  if (isFinished.value) {
    finishSwipe();
  }
}

function handleButtonSwipe(direction: "left" | "right") {
  if (flyDirection.value) return;
  executeSwipe(direction);
}

async function finishSwipe() {
  isFinishing.value = true;
  await vibeStore.finalize();
  isFinishing.value = false;
  navigateTo("/vibe/result");
}

onMounted(async () => {
  authStore.restoreSession();
  await vibeStore.fetchScenes();
});
</script>

<template>
  <div class="min-h-screen bg-cream-light flex flex-col items-center justify-center relative overflow-hidden px-5">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/8 top-[-100px] left-[10%] blur-[120px] pointer-events-none"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 bottom-[-80px] right-[5%] blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 max-w-md w-full text-center flex flex-col items-center">
      <NuxtLink to="/vibe/choice" class="font-body text-[0.78rem] text-primary-light no-underline mb-6 hover:text-primary transition-colors inline-flex items-center gap-1.5 self-start">
        <ArrowLeft class="w-3.5 h-3.5" />
        Назад
      </NuxtLink>


      <div class="w-full max-w-xs mb-6">
        <div class="flex justify-between mb-1.5">
          <span class="font-body font-bold text-[0.65rem] tracking-[0.14em] uppercase text-accent-dark">
            {{ Math.min(swipedCount + 1, totalRequired) }} / {{ totalRequired }}
          </span>
          <span v-if="swipedCount > 0" class="font-body text-[0.65rem] text-primary-light">
            {{ swipedCount }} свайпов
          </span>
        </div>
        <div class="w-full h-2 bg-primary/6 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${progress * 100}%` }"
          ></div>
        </div>
      </div>


      <div v-if="isFinishing" class="flex flex-col items-center gap-5 py-16">
        <div class="relative w-24 h-24 flex items-center justify-center">
          <div class="absolute inset-0 animate-spin-slow">
            <div class="absolute w-2.5 h-2.5 rounded-full bg-accent top-0 left-1/2 animate-pulse"></div>
            <div class="absolute w-2 h-2 rounded-full bg-accent/60 bottom-2 right-0 animate-pulse" style="animation-delay: 0.5s;"></div>
          </div>
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-accent/25 to-primary/15 flex items-center justify-center">
            <Sparkles class="w-7 h-7 text-accent-dark animate-pulse" />
          </div>
        </div>
        <h2 class="font-heading text-primary text-[1.2rem]">Анализируем предпочтения…</h2>
        <p class="font-body font-light text-primary-light text-[0.85rem]">Формируем вайб-паспорт</p>
        <div class="flex gap-2 mt-1">
          <div class="w-2 h-2 rounded-full bg-accent animate-bounce" style="animation-delay: 0ms;"></div>
          <div class="w-2 h-2 rounded-full bg-accent animate-bounce" style="animation-delay: 200ms;"></div>
          <div class="w-2 h-2 rounded-full bg-accent animate-bounce" style="animation-delay: 400ms;"></div>
        </div>
      </div>


      <div v-else-if="currentScene && !isFinished" class="relative w-full h-[420px] mb-6">

        <div
          v-if="nextScene"
          class="absolute inset-x-0 top-4 mx-auto w-[90%] h-[360px] bg-cream/40 border border-cream/50 rounded-[28px] flex flex-col items-center justify-center"
          :style="nextCardStyle"
        >
          <span class="text-4xl opacity-60">{{ getEmoji(nextScene) }}</span>
        </div>


        <div
          class="absolute inset-0 mx-auto w-full bg-cream/60 border border-cream/60 rounded-3xl flex flex-col items-center justify-center gap-5 p-10 touch-none select-none"
          :style="cardStyle"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointerleave="onPointerUp"
        >

          <div
            class="absolute inset-0 rounded-3xl border-4 border-accent bg-accent/5 flex items-center justify-center pointer-events-none transition-opacity duration-100"
            :style="{ opacity: likeOpacity }"
          >
            <span class="font-heading text-accent-dark text-[2rem] transform -rotate-12 border-4 border-accent-dark px-5 py-2 rounded-2xl">
              НРАВИТСЯ
            </span>
          </div>


          <div
            class="absolute inset-0 rounded-3xl border-4 border-red-500 bg-red-500/5 flex items-center justify-center pointer-events-none transition-opacity duration-100"
            :style="{ opacity: nopeOpacity }"
          >
            <span class="font-heading text-red-500 text-[2rem] transform rotate-12 border-4 border-red-500 px-5 py-2 rounded-2xl">
              НЕТ
            </span>
          </div>


          <div class="relative z-10 flex flex-col items-center gap-4 pointer-events-none">
            <div v-if="currentScene.image_url" class="w-24 h-24 rounded-2xl overflow-hidden bg-primary/5">
              <img :src="currentScene.image_url" :alt="currentScene.title" class="w-full h-full object-cover" />
            </div>
            <span v-else class="text-6xl block drop-shadow-lg">{{ getEmoji(currentScene) }}</span>

            <h2 class="font-heading text-primary text-[1.25rem] leading-snug">{{ currentScene.title }}</h2>
            <p class="font-body font-light text-primary-light text-[0.88rem] leading-relaxed max-w-[260px]">{{ currentScene.description }}</p>
          </div>
        </div>
      </div>


      <div v-else-if="isFinished && !isFinishing" class="flex flex-col items-center gap-5 py-16">
        <div class="text-5xl animate-bounce">✨</div>
        <h2 class="font-heading text-primary text-[1.3rem]">Профиль готов!</h2>
        <p class="font-body font-light text-primary-light text-[0.85rem]">Переходим к результатам…</p>
      </div>


      <div v-else-if="vibeStore.loading" class="flex flex-col items-center gap-4 py-16">
        <Loader2 class="w-8 h-8 text-accent-dark animate-spin" />
        <p class="font-body text-primary-light text-[0.85rem]">Загружаем сцены…</p>
      </div>


      <div v-if="currentScene && !isFinished && !isFinishing" class="flex items-center justify-center gap-8">
        <button
          class="swipe-btn rounded-full bg-white/80 border-2 border-red-500/20 flex items-center justify-center transition-all duration-200 hover:bg-red-500/10 hover:scale-110 hover:border-red-500/40 active:scale-95 cursor-pointer shadow-lg shadow-red-500/5"
          @click="handleButtonSwipe('left')"
        >
          <X class="w-8 h-8 text-red-500" />
        </button>

        <button
          class="swipe-btn rounded-full bg-white/80 border-2 border-accent/30 flex items-center justify-center transition-all duration-200 hover:bg-accent/10 hover:scale-110 hover:border-accent/50 active:scale-95 cursor-pointer shadow-lg shadow-accent/10"
          @click="handleButtonSwipe('right')"
        >
          <Heart class="w-8 h-8 text-accent-dark" />
        </button>
      </div>


      <p v-if="currentScene && !isFinished && !isFinishing" class="font-body font-light text-primary-light text-[0.72rem] mt-5">
        Перетаскивай карточку или нажимай кнопки
      </p>
    </div>
  </div>
</template>

<style scoped>
.swipe-btn {
  width: 4.5rem;
  height: 4.5rem;
  backdrop-filter: blur(8px);
}
</style>
