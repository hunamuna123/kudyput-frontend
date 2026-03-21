<script setup lang="ts">
import { Home, Map, Sparkles, User } from "lucide-vue-next";
import { useAuthStore } from "~~/store/auth";

const route = useRoute();
const authStore = useAuthStore();

onMounted(() => {
  authStore.restoreSession();
});

interface NavTab {
  label: string;
  icon: typeof Home;
  to: string;
}

const tabs: NavTab[] = [
  { label: "Главная", icon: Home, to: "/" },
  { label: "Начать", icon: Sparkles, to: "/start" },
  { label: "Карта", icon: Map, to: "/map" },
  { label: "Профиль", icon: User, to: "/dashboard/profile" },
];

const isLanding = computed(() => route.path === "/");

function isActive(path: string): boolean {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
}
</script>

<template>
  <nav v-if="!isLanding" class="fixed bottom-0 left-0 right-0 z-[1000] px-2.5 pb-1.5 md:hidden">
    <div class="flex items-center justify-around bg-white/92 border border-primary/8 rounded-[24px] px-1 py-1.5 shadow-[0_-4px_20px_rgba(40,90,113,0.07)] backdrop-blur-2xl">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-col items-center gap-0.5 no-underline px-1.5 py-1 min-w-12 transition-all duration-200"
      >
        <div
          class="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-250"
          :class="isActive(tab.to) ? 'bg-primary shadow-[0_3px_12px_rgba(40,90,113,0.2)]' : ''"
        >
          <component
            :is="tab.icon"
            class="w-[18px] h-[18px] transition-colors duration-200"
            :class="isActive(tab.to) ? 'text-white' : 'text-primary-light'"
          />
        </div>
        <span
          class="font-body text-[0.58rem] font-bold whitespace-nowrap transition-colors duration-200"
          :class="isActive(tab.to) ? 'text-primary' : 'text-primary-light'"
        >
          {{ tab.label }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
