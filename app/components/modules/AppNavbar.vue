<script setup lang="ts">
import { useAuthStore } from "~~/store/auth";
import { User, LogOut } from "lucide-vue-next";

const authStore = useAuthStore();

const navItems = [
  { label: 'Начать', to: '/start' },
  { label: 'Карта', to: '/map' },
  { label: 'Маршрут', to: '/route' },
  { label: 'Локации', to: '/map' },
  { label: 'Для Бизнесменов', to: '/host' },
] as const;

const isScrolled = ref(false);
const mobileOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40;
};

onMounted(() => {
  authStore.restoreSession();
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <nav
    class="fixed top-3 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-32px)] transition-all duration-300"
    style="max-width: 1080px;"
  >
    <div
      class="flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all duration-300"
      :class="isScrolled
        ? 'bg-white/90 border border-accent/40 border-white/60 shadow-lg backdrop-blur-2xl'
        : 'bg-white/50 border-white/30 shadow-sm backdrop-blur-xl'"
    >
      <NuxtLink to="/" class="font-body font-bold text-primary text-[0.9rem] tracking-wide mr-auto">
        КудыТуды
      </NuxtLink>

      <div class="hidden md:flex items-center gap-5 mr-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="font-body text-[0.78rem] font-light text-primary/70 hover:text-primary transition-colors duration-200 no-underline"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <template v-if="authStore.isAuthenticated">
        <NuxtLink
          to="/profile"
          class="hidden md:flex items-center gap-1.5 font-body font-bold text-[0.76rem] text-primary bg-accent/15 border-none rounded-full px-3.5 py-1.5 cursor-pointer transition-all duration-250 hover:bg-accent/25 no-underline"
        >
          <User class="w-3.5 h-3.5 text-accent-dark" />
          {{ authStore.userName || 'Профиль' }}
        </NuxtLink>
      </template>
      <template v-else>
        <NuxtLink
          to="/auth/login"
          class="hidden md:block font-body font-bold text-[0.76rem] text-white bg-accent border-none rounded-full px-4 py-1.5 cursor-pointer transition-all duration-250 hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-lg no-underline"
        >
          Войти
        </NuxtLink>
      </template>

      <button
        class="flex md:hidden flex-col gap-1 bg-transparent border-none p-1.5 cursor-pointer"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="block w-[16px] h-0.5 bg-primary rounded-sm"></span>
        <span class="block w-[16px] h-0.5 bg-primary rounded-sm"></span>
        <span class="block w-[16px] h-0.5 bg-primary rounded-sm"></span>
      </button>
    </div>

    <Transition name="dropdown">
      <div
        v-if="mobileOpen"
        class="flex flex-col gap-0.5 mt-1.5 bg-white/95 border border-accent/40 backdrop-blur-2xl rounded-2xl p-3 md:hidden"
      >
        <NuxtLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="font-body text-[0.84rem] font-light text-primary no-underline py-1.5"
          @click="mobileOpen = false"
        >
          {{ item.label }}
        </NuxtLink>

        <template v-if="authStore.isAuthenticated">
          <NuxtLink
            to="/profile"
            class="mt-1.5 w-full font-body font-bold text-[0.78rem] text-primary bg-accent/15 rounded-full py-2 border-none text-center no-underline block"
            @click="mobileOpen = false"
          >
            {{ authStore.userName || 'Профиль' }}
          </NuxtLink>
          <button
            class="w-full font-body text-[0.74rem] text-red-500 bg-transparent border-none py-1.5 cursor-pointer"
            @click="authStore.logout(); mobileOpen = false"
          >
            Выйти
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/auth/login"
            class="mt-1.5 w-full font-body font-bold text-[0.78rem] text-white bg-accent rounded-full py-2 border-none cursor-pointer text-center no-underline block"
            @click="mobileOpen = false"
          >
            Войти
          </NuxtLink>
        </template>
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
