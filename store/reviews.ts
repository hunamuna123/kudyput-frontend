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
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка загрузки отзывов";
        return [];
      } finally {
        this.loading = false;
      }
    },

    async createReview(locationId: string, payload: {
      rating: number;
      text: string;
      photo?: File | null;
    }) {
      this.submitting = true;
      this.error = null;
      try {
        const { request } = useApiClient();

        let body: Record<string, unknown> | FormData;

        if (payload.photo) {
          const formData = new FormData();
          formData.append("rating", String(payload.rating));
          formData.append("text", payload.text);
          formData.append("photo", payload.photo);
          body = formData;
        } else {
          body = {
            rating: payload.rating,
            text: payload.text,
          };
        }

        const response = await request<{ success: boolean; data: Review }>(
          `/api/v1/locations/${locationId}/reviews`,
          {
            method: "POST",
            body: body as Record<string, unknown>,
          },
        );
        if (response.data) {
          this.reviews.unshift(response.data);
        }
        return response.data;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка отправки отзыва";
        return null;
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
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка удаления отзыва";
        return false;
      }
    },
  },
});
