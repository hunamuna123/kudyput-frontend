import { defineStore } from "pinia";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: "tourist" | "host" | "b2g_admin";
  karma: number;
  vibe_vector_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: number;
  refresh_token_expires_at: number;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    tokens: TokenPair;
    user: UserProfile;
  };
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.accessToken && !!state.user,
    userName: (state): string => state.user?.display_name || state.user?.email || "",
    userRole: (state): string => state.user?.role || "tourist",
  },

  actions: {
    restoreSession() {
      if (import.meta.server) return;
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const expiresAt = Number(localStorage.getItem("access_token_expires_at") || 0);

      if (!accessToken || !refreshToken) return;

      const now = Math.floor(Date.now() / 1000);
      if (expiresAt > 0 && expiresAt < now) {
        this.accessToken = null;
        this.refreshToken = refreshToken;
        return;
      }

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      // Restore cached user profile
      const cachedUser = localStorage.getItem("auth_user");
      if (cachedUser && !this.user) {
        try {
          this.user = JSON.parse(cachedUser);
        } catch {
          localStorage.removeItem("auth_user");
        }
      }
    },

    persistTokens(tokens: TokenPair) {
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      const { setTokens } = useApiClient();
      setTokens(
        tokens.access_token,
        tokens.refresh_token,
        tokens.access_token_expires_at,
        tokens.refresh_token_expires_at,
      );
    },

    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const response = await request<AuthResponse>("/api/v1/auth/login", {
          method: "POST",
          body: { email, password },
          skipAuth: true,
        });
        this.persistTokens(response.data.tokens);
        this.user = response.data.user;
        if (import.meta.client) localStorage.setItem("auth_user", JSON.stringify(this.user));
        return true;
      } catch (err: unknown) {
        const apiErr = err as { message?: string; status?: number };
        if (apiErr.status === 401) {
          this.error = "Неверный email или пароль";
        } else {
          this.error = apiErr.message || "Ошибка авторизации";
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    async register(email: string, password: string, displayName?: string, role?: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const body: Record<string, unknown> = { email, password };
        if (displayName) body.display_name = displayName;
        if (role) body.role = role;

        const response = await request<AuthResponse>("/api/v1/auth/register", {
          method: "POST",
          body,
          skipAuth: true,
        });
        this.persistTokens(response.data.tokens);
        this.user = response.data.user;
        if (import.meta.client) localStorage.setItem("auth_user", JSON.stringify(this.user));
        return true;
      } catch (err: unknown) {
        const apiErr = err as { message?: string; status?: number };
        if (apiErr.status === 409) {
          this.error = "Пользователь с таким email уже существует";
        } else if (apiErr.status === 400) {
          this.error = "Некорректные данные. Проверьте email и пароль (мин. 8 символов)";
        } else {
          this.error = apiErr.message || "Ошибка регистрации";
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      if (!this.accessToken) return;
      try {
        const { request } = useApiClient();
        const profile = await request<UserProfile>("/api/v1/profile/me");
        this.user = profile;
        if (import.meta.client) localStorage.setItem("auth_user", JSON.stringify(this.user));
      } catch {
        this.user = null;
      }
    },

    async updateProfile(displayName: string) {
      this.loading = true;
      this.error = null;
      try {
        const { request } = useApiClient();
        const profile = await request<UserProfile>("/api/v1/profile/me", {
          method: "PUT",
          body: { display_name: displayName },
        });
        this.user = profile;
        return true;
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        this.error = apiErr.message || "Ошибка обновления профиля";
        return false;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      const { clearTokens } = useApiClient();
      clearTokens();
      if (import.meta.client) localStorage.removeItem("auth_user");
      navigateTo("/auth/login");
    },
  },
});
