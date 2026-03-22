<script setup lang="ts">
import {
  Map, Sparkles, Navigation, User, CalendarCheck,
  LayoutGrid, Heart, Compass, Route, MapPin, X, Briefcase
} from "lucide-vue-next";
import { useAuthStore } from "~~/store/auth";

const route = useRoute();
const authStore = useAuthStore();
const panelOpen = ref(false);

onMounted(() => {
  authStore.restoreSession();
});

interface NavTab {
  label: string;
  icon: typeof Map;
  to: string;
}

const tabs = computed<NavTab[]>(() => {
  const items: NavTab[] = [
    { label: "Начать", icon: Sparkles, to: "/start" },
    { label: "Карта", icon: Map, to: "/map" },
  ];
  if (authStore.isAuthenticated) {
    items.push({ label: "Брони", icon: CalendarCheck, to: "/profile/bookings" });
  } else {
    items.push({ label: "Маршрут", icon: Navigation, to: "/route" });
  }
  items.push({ label: "Профиль", icon: User, to: "/profile" });
  return items;
});

const panelLinks = computed(() => {
  const links = [
    { label: "Локации", icon: MapPin, to: "/map", desc: "Все места на карте" },
    { label: "Маршрут", icon: Route, to: "/route", desc: "Построить маршрут" },
    { label: "Начать", icon: Compass, to: "/start", desc: "Подбор по настроению" },
  ];
  if (authStore.isAuthenticated) {
    links.push(
      { label: "Избранное", icon: Heart, to: "/profile/favorites", desc: "Сохранённые места" },
      { label: "Поездки", icon: Briefcase, to: "/profile/trips", desc: "Мои поездки" },
      { label: "Брони", icon: CalendarCheck, to: "/profile/bookings", desc: "Мои бронирования" },
    );
  }
  return links;
});

const isLanding = computed(() => route.path === "/");

function isActive(path: string): boolean {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
}

function openPanel() {
  panelOpen.value = true;
}
function closePanel() {
  panelOpen.value = false;
}
function navigateAndClose() {
  panelOpen.value = false;
}
</script>

<template>
  <nav v-if="!isLanding" class="fixed bottom-0 left-0 right-0 z-[1000] px-2.5 pb-1.5 md:hidden">
    <div class="flex items-center justify-around bg-white/92 border border-primary/8 rounded-[24px] px-1 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-2xl">
      <!-- Menu button instead of Home -->
      <button
        class="flex flex-col items-center gap-0.5 px-1.5 py-1 min-w-12 bg-transparent border-none cursor-pointer transition-all duration-200"
        @click="openPanel"
      >
        <div
          class="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-250"
          :class="panelOpen ? 'bg-accent shadow-[0_3px_12px_rgba(164,190,79,0.35)]' : ''"
        >
          <LayoutGrid
            class="w-[18px] h-[18px] transition-colors duration-200"
            :class="panelOpen ? 'text-white' : 'text-primary-light'"
          />
        </div>
        <span
          class="font-body text-2xs font-bold whitespace-nowrap transition-colors duration-200"
          :class="panelOpen ? 'text-primary' : 'text-primary-light'"
        >
          Меню
        </span>
      </button>

      <!-- Regular tabs -->
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-col items-center gap-0.5 no-underline px-1.5 py-1 min-w-12 transition-all duration-200"
      >
        <div
          class="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-250"
          :class="isActive(tab.to) ? 'bg-accent shadow-[0_3px_12px_rgba(164,190,79,0.35)]' : ''"
        >
          <component
            :is="tab.icon"
            class="w-[18px] h-[18px] transition-colors duration-200"
            :class="isActive(tab.to) ? 'text-white' : 'text-primary-light'"
          />
        </div>
        <span
          class="font-body text-2xs font-bold whitespace-nowrap transition-colors duration-200"
          :class="isActive(tab.to) ? 'text-primary' : 'text-primary-light'"
        >
          {{ tab.label }}
        </span>
      </NuxtLink>
    </div>
  </nav>

  <!-- Overlay -->
  <Transition name="overlay-fade">
    <div
      v-if="panelOpen"
      class="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm md:hidden"
      @click="closePanel"
    />
  </Transition>

  <!-- Slide-up navigation panel -->
  <Transition name="panel-slide">
    <div
      v-if="panelOpen"
      class="fixed bottom-0 left-0 right-0 z-[1001] md:hidden"
    >
      <div class="mx-2.5 mb-[72px] bg-white/95 border border-accent/15 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden">
        <!-- Panel header -->
        <div class="flex items-center justify-between px-5 pt-4 pb-2">
          <span class="font-body font-bold text-primary text-lg">Навигация</span>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full bg-primary/5 border-none cursor-pointer transition-colors hover:bg-primary/10"
            @click="closePanel"
          >
            <X class="w-4 h-4 text-primary-light" />
          </button>
        </div>

        <!-- Panel links grid -->
        <div class="grid grid-cols-3 gap-2 px-4 pb-4">
          <NuxtLink
            v-for="link in panelLinks"
            :key="link.to"
            :to="link.to"
            class="flex flex-col items-center gap-1.5 p-3 rounded-2xl no-underline transition-all duration-200 active:scale-95"
            :class="isActive(link.to) ? 'bg-accent/12 border border-accent/20' : 'bg-primary/4 border border-transparent hover:bg-primary/8'"
            @click="navigateAndClose"
          >
            <div
              class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200"
              :class="isActive(link.to) ? 'bg-accent shadow-[0_2px_8px_rgba(164,190,79,0.3)]' : 'bg-white shadow-sm'"
            >
              <component
                :is="link.icon"
                class="w-[18px] h-[18px]"
                :class="isActive(link.to) ? 'text-white' : 'text-primary-light'"
              />
            </div>
            <span
              class="font-body text-xs font-bold text-center"
              :class="isActive(link.to) ? 'text-primary' : 'text-primary-light'"
            >
              {{ link.label }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.panel-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.panel-slide-leave-active {
  transition: all 0.2s ease-in;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
