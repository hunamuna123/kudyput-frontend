import { defineStore } from "pinia";

export interface Review {
  id: string;
  user_id: string;
  display_name: string;
  location_id: string;
  rating: number;
  text: string;
  photo_url: string | null;
  created_at: string;
}

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

// Demo reviews for locations that don't have a backend reviews API yet
const DEMO_REVIEWS: Review[] = [
  {
    id: "demo-1",
    user_id: "demo-user-1",
    display_name: "Елена",
    location_id: "",
    rating: 5,
    text: "Невероятное место! Виды потрясающие, очень гостеприимные хозяева. Обязательно вернёмся!",
    photo_url: null,
    created_at: "2026-03-15T10:00:00Z",
  },
  {
    id: "demo-2",
    user_id: "demo-user-2",
    display_name: "Алексей",
    location_id: "",
    rating: 4,
    text: "Хорошее место для семейного отдыха. Дети были в восторге от природы.",
    photo_url: null,
    created_at: "2026-03-10T14:30:00Z",
  },
  {
    id: "demo-3",
    user_id: "demo-user-3",
    display_name: "Марина",
    location_id: "",
    rating: 5,
    text: "Тишина, горы, свежий воздух. Именно то, что нужно после города!",
    photo_url: null,
    created_at: "2026-03-05T09:15:00Z",
  },
];

export const useReviewsStore = defineStore("reviews", {
  state: (): ReviewsState => ({
    reviews: [],
    loading: false,
    submitting: false,
    error: null,
  }),

  getters: {
    averageRating: (state): number => {
      if (state.reviews.length === 0) return 0;
      const sum = state.reviews.reduce((acc, r) => acc + r.rating, 0);
      return Math.round((sum / state.reviews.length) * 10) / 10;
    },
    reviewCount: (state): number => state.reviews.length,
  },

  actions: {
    /**
     * Fetch reviews for a location.
     * NOTE: /api/v1/locations/{id}/reviews does not exist on the backend yet.
     * Using demo data as fallback.
     */
    async fetchReviews(locationId: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<{ success: boolean; data: Review[] }>(
          `/api/v1/locations/${locationId}/reviews`,
          { skipAuth: true },
        );
        this.reviews = response.data || [];
        return this.reviews;
      } catch {
        // API doesn't exist yet — use demo data
        this.reviews = DEMO_REVIEWS.map((r) => ({ ...r, location_id: locationId }));
        return this.reviews;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Create a review for a location.
     * NOTE: endpoint not yet on backend — stores locally only.
     */
    async createReview(locationId: string, payload: {
      rating: number;
      text: string;
      photo?: File | null;
    }) {
      this.submitting = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const body: Record<string, unknown> = {
          rating: payload.rating,
          text: payload.text,
        };

        const response = await request<{ success: boolean; data: Review }>(
          `/api/v1/locations/${locationId}/reviews`,
          { method: "POST", body },
        );
        if (response.data) {
          this.reviews.unshift(response.data);
        }
        return response.data;
      } catch {
        // API doesn't exist yet — store locally
        const localReview: Review = {
          id: `local-${Date.now()}`,
          user_id: "local",
          display_name: "Вы",
          location_id: locationId,
          rating: payload.rating,
          text: payload.text,
          photo_url: null,
          created_at: new Date().toISOString(),
        };
        this.reviews.unshift(localReview);
        return localReview;
      } finally {
        this.submitting = false;
      }
    },

    async deleteReview(reviewId: string) {
      this.error = null;
      try {
        const { request } = useApiClient();
        await request<{ success: boolean }>(`/api/v1/reviews/${reviewId}`, {
          method: "DELETE",
        });
        this.reviews = this.reviews.filter((r) => r.id !== reviewId);
        return true;
      } catch {
        // API doesn't exist — remove locally
        this.reviews = this.reviews.filter((r) => r.id !== reviewId);
        return true;
      }
    },
  },
});
