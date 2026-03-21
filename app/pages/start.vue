<script setup lang="ts">
import { Mic, Map, Sparkles } from "lucide-vue-next";

useHead({
  title: "Начать путешествие - КудыТуды",
  meta: [
    { name: "description", content: "Выберите свой путь: свайп-карточки, голосовой ввод или ручной выбор на карте" },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-cream-light flex flex-col items-center justify-center relative overflow-hidden px-5">
    <div class="absolute w-[500px] h-[500px] rounded-full bg-accent/10 -top-20 right-[5%] blur-[120px] pointer-events-none animate-pulse"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 -bottom-16 left-[8%] blur-[100px] pointer-events-none"></div>

    <div class="relative z-10 max-w-3xl w-full text-center">
      <NuxtLink to="/" class="font-body font-bold text-[1.2rem] text-primary no-underline mb-10 block transition-colors hover:text-accent">
        КудыТуды
      </NuxtLink>

      <span class="inline-block font-body font-bold text-[0.65rem] tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-4 py-1.5 rounded-full mb-6">
        Выбери свой путь
      </span>

      <h1 class="font-heading text-primary mb-3 leading-[1.25]" style="font-size: clamp(1.4rem, 3.5vw, 2.5rem);">
        Как хочешь <span class="text-accent">начать</span>?
      </h1>
      <p class="font-body font-light text-primary-light text-[0.92rem] leading-relaxed max-w-md mx-auto mb-12">
        ИИ создаст персональный маршрут по твоему настроению, или ты можешь выбрать места на карте сам.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto">

        <NuxtLink
          to="/vibe/swipe"
          class="group flex flex-col items-center gap-4 p-8 bg-cream/40 border border-cream/50 rounded-3xl no-underline transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-accent/30 hover:bg-cream/60"
        >
          <div class="relative w-16 h-16">
            <div class="absolute w-10 h-14 rounded-xl bg-primary/8 transform rotate-[-8deg] translate-x-1 top-1"></div>
            <div class="absolute w-10 h-14 rounded-xl bg-accent/15 transform rotate-[4deg] translate-x-3 top-1"></div>
            <div class="absolute w-10 h-14 rounded-xl bg-accent/30 border border-accent/40 flex items-center justify-center translate-x-2 top-1 group-hover:rotate-[8deg] transition-transform duration-300">
              <Sparkles class="w-4 h-4 text-accent-dark" />
            </div>
          </div>
          <h2 class="font-heading text-primary text-[1rem]">✨ Свайп</h2>
          <p class="font-body font-light text-primary-light text-[0.78rem] leading-relaxed">
            Свайпай карточки как в Тиндере — быстро и весело.
          </p>
        </NuxtLink>


        <NuxtLink
          to="/vibe/voice"
          class="group flex flex-col items-center gap-4 p-8 bg-cream/40 border border-cream/50 rounded-3xl no-underline transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-accent/30 hover:bg-cream/60"
        >
          <div class="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
            <Mic class="w-7 h-7 text-accent-dark" />
          </div>
          <h2 class="font-heading text-primary text-[1rem]">🎤 Голос</h2>
          <p class="font-body font-light text-primary-light text-[0.78rem] leading-relaxed">
            Расскажи, чего хочешь — ИИ подберёт идеальные места.
          </p>
        </NuxtLink>


        <NuxtLink
          to="/dashboard/map"
          class="group flex flex-col items-center gap-4 p-8 bg-cream/40 border border-cream/50 rounded-3xl no-underline transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20 hover:bg-cream/60"
        >
          <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Map class="w-7 h-7 text-primary" />
          </div>
          <h2 class="font-heading text-primary text-[1rem]">🗺 Карта</h2>
          <p class="font-body font-light text-primary-light text-[0.78rem] leading-relaxed">
            Открой карту и выбери места по собственному вкусу.
          </p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
