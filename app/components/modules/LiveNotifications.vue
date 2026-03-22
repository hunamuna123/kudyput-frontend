<script setup lang="ts">
import { Bell, X, CalendarCheck, Star, Users, CloudRain } from "lucide-vue-next";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  timestamp: number;
}

const notifications = ref<Notification[]>([]);
const MAX_VISIBLE = 3;
const AUTO_DISMISS = 5000;

const iconMap: Record<string, typeof Bell> = {
  booking_confirmed: CalendarCheck,
  new_review: Star,
  new_member: Users,
  weather_alert: CloudRain,
};

const emojiMap: Record<string, string> = {
  booking_confirmed: "✅",
  booking_rejected: "❌",
  new_review: "⭐",
  new_member: "👋",
  weather_alert: "🌧",
  notification: "🔔",
};

function addNotification(type: string, title: string, message: string) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const notif: Notification = {
    id,
    type,
    title,
    message,
    icon: emojiMap[type] || "🔔",
    timestamp: Date.now(),
  };
  notifications.value.unshift(notif);

  // Keep max visible
  if (notifications.value.length > MAX_VISIBLE) {
    notifications.value = notifications.value.slice(0, MAX_VISIBLE);
  }

  // Auto-dismiss
  setTimeout(() => dismiss(id), AUTO_DISMISS);
}

function dismiss(id: string) {
  notifications.value = notifications.value.filter((n) => n.id !== id);
}

onMounted(() => {
  if (import.meta.server) return;
  const ws = useWebSocket();
  ws.on("*", (event) => {
    const data = event.data as Record<string, string>;
    const title = data.title || event.type;
    const message = data.message || "";
    addNotification(event.type, title, message);
  });
  ws.connect("notifications");
});

// Expose for direct usage
defineExpose({ addNotification });
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <TransitionGroup name="notif">
        <div
          v-for="notif in notifications"
          :key="notif.id"
          class="flex items-start gap-3 px-4 py-3 bg-white/95 backdrop-blur-md border border-primary/10 rounded-2xl shadow-xl pointer-events-auto transition-all duration-300 hover:shadow-2xl"
        >
          <span class="text-xl shrink-0 mt-0.5">{{ notif.icon }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-body font-bold text-sm text-primary truncate">{{ notif.title }}</p>
            <p class="font-body text-xs text-primary-light line-clamp-2">{{ notif.message }}</p>
          </div>
          <button
            class="w-6 h-6 rounded-full hover:bg-primary/8 flex items-center justify-center shrink-0 cursor-pointer transition-colors bg-transparent border-none"
            @click="dismiss(notif.id)"
          >
            <X class="w-3.5 h-3.5 text-primary-light" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notif-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.notif-leave-active {
  transition: all 0.3s ease-in;
}
.notif-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}
.notif-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}
.notif-move {
  transition: transform 0.3s ease;
}
</style>
