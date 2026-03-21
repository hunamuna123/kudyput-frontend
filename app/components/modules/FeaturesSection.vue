<script setup lang="ts">
interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '🎙',
    title: 'Расскажи',
    description: 'Скажи в микрофон, чего хочешь — ИИ создаст твой уникальный вайб-паспорт.',
  },
  {
    icon: '🗺',
    title: 'Исследуй',
    description: 'Погрузись в 3D-карту Кубани с живой погодой и фотореалистичными локациями.',
  },
  {
    icon: '🚗',
    title: 'Поехали',
    description: 'AI-аудиогид ведёт в пути, перестраивает маршрут и рассказывает легенды.',
  },
];
</script>

<template>
  <section id="about" class="py-24 md:py-32">
    <div class="container">
      <div class="text-left mb-14">
        <span class="inline-block font-body font-bold text-[0.65rem] tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-4 py-1.5 rounded-full mb-4">
          Как это работает
        </span>
        <h2 class="font-heading text-primary leading-[1.3]" style="font-size: clamp(1.15rem, 2.5vw, 1.8rem);">
          Три шага до путешествия
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <article
          v-for="(f, i) in features"
          :key="i"
          class="group bg-white/40 border border-accent/40 rounded-3xl p-8 md:p-10 text-left transition-all duration-350 hover:-translate-y-1.5 hover:shadow-xl hover:border-accent/20 hover:bg-white/60"
        >
          <span class="text-3xl block mb-5">{{ f.icon }}</span>
          <span class="font-body font-bold text-[0.6rem] tracking-[0.14em] uppercase text-accent-dark block mb-2">
            Шаг {{ i + 1 }}
          </span>
          <h3 class="font-heading text-primary text-[1rem] leading-snug mb-3">{{ f.title }}</h3>
          <p class="font-body font-light text-primary-light text-[0.82rem] leading-relaxed">{{ f.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
