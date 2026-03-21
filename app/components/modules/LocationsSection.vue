<script setup lang="ts">
interface Location {
  name: string;
  category: string;
  image: string;
}

const locations: Location[] = [
  {
    name: 'Долина Лефкадия',
    category: 'Винодельня',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80',
  },
  {
    name: 'Гуамское ущелье',
    category: 'Горы',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  },
  {
    name: 'Побережье Геленджика',
    category: 'Море',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  },
  {
    name: 'Фермерские угодья',
    category: 'Ферма',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
  },
];
</script>

<template>
  <section id="locations" class="py-24 md:py-32">
    <div class="container">
      <div class="text-left mb-14">
        <span class="inline-block font-body font-bold text-[0.65rem] tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-4 py-1.5 rounded-full mb-4">
          Локации
        </span>
        <h2 class="font-heading text-primary leading-[1.3] mb-2" style="font-size: clamp(1.15rem, 2.5vw, 1.8rem);">
          Откройте Кубань
        </h2>
        <p class="font-body font-light text-primary-light text-[0.88rem]">Камерные места, которых нет в путеводителях</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="(l, i) in locations"
          :key="i"
          class="group relative rounded-3xl overflow-hidden aspect-[16/10] cursor-pointer"
        >
          <img
            :src="l.image"
            :alt="l.name"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-transparent to-transparent flex flex-col justify-end p-5">
            <span class="font-body font-bold text-[0.55rem] tracking-[0.12em] uppercase text-accent-light bg-accent/20 backdrop-blur-sm px-2.5 py-1 rounded-full self-start mb-1.5">
              {{ l.category }}
            </span>
            <span class="font-body font-bold text-white text-[0.95rem] leading-snug">{{ l.name }}</span>
          </div>
        </div>
      </div>

      <div class="text-left mt-10">
        <NuxtLink
          to="/map"
          class="inline-block font-body font-bold text-[0.82rem] text-primary bg-transparent border-2 border-primary/20 rounded-full px-7 py-3 cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:-translate-y-0.5 no-underline"
        >
          Смотреть все локации
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
