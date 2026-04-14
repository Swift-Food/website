# Embeddable Catering Widget — Design

## Overview

We will extract the catering order builder and checkout flow (currently
`lib/components/catering/CateringOrderBuilder.tsx` + `Step3ContactDetails.tsx`
plus supporting context and services) into a standalone React component library
that partner websites can drop into their own codebases.

The goal is to let third-party clients embed Swift's catering ordering and
checkout experience on their own sites with minimal integration effort —
ideally a single `<CateringWidget publishableKey="..." onOrderComplete={...} />`
call. Partners get the full ordering flow (restaurant browsing, menu,
multi-session meal building, contact details, Stripe checkout); Swift gets a
distribution channel and tracks each order back to the partner for attribution
and billing.

Distribution target: an NPM package (`@swift/catering-widget`) that works in any
React host (Next.js, Vite, CRA, Remix, plain React). This is the "React
component library" path — not the iframe path.

This design covers both the frontend (widget extraction and packaging) and the
backend (partner identity, API key system, per-request attribution).

### Out of scope (for this phase)

- **Host-injected storage and API client** (the "advanced partner" integration
  where a partner passes their own `storage` adapter and `apiClient` instance).
  The widget will be designed so this is a clean future addition, but the
  initial release will only support Swift's defaults (`localStorage`-backed
  storage, internal API client built from the publishable key). This is
  documented below under *Future: host-injected storage and API client*.
- Iframe-based distribution.
- Stripe Connect (partner-destination payments). Funds continue to go to Swift
  for now.
- Partner-facing admin self-serve. Swift staff will provision partners manually
  via the admin dashboard.

## Authentication clarification

The current catering flow does **not** require user auth. Catering endpoints
are public; the `access_token` / `refresh_token` in `localStorage` are for
other parts of the site (restaurant dashboard, corporate users, saved cards)
and are irrelevant to this widget.

What the widget **does** need is a new concept: a **widget session token**.
This is a short-lived JWT issued by the backend in exchange for a valid
publishable key on an allowed origin. It authenticates the *partner
integration*, not a person. All widget API requests attach it as
`Authorization: Bearer <widget-session-jwt>`.

## Frontend

### Changes required

1. **Invert context into props/callbacks.** Remove all `next/navigation` usage
   (`useRouter`, `useSearchParams`). Replace `router.push(...)` calls with
   invocations of host-supplied callbacks (`onOrderComplete`, `onError`,
   `onReady`). Rationale: `next/navigation` only works inside Next.js and
   assumes the host's routing structure; the widget must be framework-agnostic.

2. **Split `CateringContext`.** Separate the existing context into two:
   - `CateringStateContext` — the order-building state (meal sessions, contact
     info, current step, promo codes).
   - `CateringConfigContext` — widget configuration injected at mount time
     (`apiClient`, `storage`, `theme`, `partnerId`, callbacks).

   Rationale: state and config have different lifecycles and different
   consumers. Splitting makes the widget testable and lets config flow cleanly
   from the entry component.

3. **Internal navigation state machine.** The restaurant browse → restaurant
   menu → checkout flow currently relies on Next's URL-based routing. Replace
   with internal state: `view: 'restaurant-list' | 'restaurant-menu' |
   'checkout'` plus `selectedRestaurantId`. Rationale: the widget cannot own
   the host's URL, and browser back/refresh should not change widget state in
   surprising ways. Trade-off: no deep links, no free back-button handling.

4. **Namespaced storage with a default `localStorage` adapter.** Introduce a
   minimal `StorageAdapter` interface (`getItem`, `setItem`, `removeItem`) and
   an internal default implementation that prefixes all keys with
   `swift:${partnerId}:catering:` (e.g. `swift:abc:catering:meal_sessions`).
   Replace every `localStorage.*` call in catering code with calls through the
   adapter. Rationale: prevents collisions between widget instances and between
   the widget and the partner's own storage; sets up the future host-injected
   storage path without shipping it now.

5. **API client factory.** Replace the singleton `fetchWithAuth` /
   `API_BASE_URL` module with a factory:
   `createApiClient({ baseUrl, publishableKey, storage })`. The factory
   handles fetching/refreshing the widget session token via
   `POST /widget/session` and attaching it to subsequent requests. Rationale:
   singletons prevent multiple widget instances and bake build-time config into
   runtime behavior. Storage usage here is limited to the widget session token
   and is optional (memory-only also works, at the cost of a re-init request
   per page load).

6. **Drop layout leakage.** Remove any implicit dependency on `app/layout.tsx`
   (global fonts, navbar, footer). The widget must render correctly as a
   subtree in any host layout.

7. **Ship compiled CSS.** Pre-build the Tailwind + DaisyUI output into a single
   stylesheet (`dist/styles.css`) scoped under a widget class prefix. Partners
   import the CSS file once. Rationale: hosts should not be required to
   configure Tailwind, and we cannot depend on the host's Tailwind generating
   the same output.

8. **Theme prop.** Expose a small, explicit theme object
   (`{ primary, radius, font? }`) mapped to CSS variables consumed by the
   compiled stylesheet. Keeps the API narrow.

9. **Code-split heavy dependencies.** Dynamic-import `@react-pdf/renderer` (PDF
   export) and the Google Maps loader. Rationale: these together add hundreds
   of KB; only load them when used.

10. **Peer dependencies.** `react` and `react-dom` as peers. Bundle Stripe SDK,
    lucide icons, dayjs, and other runtime deps.

11. **Widget entry component.** Single public export:
    `<CateringWidget publishableKey theme onReady onOrderComplete onError />`.

12. **Build & publish.** Library build via `tsup` (or Rollup). Output ESM +
    CJS, type definitions, and the CSS bundle. Publish to NPM under
    `@swift/catering-widget`.

### How a partner integrates

#### Option A — minimal integration (the default path we support now)

```tsx
// partner-site/app/catering/page.tsx
import { CateringWidget } from "@swift/catering-widget";
import "@swift/catering-widget/dist/styles.css";

export default function CateringPage() {
  return (
    <CateringWidget
      publishableKey="pk_live_abc123"
      onOrderComplete={({ orderId }) => {
        window.location.href = `/thanks?order=${orderId}`;
      }}
    />
  );
}
```

Defaults cover everything: `localStorage`-backed storage, internal API client
built from the publishable key, Swift-hosted API base URL, default theme.

#### Option B — typical partner (Next.js, custom navigation, theme)

```tsx
"use client";
import { CateringWidget } from "@swift/catering-widget";
import "@swift/catering-widget/dist/styles.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CateringPage() {
  const router = useRouter();

  return (
    <CateringWidget
      publishableKey={process.env.NEXT_PUBLIC_SWIFT_KEY!}
      theme={{ primary: "#ff5a1f", radius: "8px" }}
      onReady={() => console.log("widget ready")}
      onOrderComplete={({ orderId, accessToken }) => {
        toast.success("Order placed!");
        router.push(`/orders/${orderId}?token=${accessToken}`);
      }}
      onError={(err) => toast.error(err.message)}
    />
  );
}
```

The partner owns navigation, toasts, and analytics; the widget fires events.

#### Future: host-injected storage and API client (NOT in this phase)

The widget will be architected so the following is possible as a future
enhancement, but this is explicitly **deferred** and will not be shipped in the
initial release:

```tsx
// NOT SHIPPING YET — documenting the intended future shape.
import {
  CateringWidget,
  createApiClient,
  createMemoryStorage,
} from "@swift/catering-widget";

const storage = createMemoryStorage();
const apiClient = createApiClient({
  baseUrl: "https://api.swiftfood.uk",
  publishableKey: process.env.NEXT_PUBLIC_SWIFT_KEY!,
  storage,
});

<CateringWidget apiClient={apiClient} storage={storage} ... />
```

Motivating use cases for adding this later: privacy-sensitive partners who
cannot persist to `localStorage` before consent; partners who want to share the
API client with their own code; per-instance isolation beyond what the default
namespacing provides. The internal split of state/config context and the
storage-adapter interface are already required for this phase, so no rework
will be needed when we pick it up.

### What the partner is responsible for

- Obtaining a `publishableKey` from Swift and registering their origin.
- Handling `onOrderComplete` (navigation, confirmation UI, analytics).
- Their page layout around the widget.

### What the partner is NOT responsible for

- Stripe setup — the widget loads Stripe internally using the publishable key.
- Google Maps loader — the widget loads it.
- Menu data, pricing, promo codes, order submission — all internal.
- Styling — compiled CSS ships with the package; `theme` prop covers common
  overrides.

## Backend

### Changes required

- **Partner entity and API keys.** New `Partner` and `PartnerApiKey` tables.
  Each partner has a publishable key (safe to ship in the browser bundle) and
  optionally a secret key (server-to-server). *Why:* identify who is embedding
  the widget and authenticate each partner integration independently.

- **Widget session endpoint.** `POST /widget/session` accepts a publishable
  key plus the request `Origin`, validates both against the partner record,
  and returns a short-lived JWT scoped to that partner. *Why:* avoid shipping
  long-lived credentials in the browser bundle and give the backend a single
  bearer token to validate on subsequent requests.

- **Partner auth guards.** `PartnerApiKeyGuard` (for the session endpoint) and
  `WidgetSessionGuard` (for all public catering endpoints) attach `partnerId`
  to the request context. *Why:* block unauthenticated traffic and make every
  downstream handler partner-aware without per-endpoint plumbing.

- **Dynamic CORS.** Replace the static origin allowlist in `src/main.ts` with
  a DB-driven check: `origin: (origin, cb) => checkPartnerAllowedOrigin(origin,
  cb)`. *Why:* partners must be onboardable without a backend deploy.

- **Order attribution.** Add a `partnerId` column to `CateringOrder`,
  populated from the request context by the guards. *Why:* enables per-partner
  reporting, commission, billing, and abuse tracing.

- **Restaurant scoping per key.** Each `PartnerApiKey` lists allowed
  `restaurantId`s. The catering service validates that every restaurant in a
  submitted order is in the partner's allowed set. *Why:* prevents a partner
  from ordering against restaurants they are not authorized for, even if they
  pass arbitrary IDs from the client.

- **Per-key rate limiting.** `@nestjs/throttler` with a custom tracker keyed by
  `partnerId`. *Why:* protects infra from a single misbehaving or compromised
  partner without affecting others.

- **Partner webhooks.** HMAC-signed POSTs to partner-configured URLs on order
  status changes (created, paid, confirmed, completed, cancelled). *Why:*
  partner sites need to react to order events without polling and without
  depending on `onOrderComplete` firing reliably in the browser.

- **Admin surface.** CRUD for partners, API keys, allowed origins, allowed
  restaurants, and usage stats, in the existing admin dashboard. *Why:*
  operate the partner program without engineering involvement per partner.

### Not in this phase

- **Stripe Connect.** Partner-destination payments remain out of scope; funds
  continue to settle to Swift.

## Testing

- Unit: context splitting, storage adapter default, API client factory,
  navigation state machine.
- Integration: full ordering flow in a host harness (a minimal Vite app that
  embeds the built package).
- Backend: guards, CORS, partner attribution on orders, webhook signing.
- Manual: embed built package in a staging partner site, walk the end-to-end
  flow against staging backend.

## Rollout

1. Backend partner model, API key system, guards, dynamic CORS — deployable
   independently (additive; existing endpoints remain unchanged behind a
   feature flag that falls back to the public path if no key is presented).
2. Frontend extraction into the package, using the new backend. Internal
   dogfood: rebuild `app/(public)/event-order` on top of the package to prove
   parity.
3. Pilot with one partner.
4. Widen to additional partners; build self-serve admin flows.
