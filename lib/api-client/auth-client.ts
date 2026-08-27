import {
  AuthStorageKeys,
  RESTAURANT_STORAGE_KEYS,
  PARTNER_STORAGE_KEYS,
  CUSTOMER_STORAGE_KEYS,
} from "./storage-keys";
import { API_BASE_URL } from "@/lib/constants/api";

// Refresh slightly before the token actually dies, so a request issued now
// does not arrive after it has expired.
const EXPIRY_SKEW_SECONDS = 60;

/** Seconds until this JWT expires, or null if it has no readable `exp`. */
const secondsUntilExpiry = (token: string): number | null => {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };
    if (typeof exp !== "number") return null;
    return exp - Math.floor(Date.now() / 1000);
  } catch {
    return null;
  }
};

// Build an authenticated client bound to a specific localStorage key set.
// Each instance owns its own refresh state, so refreshes in one portal
// never block or overwrite another portal's session — and, within one portal,
// `fetchWithAuth` and `ensureFreshToken` share it, because the backend rotates
// refresh tokens and two independent refreshes would invalidate each other.
export const createAuthClient = (keys: AuthStorageKeys) => {
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

  const clearSession = () => {
    localStorage.removeItem(keys.accessToken);
    localStorage.removeItem(keys.refreshToken);
    localStorage.removeItem(keys.user);
  };

  /**
   * Rotates the token pair. Shared by the 401 retry path and by
   * `ensureFreshToken`, so only ever one rotation is in flight.
   */
  const refreshTokens = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem(keys.refreshToken);
    if (!refreshToken) {
      clearSession();
      return null;
    }

    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => (token as string | null) ?? null);
    }

    isRefreshing = true;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!response.ok) throw new Error("Token refresh failed");

      const { access_token, refresh_token } = await response.json();
      localStorage.setItem(keys.accessToken, access_token);
      localStorage.setItem(keys.refreshToken, refresh_token);

      processQueue(null, access_token);
      return access_token as string;
    } catch (error) {
      processQueue(error, null);
      clearSession();
      return null;
    } finally {
      isRefreshing = false;
    }
  };

  /**
   * A token that will still be valid when it lands, or null when nobody is
   * signed in. Refreshes on demand, so a caller that only needs a token never
   * has to make a throwaway request to trigger the 401 path.
   */
  const ensureFreshToken = async (): Promise<string | null> => {
    if (!localStorage.getItem(keys.refreshToken)) return null;

    const token = localStorage.getItem(keys.accessToken);
    if (token) {
      const remaining = secondsUntilExpiry(token);
      // An unreadable expiry is treated as expired: refreshing costs one
      // request, while guessing wrong costs a silent 401 the caller cannot see.
      if (remaining !== null && remaining > EXPIRY_SKEW_SECONDS) return token;
    }

    return refreshTokens();
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

      // One shared rotation: `refreshTokens` queues concurrent callers and is
      // the same path `ensureFreshToken` uses, so the two can never rotate the
      // refresh token out from under each other.
      const accessToken = await refreshTokens();
      if (!accessToken) return response;

      return fetchWithAuth(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
        _retry: true,
      } as any);
    }

    return response;
  };

  return { fetchWithAuth, ensureFreshToken };
};

// Historical name and signature, kept so existing callers are untouched.
export const createFetchWithAuth = (keys: AuthStorageKeys) =>
  createAuthClient(keys).fetchWithAuth;

// Restaurant portal keeps the historical import name/signature.
export const fetchWithAuth = createFetchWithAuth(RESTAURANT_STORAGE_KEYS);

// Partner (coworking) portal uses its own isolated key set.
export const fetchWithAuthPartner = createFetchWithAuth(PARTNER_STORAGE_KEYS);

// Catering customer accounts. One instance, so the widget's token provider and
// the customer's own requests never race each other's refresh.
const customerAuth = createAuthClient(CUSTOMER_STORAGE_KEYS);
export const fetchWithAuthCustomer = customerAuth.fetchWithAuth;
export const ensureFreshCustomerToken = customerAuth.ensureFreshToken;

export { API_BASE_URL };
export type { AuthStorageKeys };
