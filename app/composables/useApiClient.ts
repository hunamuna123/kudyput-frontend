interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown> | FormData;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

interface ApiError {
  status: number;
  message: string;
  error?: string;
}

export function useApiClient() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase as string;

  function getAccessToken(): string | null {
    if (import.meta.server) return null;
    return localStorage.getItem("access_token");
  }

  function getRefreshToken(): string | null {
    if (import.meta.server) return null;
    return localStorage.getItem("refresh_token");
  }

  function setTokens(access: string, refresh: string, accessExp: number, refreshExp: number) {
    if (import.meta.server) return;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("access_token_expires_at", String(accessExp));
    localStorage.setItem("refresh_token_expires_at", String(refreshExp));
  }

  function clearTokens() {
    if (import.meta.server) return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token_expires_at");
    localStorage.removeItem("refresh_token_expires_at");
  }

  async function refreshTokens(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await $fetch<{
        success: boolean;
        data: {
          tokens: {
            access_token: string;
            refresh_token: string;
            access_token_expires_at: number;
            refresh_token_expires_at: number;
          };
        };
      }>(`${baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        body: { refresh_token: refreshToken },
      });

      if (response.success && response.data?.tokens) {
        const t = response.data.tokens;
        setTokens(t.access_token, t.refresh_token, t.access_token_expires_at, t.refresh_token_expires_at);
        return true;
      }
      return false;
    } catch {
      clearTokens();
      return false;
    }
  }

  async function request<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    const { method = "GET", body, query, headers = {}, skipAuth = false } = options;

    if (!skipAuth) {
      const token = getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const fetchOptions: Record<string, unknown> = {
      method,
      headers,
    };

    if (body) {
      if (body instanceof FormData) {
        fetchOptions.body = body;
      } else {
        fetchOptions.body = body;
        if (!headers["Content-Type"]) {
          headers["Content-Type"] = "application/json";
        }
      }
    }

    if (query) {
      const cleaned: Record<string, string> = {};
      for (const [key, val] of Object.entries(query)) {
        if (val !== undefined && val !== null) {
          cleaned[key] = String(val);
        }
      }
      fetchOptions.query = cleaned;
    }

    try {
      return await $fetch<T>(`${baseUrl}${endpoint}`, fetchOptions);
    } catch (err: unknown) {
      const fetchErr = err as { status?: number; data?: { message?: string; error?: string } };

      if (fetchErr.status === 401 && !skipAuth) {
        const refreshed = await refreshTokens();
        if (refreshed) {
          const newToken = getAccessToken();
          if (newToken) {
            headers["Authorization"] = `Bearer ${newToken}`;
          }
          return await $fetch<T>(`${baseUrl}${endpoint}`, fetchOptions);
        } else {
          clearTokens();
          if (import.meta.client) {
            navigateTo("/auth/login");
          }
        }
      }

      const apiError: ApiError = {
        status: fetchErr.status || 500,
        message: fetchErr.data?.message || "Unknown error",
        error: fetchErr.data?.error,
      };
      throw apiError;
    }
  }

  return {
    request,
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    refreshTokens,
  };
}
