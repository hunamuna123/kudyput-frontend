import { defineStore } from "pinia";

export interface Story {
  point_id: string;
  location_name: string;
  audio_url: string;
  story_text: string;
  duration_sec: number;
}

interface StoriesState {
  stories: Story[];
  loading: boolean;
  generating: boolean;
  error: string | null;
}

export const useStoriesStore = defineStore("stories", {
  state: (): StoriesState => ({
    stories: [],
    loading: false,
    generating: false,
    error: null,
  }),

  getters: {
    totalDuration: (state): number =>
      state.stories.reduce((sum, s) => sum + s.duration_sec, 0),

    hasStories: (state): boolean => state.stories.length > 0,
  },

  actions: {
    async generateStories(routeId: string) {
      this.generating = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        await request<{ success: boolean }>(`/api/v1/route/${routeId}/generate-stories`, {
          method: "POST",
        });
        return true;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка генерации аудиогида";
        return false;
      } finally {
        this.generating = false;
      }
    },

    async fetchStories(routeId: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: Story[] }>(
          `/api/v1/route/${routeId}/stories`,
        );
        this.stories = response.data || [];
        return this.stories;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки историй";
        return [];
      } finally {
        this.loading = false;
      }
    },

    clearStories() {
      this.stories = [];
      this.error = null;
    },
  },
});
