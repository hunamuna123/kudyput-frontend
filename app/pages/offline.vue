<script setup lang="ts">
import { WifiOff, MapPin, ArrowLeft } from "lucide-vue-next";
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
    <div class="absolute w-[400px] h-[400px] rounded-full bg-accent/6 top-[-80px] left-[20%] blur-[120px] pointer-events-none"></div>

    <div class="relative z-10 flex flex-col items-center gap-6 max-w-sm">
      <div class="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center">
        <WifiOff class="w-10 h-10 text-primary-light" />
      </div>

      <div>
        <h1 class="font-heading text-3xl text-primary mb-2">Нет подключения</h1>
        <p class="font-body text-base text-primary-light leading-relaxed">
          Эта страница недоступна офлайн. Попробуйте открыть ранее сохранённые маршруты или дождитесь подключения к сети.
        </p>
      </div>

      <div class="flex flex-col gap-3 w-full">
        <NuxtLink
          to="/map"
          class="flex items-center justify-center gap-2 font-body font-bold text-base text-white bg-accent rounded-2xl px-6 py-3.5 no-underline transition-all duration-200 hover:bg-accent-dark"
        >
          <MapPin class="w-4 h-4" />
          Открыть карту (кэш)
        </NuxtLink>
        <button
          class="flex items-center justify-center gap-2 font-body font-bold text-base text-primary-light bg-primary/5 rounded-2xl px-6 py-3.5 cursor-pointer transition-all duration-200 hover:bg-primary/10 border-none"
          @click="$router.back()"
        >
          <ArrowLeft class="w-4 h-4" />
          Назад
        </button>
      </div>

      <p class="font-body text-xs text-primary-light opacity-40 mt-4">
        КудыТуды v1.0 • PWA Offline
      </p>
    </div>
  </div>
</template>
