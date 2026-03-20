<script setup lang="ts">
const year = new Date().getFullYear();

const links = [
  { label: 'Маршруты', href: '#routes' },
  { label: 'Локации', href: '#locations' },
  { label: 'О проекте', href: '#about' },
  { label: 'Для владельцев', href: '/host' },
] as const;
</script>

<template>
  <footer class="bg-primary rounded-t-[32px] pt-14 pb-7 px-8">
    <div class="container">
      <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10 mb-10">
        <div>
          <span class="font-body font-bold text-cream text-lg block mb-2">КудыТуды</span>
          <p class="font-body font-light text-cream/40 text-[0.82rem] leading-relaxed">
            Персональные маршруты<br/>Краснодарского края
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <span class="font-body font-bold text-[0.6rem] tracking-[0.12em] uppercase text-accent mb-1">Навигация</span>
          <a
            v-for="l in links"
            :key="l.label"
            :href="l.href"
            class="font-body font-light text-cream/50 text-[0.82rem] no-underline hover:text-cream transition-colors duration-200"
          >
            {{ l.label }}
          </a>
        </div>

        <div class="flex flex-col gap-2">
          <span class="font-body font-bold text-[0.6rem] tracking-[0.12em] uppercase text-accent mb-1">Контакты</span>
          <a href="mailto:hello@kudytudy.ru" class="font-body font-light text-cream/50 text-[0.82rem] no-underline hover:text-cream transition-colors duration-200">
            hello@kudytudy.ru
          </a>
          <span class="font-body font-light text-cream/50 text-[0.82rem]">Краснодар, Россия</span>
        </div>
      </div>

      <div class="h-px bg-cream/10 mb-5"></div>
      <p class="font-body font-light text-cream/25 text-[0.72rem] text-center">© {{ year }} КудыТуды. Все права защищены.</p>
    </div>
  </footer>
</template>
