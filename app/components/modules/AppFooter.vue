<script setup lang="ts">
const year = new Date().getFullYear();

const links = [
  { label: 'Начать', href: '/start' },
  { label: 'Локации', href: '/dashboard/locations' },
  { label: 'Для Бизнесменов', href: '/host' },
  { label: 'Войти', href: '/auth/login' },
] as const;
</script>

<template>
  <footer class="bg-primary rounded-t-[28px] pt-10 pb-5 px-6">
    <div class="container">
      <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-6 mb-6">
        <div>
          <span class="font-body font-bold text-white text-base block mb-1.5">КудыТуды</span>
          <p class="font-body font-light text-white/40 text-[0.78rem] leading-relaxed">
            Персональные маршруты<br/>Краснодарского края
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="font-body font-bold text-[0.58rem] tracking-[0.12em] uppercase text-accent mb-0.5">Навигация</span>
          <NuxtLink
            v-for="l in links"
            :key="l.label"
            :to="l.href"
            class="font-body font-light text-white/50 text-[0.78rem] no-underline hover:text-white transition-colors duration-200"
          >
            {{ l.label }}
          </NuxtLink>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="font-body font-bold text-[0.58rem] tracking-[0.12em] uppercase text-accent mb-0.5">Контакты</span>
          <a href="mailto:hello@kudytudy.ru" class="font-body font-light text-white/50 text-[0.78rem] no-underline hover:text-white transition-colors duration-200">
            hello@kudytudy.ru
          </a>
          <span class="font-body font-light text-white/50 text-[0.78rem]">Краснодар, Россия</span>
        </div>
      </div>

      <div class="h-px bg-white/10 border border-accent/40 mb-4"></div>
      <p class="font-body font-light text-white/25 text-[0.68rem] text-center">
        &copy; {{ year }} КудыТуды. Все права защищены.
      </p>
    </div>
  </footer>
</template>
