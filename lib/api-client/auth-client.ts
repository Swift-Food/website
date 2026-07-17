import {
  AuthStorageKeys,
  RESTAURANT_STORAGE_KEYS,
  PARTNER_STORAGE_KEYS,
} from "./storage-keys";
import { API_BASE_URL } from "@/lib/constants/api";

// Build an authenticated fetch bound to a specific localStorage key set.
// Each instance owns its own refresh state, so refreshes in one portal
// never block or overwrite another portal's session.
export const createFetchWithAuth = (keys: AuthStorageKeys) => {
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = localStorage.getItem(keys.accessToken);

    // Don't set Content-Type for FormData - let the browser set it with the boundary
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

      console.warn(`Rate limit exceeded. Retry after ${waitTime / 1000} seconds`);

      throw new Error(
        `Rate limit exceeded. Please try again in ${Math.ceil(
          waitTime / 1000
        )} seconds.`
      );
    }

    // If 401 and not already retrying, attempt refresh
    if (response.status === 401 && !(options as any)._retry) {
      if (url.includes("/auth/login") || url.includes("/auth/refresh")) {
        return response;
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          return fetchWithAuth(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
            _retry: true,
          } as any);
        });
      }

      isRefreshing = true;
      (options as any)._retry = true;

      const refreshToken = localStorage.getItem(keys.refreshToken);

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem(keys.accessToken);
        localStorage.removeItem(keys.refreshToken);
        localStorage.removeItem(keys.user);
        return response;
      }

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error("Token refresh failed");
        }

        const data = await refreshResponse.json();
        const { access_token, refresh_token: new_refresh_token } = data;

        localStorage.setItem(keys.accessToken, access_token);
        localStorage.setItem(keys.refreshToken, new_refresh_token);

        processQueue(null, access_token);
        isRefreshing = false;

        return fetchWithAuth(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${access_token}`,
          },
          _retry: true,
        } as any);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem(keys.accessToken);
        localStorage.removeItem(keys.refreshToken);
        localStorage.removeItem(keys.user);

        return response;
      }
    }

    return response;
  };

  return fetchWithAuth;
};

// Restaurant portal keeps the historical import name/signature.
export const fetchWithAuth = createFetchWithAuth(RESTAURANT_STORAGE_KEYS);

// Partner (coworking) portal uses its own isolated key set.
export const fetchWithAuthPartner = createFetchWithAuth(PARTNER_STORAGE_KEYS);

export { API_BASE_URL };
export type { AuthStorageKeys };
