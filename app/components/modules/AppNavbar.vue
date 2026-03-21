<script setup lang="ts">
const navItems = [
  { label: 'Начать', to: '/start' },
  { label: 'Локации', to: '/dashboard/locations' },
  { label: 'Для хостов', to: '/host' },
] as const;

const isScrolled = ref(false);
const mobileOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <nav
    class="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-40px)] transition-all duration-300"
    style="max-width: 1140px;"
  >
    <div
      class="flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300"
      :class="isScrolled
        ? 'bg-cream-light/90 border-cream/60 shadow-lg backdrop-blur-2xl'
        : 'bg-cream-light/50 border-cream/30 shadow-sm backdrop-blur-xl'"
    >
      <NuxtLink to="/" class="font-body font-bold text-primary text-base tracking-wide mr-auto">
        КудыТуды
      </NuxtLink>

      <div class="hidden md:flex items-center gap-7 mr-3">
        <NuxtLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="font-body text-[0.82rem] font-light text-primary/70 hover:text-primary transition-colors duration-200 no-underline"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <NuxtLink
        to="/auth/login"
        class="hidden md:block font-body font-bold text-[0.8rem] text-white bg-accent border-none rounded-full px-5 py-2 cursor-pointer transition-all duration-250 hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-lg no-underline"
      >
        Войти
      </NuxtLink>

      <button
        class="flex md:hidden flex-col gap-1 bg-transparent border-none p-2 cursor-pointer"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="block w-[18px] h-0.5 bg-primary rounded-sm"></span>
        <span class="block w-[18px] h-0.5 bg-primary rounded-sm"></span>
        <span class="block w-[18px] h-0.5 bg-primary rounded-sm"></span>
      </button>
    </div>

    <Transition name="dropdown">
      <div
        v-if="mobileOpen"
        class="flex flex-col gap-1 mt-2 bg-cream-light/95 backdrop-blur-2xl rounded-2xl p-4 border border-cream/40 md:hidden"
      >
        <NuxtLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="font-body text-[0.9rem] font-light text-primary no-underline py-2"
          @click="mobileOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
        <NuxtLink
          to="/auth/login"
          class="mt-2 w-full font-body font-bold text-[0.82rem] text-white bg-accent rounded-full py-2.5 border-none cursor-pointer text-center no-underline block"
          @click="mobileOpen = false"
        >
          Войти
        </NuxtLink>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
