<script setup lang="ts">
import { Users, Check, Loader2, ArrowLeft, AlertCircle } from "lucide-vue-next";
import { useAuthStore } from "~~/store/auth";

useHead({
  title: "Присоединиться - КудыТуды",
});

const route = useRoute();
const tripId = route.params.id as string;
const displayName = ref("");
const tags = ref<string[]>([]);
const loading = ref(false);
const joined = ref(false);
const error = ref<string | null>(null);

const authStore = useAuthStore();

const tagOptions = [
  "тишина", "вино", "горы", "гастрономия", "природа",
  "адреналин", "культура", "пляж", "кемпинг", "ферма",
];

function toggleTag(tag: string) {
  const idx = tags.value.indexOf(tag);
  if (idx >= 0) {
    tags.value.splice(idx, 1);
  } else {
    tags.value.push(tag);
  }
}

async function handleJoin() {
  if (!displayName.value.trim()) return;
  loading.value = true;
  error.value = null;

  try {
    const { request } = useApiClient();
    const inviteToken = route.query.token as string || "";

    await request(`/api/v1/trips/${tripId}/join`, {
      method: "POST",
      body: {
        invite_token: inviteToken,
        display_name: displayName.value.trim(),
        tags: tags.value,
      },
    });

    joined.value = true;
  } catch (err: unknown) {
    const apiErr = err as { message?: string; status?: number };
    if (apiErr.status === 404) {
      error.value = "Поездка не найдена или ссылка недействительна";
    } else if (apiErr.status === 403) {
      error.value = "Недействительный инвайт-токен";
    } else {
      error.value = apiErr.message || "Ошибка присоединения к поездке";
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  authStore.restoreSession();
});
</script>

<template>
  <div class="min-h-screen bg-white border border-accent/40 flex flex-col items-center justify-start relative overflow-hidden px-5 pt-8 pb-16">
    <div class="absolute w-[400px] h-[400px] rounded-full bg-accent/10 top-[-80px] right-[10%] blur-[120px] pointer-events-none"></div>

    <div class="relative z-10 max-w-md w-full text-center flex flex-col items-center">
      <NuxtLink to="/" class="font-body font-bold text-2xl text-primary no-underline mb-10 transition-colors hover:text-accent">
        КудыТуды
      </NuxtLink>


      <div v-if="joined" class="flex flex-col items-center gap-4 py-10 bg-white/50 border border-accent/40 rounded-3xl px-8 w-full">
        <div class="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <Check class="w-8 h-8 text-accent-dark" />
        </div>
        <h2 class="font-body font-bold text-primary text-2xl">Вы в команде!</h2>
        <p class="font-body font-light text-primary-light text-base max-w-xs">Теперь ваши предпочтения будут учтены при построении маршрута.</p>
        <NuxtLink
          to="/profile/trips"
          class="mt-2 font-body font-bold text-base text-white bg-accent rounded-2xl px-6 py-3 no-underline hover:bg-accent-dark transition-colors"
        >
          В панель управления
        </NuxtLink>
      </div>


      <div v-else class="flex flex-col items-center gap-4 w-full bg-white/50 border border-accent/40 rounded-3xl px-8 py-10">
        <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Users class="w-7 h-7 text-primary" />
        </div>
        <h2 class="font-body font-bold text-primary text-2xl">Присоединиться</h2>
        <p class="font-body font-light text-primary-light text-base max-w-xs">
          Вас пригласили в поездку. Укажите имя и выберите ваши интересы.
        </p>

        <form class="w-full max-w-xs flex flex-col gap-4 mt-2" @submit.prevent="handleJoin">
          <UiInput
            v-model="displayName"
            placeholder="Ваше имя"
            class="rounded-2xl px-4 py-3.5 font-body bg-white/25 border border-accent/40 focus-visible:ring-accent text-center"
          />


          <div class="flex flex-wrap gap-1.5 justify-center">
            <button
              v-for="tag in tagOptions"
              :key="tag"
              type="button"
              class="font-body text-sm px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer"
              :class="tags.includes(tag)
                ? 'bg-accent/20 border-accent/40 text-accent-dark font-bold'
                : 'bg-transparent text-primary-light hover:border-accent/30'"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>

          <UiAlert v-if="error" variant="destructive" class="rounded-2xl">
            <AlertCircle class="h-4 w-4" />
            <UiAlertDescription>{{ error }}</UiAlertDescription>
          </UiAlert>

          <UiButton
            type="submit"
            :disabled="!displayName.trim() || loading"
            class="w-full bg-accent hover:bg-accent-dark border-accent text-white font-body font-bold rounded-2xl py-3.5 text-md"
          >
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            <Check v-else class="w-4 h-4 mr-2" />
            Присоединиться
          </UiButton>
        </form>

        <p class="font-body text-sm text-primary-light opacity-50 mt-2">
          ID поездки: {{ tripId }}
        </p>
      </div>
    </div>
  </div>
</template>
