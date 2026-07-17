# Portal Auth Storage Isolation - Design

**Date:** 2026-07-17
**Status:** Approved (design), pending implementation plan

## Problem

The restaurant portal (`app/restaurant/`) and the partner portal (`app/partners/`) both persist auth state in `localStorage` on the same browser origin, and they collide.

- Restaurant stores tokens under plain keys: `access_token`, `refresh_token`, `user`.
- Partner (`useCoworkingAuth`) stores under namespaced keys `cw_access_token`, `cw_refresh_token`, `cw_user`, **but also dual-writes the plain `access_token` / `refresh_token`** so the shared HTTP client can find them.

Because the shared `fetchWithAuth` client (`lib/api-client/auth-client.ts`) reads only the plain keys, both portals are forced through one global key set. Logging into the partner portal overwrites the restaurant's `access_token` / `refresh_token` / `user` (and vice-versa), silently clobbering the other session.

### Root cause
`fetchWithAuth` is a single global function, imported by 18 files, hardcoded to one localStorage key set. There is no per-portal binding, so the partner hook resorts to dual-writing the restaurant's keys.

### Desired end state
The two portal sessions **coexist independently**: separate namespaced key sets that never touch each other. A user may be logged into both portals simultaneously in the same browser; authenticating in one has no effect on the other.

## Approach: per-portal client factory

Convert `fetchWithAuth` from a single global function into a **factory** that binds to a specific key set, and give each portal its own bound instance with its own refresh state.

Rejected alternatives:
- **Runtime path detection** (`window.location.pathname` picks the key set): zero call-site changes, but fragile - breaks under SSR, in shared components, and in background timers/refreshes that fire after navigation. Couples routing to auth.
- **Explicit per-call parameter** (pass the key config into every `fetchWithAuth` call): most explicit, but changes all 18 call sites and every service function signature. High churn, no advantage over the factory.

The factory keeps all 17 restaurant importers unchanged (they keep importing a default `fetchWithAuth`), and only `services/api/coworking.api.ts` switches to the partner-bound instance.

## Key sets (symmetric namespacing)

Both portals get symmetric, namespaced keys. The restaurant portal's plain keys are renamed. **Consequence:** existing logged-in restaurant users are logged out once on deploy (their old `access_token` is orphaned) and must re-login one time. Accepted.

| Concept        | Restaurant        | Partner            |
| -------------- | ----------------- | ------------------ |
| Access token   | `rest_access_token` | `cw_access_token`  |
| Refresh token  | `rest_refresh_token`| `cw_refresh_token` |
| User profile   | `rest_user`       | `cw_user`          |

`redirect_after_login` (restaurant route guard) is not auth-token state and is left unchanged.

## Components

### New: `lib/api-client/storage-keys.ts`
Single source of truth for both key sets. Exported typed config objects consumed by the client factory and the auth hooks/guards.

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

### Refactor: `lib/api-client/auth-client.ts`
Introduce `createFetchWithAuth(keys: AuthStorageKeys)` that returns a `fetchWithAuth` function. All previously module-level mutable state (the `isRefreshing` flag and the pending-request queue) moves **inside the factory closure**, so each portal instance has independent refresh state - a partner token refresh never blocks a restaurant request, and vice-versa.

Preserve all existing behavior of the current implementation: 401 → refresh-and-retry, request queueing while refreshing, 429 rate-limit handling, and skipping `Content-Type` for `FormData` bodies.

Exports:
- `fetchWithAuth` - restaurant-bound instance (`createFetchWithAuth(RESTAURANT_STORAGE_KEYS)`). Preserves the existing import for all 17 restaurant importers unchanged.
- `fetchWithAuthPartner` - partner-bound instance (`createFetchWithAuth(PARTNER_STORAGE_KEYS)`).
- `API_BASE_URL` - unchanged.
- `createFetchWithAuth` - exported for testing.

### `services/api/coworking.api.ts`
Change its import from `fetchWithAuth` to `fetchWithAuthPartner`. No other changes.

### `lib/hooks/useCoworkingAuth.ts`
- Remove the dual-write of plain `access_token` / `refresh_token` (the reason it existed - feeding the shared client - is gone).
- Read/write only via `PARTNER_STORAGE_KEYS`.
- Logout removes only the `cw_*` keys.
- Replace the local `STORAGE_KEYS` literal with the imported `PARTNER_STORAGE_KEYS`.

### `lib/hooks/useAuth.ts`
- Read/write only via `RESTAURANT_STORAGE_KEYS` (was plain literals).

### `app/restaurant/layout.tsx`
- Route guard reads `RESTAURANT_STORAGE_KEYS.accessToken` instead of the inline `"access_token"` literal.

### `app/partners/logout/page.tsx`
- Clear keys via `PARTNER_STORAGE_KEYS` instead of inline literals. (Out of scope: refactoring it to call `useCoworkingAuth().logout()` - noted but not required for this fix.)

### Delete: `app/api/client.ts`
Confirmed dead code - zero importers repo-wide, and a stale near-duplicate of `auth-client.ts` missing the FormData and 429 fixes. Removed to prevent it being wired up later and reintroducing the collision.

## Data flow (after change)

- Restaurant page → `services/api/restaurant.api.ts` → `fetchWithAuth` → reads `rest_access_token`, refreshes with `rest_refresh_token`.
- Partner page → `services/api/coworking.api.ts` → `fetchWithAuthPartner` → reads `cw_access_token`, refreshes with `cw_refresh_token`.

The two never read or write each other's keys. Simultaneous logins coexist.

## Error handling

Unchanged from current behavior, now per-instance:
- 401 with a valid refresh token → refresh, retry the original request once, queue concurrent requests until refresh resolves.
- 401 with no/expired refresh token → clear that portal's key set only, reject.
- 429 → existing rate-limit handling preserved.
- A failed partner refresh clears only `cw_*`; the restaurant session is untouched (and vice-versa).

## Testing

- **Unit (factory):** `createFetchWithAuth` with a fake key set + mocked `localStorage`/`fetch`:
  - Attaches `Authorization: Bearer <token>` from the configured access key.
  - On 401, refreshes using the configured refresh key and writes new tokens back to the configured keys.
  - Two instances with different key sets do not read/write each other's keys.
  - Concurrent 401s trigger a single refresh (queue behavior).
  - `FormData` body → no `Content-Type` header; 429 handling intact.
- **Hook behavior:** `useCoworkingAuth` login writes only `cw_*` (no plain keys); logout clears only `cw_*`. `useAuth` login/logout touch only `rest_*`.
- **Isolation regression:** simulate partner login then assert restaurant `rest_*` keys are unchanged, and vice-versa.

## Out of scope
- Migrating `app/partners/logout/page.tsx` to call the hook's `logout()` (drift cleanup, not required here).
- Moving `app/restaurant/layout.tsx`'s guard to use `useAuth()` instead of a direct read.
- Any server-side/cookie-based session redesign.
