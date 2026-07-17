# Portal Auth Storage Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the restaurant and partner portals independent, namespaced localStorage auth key sets so their sessions never clobber each other.

**Architecture:** Convert the single global `fetchWithAuth` into a factory `createFetchWithAuth(keys)` whose refresh/queue state lives in a per-instance closure. Export a restaurant-bound `fetchWithAuth` (default, keeps all 17 restaurant importers unchanged) and a partner-bound `fetchWithAuthPartner` consumed only by `coworking.api.ts`. All key strings move into one `storage-keys.ts` module. Remove the partner hook's dual-write of plain keys and delete the dead duplicate client.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest 4 (`environment: "node"`, `include: ["lib/**/*.test.ts"]`).

## Global Constraints

- Backend base: `API_BASE_URL = "https://swiftfoods-32981ec7b5a4.herokuapp.com"` (unchanged, shared by both portals).
- Refresh endpoint is `${API_BASE_URL}/auth/refresh` for both portals (unchanged).
- Restaurant key set: `rest_access_token`, `rest_refresh_token`, `rest_user`.
- Partner key set: `cw_access_token`, `cw_refresh_token`, `cw_user`.
- Test files: co-located `<name>.test.ts`, under `lib/**` only, import `{ describe, it, expect, vi, beforeEach }` from `"vitest"`.
- Preserve all existing `fetchWithAuth` behavior: 401→refresh-and-retry, concurrent-request queueing, 429 handling, and skipping `Content-Type` for `FormData`.
- **No commits performed by the executor.** Per project rule, the user commits manually. Each task ends at "verify green", not at a commit.

---

### Task 1: Shared storage-keys module + factory-based auth client (with tests)

**Files:**
- Create: `lib/api-client/storage-keys.ts`
- Modify: `lib/api-client/auth-client.ts` (full rewrite of the module body)
- Test: `lib/api-client/auth-client.test.ts`

**Interfaces:**
- Produces:
  - `interface AuthStorageKeys { accessToken: string; refreshToken: string; user: string }`
  - `const RESTAURANT_STORAGE_KEYS: AuthStorageKeys` = `{ accessToken: "rest_access_token", refreshToken: "rest_refresh_token", user: "rest_user" }`
  - `const PARTNER_STORAGE_KEYS: AuthStorageKeys` = `{ accessToken: "cw_access_token", refreshToken: "cw_refresh_token", user: "cw_user" }`
  - `createFetchWithAuth(keys: AuthStorageKeys): (url: string, options?: RequestInit) => Promise<Response>`
  - `fetchWithAuth` — restaurant-bound instance (unchanged import name/signature)
  - `fetchWithAuthPartner` — partner-bound instance
  - `API_BASE_URL: string` (unchanged export)

- [ ] **Step 1: Create the storage-keys module**

`lib/api-client/storage-keys.ts`:

```ts
export interface AuthStorageKeys {
  accessToken: string;
  refreshToken: string;
  user: string;
}

export const RESTAURANT_STORAGE_KEYS: AuthStorageKeys = {
  accessToken: "rest_access_token",
  refreshToken: "rest_refresh_token",
  user: "rest_user",
};

export const PARTNER_STORAGE_KEYS: AuthStorageKeys = {
  accessToken: "cw_access_token",
  refreshToken: "cw_refresh_token",
  user: "cw_user",
};
```

- [ ] **Step 2: Write the failing tests**

`lib/api-client/auth-client.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createFetchWithAuth,
  API_BASE_URL,
  type AuthStorageKeys,
} from "./auth-client";

const REST: AuthStorageKeys = {
  accessToken: "rest_access_token",
  refreshToken: "rest_refresh_token",
  user: "rest_user",
};
const PARTNER: AuthStorageKeys = {
  accessToken: "cw_access_token",
  refreshToken: "cw_refresh_token",
  user: "cw_user",
};

function installLocalStorage() {
  const store = new Map<string, string>();
  const mock = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
  };
  (globalThis as any).localStorage = mock;
  return store;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("createFetchWithAuth", () => {
  it("attaches a Bearer header from the configured access-token key", async () => {
    const store = installLocalStorage();
    store.set(REST.accessToken, "rest-abc");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("ok", { status: 200 }));
    (globalThis as any).fetch = fetchMock;

    const fetchWithAuth = createFetchWithAuth(REST);
    await fetchWithAuth(`${API_BASE_URL}/restaurant/thing`);

    const [, opts] = fetchMock.mock.calls[0];
    expect((opts.headers as any).Authorization).toBe("Bearer rest-abc");
  });

  it("refreshes with the configured refresh key and writes new tokens back to the configured keys", async () => {
    const store = installLocalStorage();
    store.set(PARTNER.accessToken, "cw-old");
    store.set(PARTNER.refreshToken, "cw-refresh");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ access_token: "cw-new", refresh_token: "cw-new-refresh" }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    (globalThis as any).fetch = fetchMock;

    const fetchWithAuthPartner = createFetchWithAuth(PARTNER);
    const res = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/x/info`);

    expect(res.status).toBe(200);
    // refresh call used the partner refresh token
    const refreshCall = fetchMock.mock.calls[1];
    expect(refreshCall[0]).toBe(`${API_BASE_URL}/auth/refresh`);
    expect(JSON.parse(refreshCall[1].body)).toEqual({ refresh_token: "cw-refresh" });
    // new tokens stored under partner keys
    expect(store.get(PARTNER.accessToken)).toBe("cw-new");
    expect(store.get(PARTNER.refreshToken)).toBe("cw-new-refresh");
  });

  it("keeps the two instances isolated: a partner refresh never touches restaurant keys", async () => {
    const store = installLocalStorage();
    store.set(REST.accessToken, "rest-keep");
    store.set(REST.refreshToken, "rest-keep-refresh");
    store.set(PARTNER.accessToken, "cw-old");
    store.set(PARTNER.refreshToken, "cw-refresh");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ access_token: "cw-new", refresh_token: "cw-new-refresh" }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    (globalThis as any).fetch = fetchMock;

    const fetchWithAuthPartner = createFetchWithAuth(PARTNER);
    await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/x/info`);

    expect(store.get(REST.accessToken)).toBe("rest-keep");
    expect(store.get(REST.refreshToken)).toBe("rest-keep-refresh");
  });

  it("clears only its own key set when there is no refresh token on 401", async () => {
    const store = installLocalStorage();
    store.set(REST.accessToken, "rest-keep");
    store.set(PARTNER.accessToken, "cw-stale");
    store.set(PARTNER.user, "{}");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }));
    (globalThis as any).fetch = fetchMock;

    const fetchWithAuthPartner = createFetchWithAuth(PARTNER);
    await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/x/info`);

    expect(store.has(PARTNER.accessToken)).toBe(false);
    expect(store.has(PARTNER.user)).toBe(false);
    expect(store.get(REST.accessToken)).toBe("rest-keep");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- auth-client`
Expected: FAIL — `createFetchWithAuth` is not exported yet.

- [ ] **Step 4: Rewrite `auth-client.ts` as a factory**

Full new contents of `lib/api-client/auth-client.ts`:

```ts
import {
  AuthStorageKeys,
  RESTAURANT_STORAGE_KEYS,
  PARTNER_STORAGE_KEYS,
} from "./storage-keys";

const API_BASE_URL = "https://swiftfoods-32981ec7b5a4.herokuapp.com";

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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- auth-client`
Expected: PASS (4 tests).

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from `lib/api-client/*`.

---

### Task 2: Point the partner API service at the partner-bound client

**Files:**
- Modify: `services/api/coworking.api.ts:1`

**Interfaces:**
- Consumes: `fetchWithAuthPartner`, `API_BASE_URL` from `@/lib/api-client/auth-client` (Task 1).

- [ ] **Step 1: Swap the import and all call sites**

In `services/api/coworking.api.ts`, change line 1 from:

```ts
import { fetchWithAuth, API_BASE_URL } from '@/lib/api-client/auth-client';
```

to:

```ts
import { fetchWithAuthPartner, API_BASE_URL } from '@/lib/api-client/auth-client';
```

Then rename every `fetchWithAuth(` call in this file to `fetchWithAuthPartner(`. Known call sites (line numbers): 27, 34, 48, 59, 66, 78, 117, 130, 142, 152, 164, 174, 187. Use a file-scoped replace of the identifier `fetchWithAuth` → `fetchWithAuthPartner` (whole-word), confirming no other identifier contains that substring.

- [ ] **Step 2: Verify no stale references remain**

Run: `grep -n "fetchWithAuth\b" services/api/coworking.api.ts`
Expected: only `fetchWithAuthPartner` matches; zero bare `fetchWithAuth`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

---

### Task 3: Remove the partner hook's dual-write; use PARTNER_STORAGE_KEYS

**Files:**
- Modify: `lib/hooks/useCoworkingAuth.ts`

**Interfaces:**
- Consumes: `PARTNER_STORAGE_KEYS` from `@/lib/api-client/storage-keys` (Task 1).

- [ ] **Step 1: Replace the local STORAGE_KEYS and drop plain-key writes**

Edit `lib/hooks/useCoworkingAuth.ts`:

1. Add import after line 2:
```ts
import { PARTNER_STORAGE_KEYS } from '@/lib/api-client/storage-keys';
```
2. Delete the local `STORAGE_KEYS` object (lines 4-8).
3. Replace all `STORAGE_KEYS.ACCESS_TOKEN` → `PARTNER_STORAGE_KEYS.accessToken`, `STORAGE_KEYS.REFRESH_TOKEN` → `PARTNER_STORAGE_KEYS.refreshToken`, `STORAGE_KEYS.USER` → `PARTNER_STORAGE_KEYS.user`.
4. Delete the dual-write block (current lines 40-42):
```ts
    // Set main access_token so fetchWithAuth picks it up for getProfile
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
```
5. In `logout`, delete the two plain-key removals (current lines 57-58):
```ts
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
```
6. Remove the debug `console.log("Fetched user profile:" ...)` on current line 46 (leftover debug noise in the login path).

Resulting `login`/`logout` bodies:

```ts
  const login = async (email: string, password: string) => {
    const tokens = await coworkingApi.login(email, password);
    localStorage.setItem(PARTNER_STORAGE_KEYS.accessToken, tokens.access_token);
    localStorage.setItem(PARTNER_STORAGE_KEYS.refreshToken, tokens.refresh_token);

    const profile = await coworkingApi.getProfile();
    const userObj = profile.user ?? profile;
    localStorage.setItem(PARTNER_STORAGE_KEYS.user, JSON.stringify(userObj));

    setToken(tokens.access_token);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem(PARTNER_STORAGE_KEYS.accessToken);
    localStorage.removeItem(PARTNER_STORAGE_KEYS.refreshToken);
    localStorage.removeItem(PARTNER_STORAGE_KEYS.user);
    setToken(null);
    setUser(null);
  };
```

- [ ] **Step 2: Verify no plain-key or STORAGE_KEYS references remain**

Run: `grep -nE "STORAGE_KEYS\.|'access_token'|'refresh_token'" lib/hooks/useCoworkingAuth.ts`
Expected: zero matches (all now go through `PARTNER_STORAGE_KEYS`).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

---

### Task 4: Point the restaurant hook at RESTAURANT_STORAGE_KEYS

**Files:**
- Modify: `lib/hooks/useAuth.ts`

**Interfaces:**
- Consumes: `RESTAURANT_STORAGE_KEYS` from `@/lib/api-client/storage-keys` (Task 1).

- [ ] **Step 1: Swap plain literals for the shared constant**

Edit `lib/hooks/useAuth.ts`:

1. Add import after line 3:
```ts
import { RESTAURANT_STORAGE_KEYS } from "@/lib/api-client/storage-keys";
```
2. Replace every `"access_token"` → `RESTAURANT_STORAGE_KEYS.accessToken`, `"refresh_token"` → `RESTAURANT_STORAGE_KEYS.refreshToken`, `"user"` → `RESTAURANT_STORAGE_KEYS.user` across the `useEffect`, `login`, and `logout` bodies (lines 18-19, 34-35, 38, 45-47).

- [ ] **Step 2: Verify**

Run: `grep -nE '"access_token"|"refresh_token"|"user"' lib/hooks/useAuth.ts`
Expected: zero matches.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

---

### Task 5: Update restaurant route guard and partner logout page to use the constants

**Files:**
- Modify: `app/restaurant/layout.tsx:23`
- Modify: `app/partners/logout/page.tsx:10-17`

**Interfaces:**
- Consumes: `RESTAURANT_STORAGE_KEYS`, `PARTNER_STORAGE_KEYS` from `@/lib/api-client/storage-keys` (Task 1).

- [ ] **Step 1: Restaurant guard reads the namespaced access key**

In `app/restaurant/layout.tsx`:
1. Add import after line 5:
```ts
import { RESTAURANT_STORAGE_KEYS } from "@/lib/api-client/storage-keys";
```
2. Change line 23 from:
```ts
    const token = localStorage.getItem("access_token");
```
to:
```ts
    const token = localStorage.getItem(RESTAURANT_STORAGE_KEYS.accessToken);
```

- [ ] **Step 2: Partner logout clears only the partner key set**

Replace the body of the `useEffect` in `app/partners/logout/page.tsx` so it clears the partner keys via the constant (the old plain `access_token`/`refresh_token` entries are dropped — the restaurant no longer uses them and its session must not be cleared by a partner logout):

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PARTNER_STORAGE_KEYS } from "@/lib/api-client/storage-keys";

export default function CoworkingLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem(PARTNER_STORAGE_KEYS.accessToken);
    localStorage.removeItem(PARTNER_STORAGE_KEYS.refreshToken);
    localStorage.removeItem(PARTNER_STORAGE_KEYS.user);
    router.replace("/partners/login");
  }, [router]);

  return null;
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

---

### Task 6: Delete the dead duplicate client

**Files:**
- Delete: `app/api/client.ts`

**Interfaces:** none (confirmed zero importers repo-wide).

- [ ] **Step 1: Confirm it is still unreferenced**

Run: `grep -rn "app/api/client" --include=*.ts --include=*.tsx . ; grep -rn "from ['\"]@/app/api/client" .`
Expected: zero matches.

- [ ] **Step 2: Delete the file**

Run: `git rm app/api/client.ts`

- [ ] **Step 3: Full verification**

Run: `npm test` then `npx tsc --noEmit` then `npm run build`
Expected: tests pass, no type errors, build succeeds.

---

## Self-Review

**Spec coverage:**
- storage-keys.ts single source of truth → Task 1 ✓
- factory with per-instance refresh state → Task 1 ✓
- restaurant-bound `fetchWithAuth` + partner-bound `fetchWithAuthPartner` → Task 1 ✓
- coworking.api.ts uses partner client → Task 2 ✓
- remove partner dual-write, cw_* only → Task 3 ✓
- useAuth uses rest_* constants → Task 4 ✓
- restaurant guard + partner logout use constants → Task 5 ✓
- delete dead app/api/client.ts → Task 6 ✓
- symmetric `rest_*` / `cw_*` naming → Global Constraints + Task 1 ✓
- preserve 401/queue/429/FormData behavior → Task 1 rewrite + tests ✓

**Placeholder scan:** none — all steps carry real code/commands.

**Type consistency:** `AuthStorageKeys` uses `accessToken`/`refreshToken`/`user`; every consumer (Tasks 3-5) references those exact property names. Factory exported as `createFetchWithAuth`, instances `fetchWithAuth` / `fetchWithAuthPartner` — used consistently in Tasks 2-5.

**Note on migration:** renaming restaurant keys to `rest_*` orphans any pre-deploy plain `access_token`/`refresh_token`/`user` entries (harmless, never read again) and logs current restaurant users out once. Accepted in the spec. No migration/cleanup code included by design.
