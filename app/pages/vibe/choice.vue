<script setup lang="ts">
import { Mic, Sparkles, ArrowRight } from "lucide-vue-next";

useHead({
  title: "Создаём ваш профиль - КудыТуды",
  meta: [
    { name: "description", content: "Выберите способ профилирования: свайп-карточки или голосовой ввод" },
  ],
});

const selectedMethod = ref<"swipe" | "voice" | null>(null);

function go(method: "swipe" | "voice") {
  selectedMethod.value = method;
  setTimeout(() => {
    navigateTo(method === "swipe" ? "/vibe/swipe" : "/vibe/voice");
  }, 400);
}
</script>

<template>
  <div class="min-h-screen bg-cream-light flex flex-col items-center justify-center relative overflow-hidden px-5 py-12">

    <div class="absolute w-[600px] h-[600px] rounded-full bg-accent/10 -top-32 right-[-5%] blur-[140px] pointer-events-none animate-pulse"></div>
    <div class="absolute w-[400px] h-[400px] rounded-full bg-primary/5 -bottom-20 left-[5%] blur-[100px] pointer-events-none"></div>
    <div class="absolute w-[200px] h-[200px] rounded-full bg-accent/6 top-1/2 left-1/3 blur-[80px] pointer-events-none"></div>

    <div class="relative z-10 max-w-xl w-full text-center flex flex-col items-center">

      <div class="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mb-6 choice-float">
        <Sparkles class="w-9 h-9 text-accent-dark" />
      </div>

      <span class="inline-block font-body font-bold text-[0.65rem] tracking-[0.14em] uppercase text-accent-dark bg-accent/10 px-4 py-1.5 rounded-full mb-5">
        Добро пожаловать
      </span>

      <h1 class="font-heading text-primary mb-3 leading-[1.2]" style="font-size: clamp(1.3rem, 4vw, 2.2rem);">
        Давай <span class="text-accent">узнаем тебя</span>
      </h1>
      <p class="font-body font-light text-primary-light text-[0.88rem] leading-relaxed max-w-sm mx-auto mb-10">
        Выбери способ — и ИИ подберёт идеальные места по твоему настроению. Это займёт меньше минуты.
      </p>


      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-lg">

        <button
          class="group relative flex flex-col items-center gap-5 p-8 bg-cream/40 border rounded-3xl cursor-pointer transition-all duration-400 text-left overflow-hidden"
          :class="selectedMethod === 'swipe'
            ? 'border-accent bg-accent/10 scale-[0.97] shadow-[0_8px_40px_rgba(164,190,79,0.2)]'
            : 'border-cream/50 hover:-translate-y-2 hover:shadow-xl hover:border-accent/30 hover:bg-cream/60'"
          @click="go('swipe')"
        >
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>


          <div class="relative w-16 h-16">

            <div class="absolute w-12 h-16 rounded-2xl bg-primary/8 transform rotate-[-8deg] translate-x-1 top-0"></div>
            <div class="absolute w-12 h-16 rounded-2xl bg-accent/15 transform rotate-[4deg] translate-x-3 top-0"></div>
            <div class="absolute w-12 h-16 rounded-2xl bg-accent/30 border border-accent/40 flex items-center justify-center translate-x-2 top-0 group-hover:rotate-[8deg] transition-transform duration-300">
              <span class="text-xl">✨</span>
            </div>
          </div>

          <div class="text-center">
            <h2 class="font-heading text-primary text-[1.05rem] mb-1.5">Свайп-карточки</h2>
            <p class="font-body font-light text-primary-light text-[0.78rem] leading-relaxed">
              Как в Тиндере — свайпай вправо если нравится, влево если нет. Быстро и весело!
            </p>
          </div>

          <span class="inline-flex items-center gap-1 font-body font-bold text-[0.72rem] text-accent-dark bg-accent/10 rounded-full px-3 py-1.5 group-hover:bg-accent/20 transition-colors">
            6 карточек · ~30 сек
            <ArrowRight class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>


        <button
          class="group relative flex flex-col items-center gap-5 p-8 bg-cream/40 border rounded-3xl cursor-pointer transition-all duration-400 text-left overflow-hidden"
          :class="selectedMethod === 'voice'
            ? 'border-accent bg-accent/10 scale-[0.97] shadow-[0_8px_40px_rgba(164,190,79,0.2)]'
            : 'border-cream/50 hover:-translate-y-2 hover:shadow-xl hover:border-accent/30 hover:bg-cream/60'"
          @click="go('voice')"
        >
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right"></div>

          <div class="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors group-hover:scale-110 duration-300">
            <Mic class="w-7 h-7 text-accent-dark" />
          </div>

          <div class="text-center">
            <h2 class="font-heading text-primary text-[1.05rem] mb-1.5">Голосовой ввод</h2>
            <p class="font-body font-light text-primary-light text-[0.78rem] leading-relaxed">
              Расскажи, чего хочешь — ИИ поймёт настроение и подберёт идеальные места.
            </p>
          </div>

          <span class="inline-flex items-center gap-1 font-body font-bold text-[0.72rem] text-accent-dark bg-accent/10 rounded-full px-3 py-1.5 group-hover:bg-accent/20 transition-colors">
            Свободный рассказ · ~1 мин
            <ArrowRight class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      </div>


      <NuxtLink to="/dashboard" class="font-body text-[0.75rem] text-primary-light no-underline mt-8 hover:text-primary transition-colors">
        Пропустить и перейти в дашборд →
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
@keyframes choice-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.choice-float {
  animation: choice-float 3s ease-in-out infinite;
}
</style>
