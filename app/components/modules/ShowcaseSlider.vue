<script setup lang="ts">
interface Slide {
  image: string;
  title: string;
  location: string;
}

const slides: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    title: 'Горные тропы',
    location: 'Кавказский хребет',
  },
  {
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
    title: 'Виноградники',
    location: 'Долина Лефкадия',
  },
  {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    title: 'Побережье',
    location: 'Чёрное море',
  },
  {
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    title: 'Золотые поля',
    location: 'Кубанские степи',
  },
];

const currentSlide = ref(0);
const activeSlide = computed(() => slides[currentSlide.value]!);
let interval: ReturnType<typeof setInterval> | null = null;

const next = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const goTo = (i: number) => {
  currentSlide.value = i;
  resetInterval();
};

const resetInterval = () => {
  if (interval) clearInterval(interval);
  interval = setInterval(next, 4500);
};

onMounted(() => {
  resetInterval();
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container">
      <div class="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl">
        <TransitionGroup name="slide">
          <img
            v-for="(s, i) in slides"
            v-show="currentSlide === i"
            :key="s.image"
            :src="s.image"
            :alt="s.title"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </TransitionGroup>

        <div class="absolute inset-0 bg-gradient-to-t from-primary-dark/60 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10 pointer-events-none">
          <span class="font-body font-bold text-xs tracking-[0.12em] uppercase text-accent-light bg-accent/20 backdrop-blur-sm px-3 py-1 rounded-full self-start mb-2">
            {{ activeSlide.location }}
          </span>
          <span class="font-body font-bold text-white text-xl md:text-2xl leading-snug">
            {{ activeSlide.title }}
          </span>
        </div>

        <div class="absolute top-4 right-4 md:top-6 md:right-6 bg-primary-dark/50 backdrop-blur-md rounded-full px-3 py-1">
          <span class="font-body font-bold text-white text-sm">
            {{ String(currentSlide + 1).padStart(2, '0') }} / {{ String(slides.length).padStart(2, '0') }}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-2 mt-5">
        <button
          v-for="(_s, i) in slides"
          :key="i"
          class="relative h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none"
          :class="currentSlide === i ? 'w-8 bg-accent' : 'w-3 bg-primary/15 hover:bg-primary/25'"
          @click="goTo(i)"
        >
          <span
            v-if="currentSlide === i"
            class="absolute inset-0 rounded-full bg-accent-dark origin-left animate-[fill_4.5s_linear]"
          ></span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from {
  opacity: 0;
  transform: scale(1.05);
}
.slide-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
@keyframes fill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
</style>
