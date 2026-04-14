# Embeddable Catering Widget — Design

## Overview

Swift's catering ordering and checkout flow is currently welded into the main
Next.js application: `lib/components/catering/CateringOrderBuilder.tsx` (the
order-building step) and `lib/components/catering/Step3ContactDetails.tsx`
(the contact and payment step) rely on the host app's router, global layout,
shared CSS, singleton API client, user auth tokens in `localStorage`, and a
fixed backend origin allowlist. The experience works well on
`swiftfood.uk` but cannot be used anywhere else.

This design extracts that flow into a standalone React component library —
`@swift/catering-widget` — that partner websites can install via NPM and drop
into their own pages with a single component:

```tsx
<CateringWidget publishableKey="pk_live_..." onOrderComplete={...} />
```

The widget encapsulates the full ordering experience: restaurant browsing,
menu exploration, multi-session meal building (multiple dates/times per
order), contact and delivery details, promo codes, pricing, and Stripe
checkout. Partners get a plug-in catering channel without integrating dozens
of endpoints themselves. Swift gets a distribution channel and knows, per
order, which partner brought it in — enabling per-partner reporting,
commission, and billing.

The distribution target is **any React host**: Next.js (App or Pages Router),
Vite, Create React App, Remix, Gatsby, plain React mounted on a static page.
The widget ships as ESM + CJS + compiled CSS and declares React as a peer
dependency. It does not depend on Next.js, the host's router, or the host's
Tailwind configuration.

This document describes both frontend (extracting the widget into the
library) and backend (adding partner identity, API key authentication, CORS
changes, and per-request attribution). Both must ship together for the
widget to work end-to-end on a third-party site.

### Goals

- A single React component partners embed to get the full Swift catering
  flow.
- Partner-scoped authentication: each partner gets a publishable key; every
  request is attributable to a partner; a partner can be revoked without a
  deploy.
- Minimal integration burden: default configuration covers ~90% of partners.
  A partner should be able to go from "I have a publishable key" to "orders
  flowing" in under an hour.
- Zero impact on Swift's own `swiftfood.uk` flow during rollout. The main
  site continues to work; internally we'll rebuild it on top of the library
  to prove parity.

### Non-goals (for this phase)

- **Iframe distribution.** A hosted iframe widget (`widget.swiftfood.uk` +
  postMessage) is a viable alternative path. We're not pursuing it here
  because the NPM component gives partners a more native visual integration
  and is what early partner conversations have asked for. Iframe may be
  added later as a second distribution mode.
- **Stripe Connect.** Payments continue to settle to Swift's Stripe account.
  Routing funds to partner-owned Stripe accounts (destination charges or
  separate accounts) is material work and is deferred.
- **Partner self-serve onboarding.** Partners are provisioned manually by
  Swift staff via the admin dashboard. A self-serve signup / key generation
  flow is a later add.
- **User authentication inside the widget.** The catering flow is guest-only
  today and stays guest-only in the widget. Corporate-user login, saved
  cards, and user-scoped order history are out of scope for the widget.
  (They remain available in the main `swiftfood.uk` experience.)

## Authentication model

The current catering flow does not require user auth — catering endpoints
are public, and the `access_token` / `refresh_token` stored in the main
site's `localStorage` are for unrelated features (restaurant dashboard,
corporate users, saved cards). None of that applies here.

What the widget needs instead is a concept that does not exist today: a
**widget session token**. This authenticates the *partner integration*, not
a person.

### Why a session token at all

The publishable key (`pk_live_...`) must ship in the partner's public
JavaScript bundle. Anyone can open devtools and read it. If the backend
accepted the publishable key directly on every endpoint, a scraper could
extract it and hammer Swift's API from anywhere. The session token mitigates
this in two ways:

- The `POST /widget/session` handshake validates the `Origin` header, which
  is browser-set and hard for a scraper to spoof from outside a browser. A
  random server running curl against `/widget/session` fails because its
  origin is not in the partner's allowed list.
- The session token itself is short-lived (30 minutes) and carries the
  validated `partnerId` + allowed-restaurant list in its payload, signed
  with a backend secret. Downstream endpoints don't need to re-check the
  origin; they just verify the JWT signature and read the claims.

### Flow

1. Widget mounts with the partner's publishable key as a prop.
2. On first API call, widget's internal client sends
   `POST /widget/session` with `{ publishableKey }` and the browser-attached
   `Origin` header.
3. Backend looks up the partner by publishable key, checks the `Origin`
   against the partner's allowed-origins list, and returns a signed JWT
   containing `{ partnerId, allowedRestaurantIds, exp }` (30 min expiry).
4. Widget caches the JWT (in memory; see Storage below for details) and
   attaches it as `Authorization: Bearer <jwt>` on every subsequent API
   call.
5. On expiry (or a 401 response), widget transparently re-runs the
   handshake and retries.

This is a deliberately standard pattern — similar shapes exist in Stripe,
Algolia, Segment, and Intercom integrations. It's well understood by
security reviewers and easy to document.

### What the session token does NOT do

- It does not identify an end user. The ordering customer is still a guest;
  no login UI, no user profile.
- It does not authorize privileged operations. The widget only hits the
  public catering surface (menu search, pricing preview, order submission).
  It cannot, for example, see other partners' orders.

## Frontend

### Current structure

The two components being extracted are large and tightly coupled:

- `lib/components/catering/CateringOrderBuilder.tsx` — ~1,963 lines, 140+
  `useState` calls, ~15 sub-components (session editor, menu browser,
  pricing summary, multiple modals, PDF export, bundle browser, mobile
  keyboard handling).
- `lib/components/catering/Step3ContactDetails.tsx` — ~800 lines, contact
  form, Google Maps address autocomplete, promo code entry, pricing
  summary, Stripe Elements payment UI, checkout bar.
- `context/CateringContext.tsx` — ~560 lines. Holds all in-flight order
  state (meal sessions, items, contact info, promo codes, selected
  restaurants, etc.) and persists every change to `localStorage` under a
  set of `catering_*` keys.
- `services/api/catering.api.ts` — ~300 lines of typed API methods that
  call the backend through a shared `fetchWithAuth` singleton.
- Supporting modals, form components, and PDF generators under
  `lib/components/catering/*` — 50+ files.

None of this code is wrong; it's just wrong for embedding. It assumes a
Next.js host, a singleton API configuration, direct `localStorage` access,
a specific URL structure, and the availability of the main site's global
CSS and fonts.

### Refactor: architecture overview

The widget package will be structured around a small public surface and a
larger internal implementation:

```
@swift/catering-widget
│
├── Public API
│   ├── <CateringWidget />          (the one component partners render)
│   ├── types (Theme, OrderResult, etc.)
│   └── dist/styles.css             (compiled stylesheet partners import once)
│
└── Internal
    ├── CateringStateContext        (order-building state & mutations)
    ├── CateringConfigContext       (partnerId, theme, callbacks)
    ├── API client                  (internal; built from publishableKey)
    ├── Storage layer               (internal; namespaced localStorage)
    ├── Navigation state machine    (view = list | menu | checkout)
    └── All the existing UI         (builder, checkout, modals, etc.)
```

Partners only touch the public API. Everything else is implementation
detail.

### Frontend changes

Each change below includes the current state, the proposed state, and the
rationale.

#### 1. Remove `next/navigation` and invert routing into callbacks

**Today.** The catering flow uses `useRouter()` from `next/navigation` and
calls `router.push('/event-order/view/{accessToken}')` after a successful
order. It also uses `useSearchParams()` in one place (unused for catering
today but present). These hooks only work inside a Next.js app tree — they
read from `AppRouterContext`, which no other framework provides.

**Proposed.** Delete every import of `next/navigation` from the widget's
code. Replace `router.push` with a call to a host-supplied callback:

```tsx
onOrderComplete?: (result: { orderId: string; accessToken: string }) => void;
onError?: (error: WidgetError) => void;
onReady?: () => void;
onStepChange?: (step: 1 | 2) => void;
```

The widget fires events; the host decides what happens. A Next partner can
call `router.push` inside the callback; a Vite partner can call their
navigate function; a plain-HTML partner can set `window.location`. Same
widget, any host.

**Rationale.** This is the single biggest unlock for framework portability.
Without it, the widget works only in Next.js and only if the host happens
to have a route at `/event-order/view/[token]`. With it, the widget works
anywhere React runs.

#### 2. Split `CateringContext` into State and Config

**Today.** `CateringContext` holds two categories of thing in one provider:

- **State** that changes constantly — meal sessions, items, contact info,
  promo codes, current step, selected restaurants. Components that consume
  this need to re-render when it changes.
- **Implicit config** that doesn't really live anywhere — the API base URL
  is a module-level constant, `localStorage` keys are hardcoded, there are
  no callbacks because the code calls `router.push` directly.

**Proposed.** Split into two contexts:

- **`CateringStateContext`** — all the existing state + mutations. This is
  a near-verbatim extraction of today's context, minus the `localStorage`
  calls (those move behind the storage layer).
- **`CateringConfigContext`** — widget configuration, set once at mount
  and immutable thereafter: `partnerId`, `theme`, and the host callbacks
  (`onOrderComplete`, `onError`, `onReady`, `onStepChange`).

The API client and the storage layer are not in either context in phase 1
— they're module-level implementations initialized by `<CateringWidget>`
on mount and accessed via small hooks (`useApiClient()`,
`useStorage()`). This keeps phase 1 simple; we can promote them into
context later if needed.

**Rationale.**
- **Re-render hygiene.** Config is immutable for the widget's lifetime.
  Keeping it in a separate context means consumers of config don't
  re-render every time a cart item changes.
- **Consumer clarity.** Components that need "what partner am I rendering
  for" are different from components that need "what's in the cart."
  Splitting makes the boundaries honest and the code easier to reason
  about.
- **Testability.** A test can mount the widget with a mock config
  (different `partnerId`, fake callbacks) without touching state logic.

#### 3. Replace URL-based navigation with an internal state machine

**Today.** Restaurant browse → restaurant menu → checkout relies partly on
Next's routing and partly on a `currentStep` counter in context. The main
site uses URL changes to move between views.

**Proposed.** Replace with an explicit internal state machine in
`CateringStateContext`:

```ts
type WidgetView =
  | { kind: "restaurant-list" }
  | { kind: "restaurant-menu"; restaurantId: string }
  | { kind: "checkout" };
```

Navigating between views is a state transition, not a URL change. The host
site's URL never changes while the user is inside the widget.

**Rationale.** The widget cannot own the host's URL. Two reasons:

- The partner's URL structure is theirs. We cannot push
  `/catering/restaurant/abc` on `partner.com` without colliding with
  whatever they have at that path.
- The host's browser back button should navigate the host's pages, not
  "go back inside the widget." Keeping widget navigation internal makes
  back-button behavior predictable.

**Trade-offs we accept.** No deep links (cannot link directly to a
specific restaurant's menu inside the widget), no free back-button
handling, no scroll restoration. These are manageable; the widget can
persist `selectedRestaurantId` to storage for refresh survival and manage
its own scroll positions via refs.

#### 4. Internal namespaced storage layer

**Today.** `CateringContext` reads and writes `localStorage` directly in
~15 places using fixed keys (`catering_current_step`, `catering_meal_sessions`,
etc.). The `auth-client.ts` singleton reads user tokens from `localStorage`
on every API call. Key names are global and would collide across widget
instances (or between the widget and the partner's own `localStorage`
usage).

**Proposed.** Introduce a small internal module that wraps `localStorage`
and prefixes all keys with `swift:${partnerId}:catering:`. For example,
`meal_sessions` becomes `swift:abc:catering:meal_sessions`. Every
`localStorage.*` call in the catering code goes through this module
(`storage.getItem` / `storage.setItem` / `storage.removeItem`).

The storage module is created on widget mount once the `partnerId` is
known (after the first `POST /widget/session` response, the widget has
the authoritative partnerId from the backend). Before that, the widget
uses an in-memory shim so early renders don't touch `localStorage` with
an unknown namespace.

**Rationale.**
- **Namespace collision.** Without prefixing, two different Swift widget
  instances on the same origin (rare but possible — e.g., a partner with
  two restaurants on one page) would stomp each other's state. Prefixing
  also protects against accidentally colliding with the partner's own
  `localStorage` usage.
- **Consistent origin of truth.** All persistence in the widget funnels
  through one module. No surprises where a component reaches for
  `localStorage` directly.
- **Swap-ability internally.** If we need to switch to `sessionStorage`,
  `IndexedDB`, or in-memory for specific cases (e.g., a partner region
  with strict cookie laws, decided at the widget level — not partner-
  level), we change one file.

Note: the storage layer is purely internal. Partners do not see it, do not
configure it, and do not pass anything in. The widget uses `localStorage`
by default for everyone.

#### 5. Internal API client bound to the publishable key

**Today.** `lib/api-client/auth-client.ts` exports a `fetchWithAuth`
singleton that uses a build-time `NEXT_PUBLIC_API_URL` and reads user
tokens from `localStorage`. All of `services/api/*` imports this singleton
directly.

**Proposed.** Inside the widget package, replace the singleton with a
small client module initialized on widget mount from the publishable key.
Its responsibilities:

- Maintain the widget session token (fetch on first use, cache in memory,
  refresh when expired or on 401, retry the failed request once).
- Expose typed methods for every endpoint the widget calls
  (`catering.submitOrder`, `catering.verifyPricing`,
  `menu.searchCatering`, `menu.getBundles`, `restaurants.listForCatering`,
  `payments.createPaymentIntent`, etc.).
- Attach `Authorization: Bearer <widget-session-jwt>` to every request.
- Set the base URL from a compile-time constant that defaults to
  `https://api.swiftfood.uk` (overridable per build for staging / dogfood).

Internally the client is roughly:

```ts
async function apiFetch(path: string, init: RequestInit = {}) {
  let token = sessionTokenCache.get();
  if (!token || isExpired(token)) {
    token = await fetchNewSessionToken(publishableKey);
    sessionTokenCache.set(token);
  }
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    token = await fetchNewSessionToken(publishableKey);
    sessionTokenCache.set(token);
    return fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
  }
  return res;
}
```

Typed methods (`apiClient.catering.submitOrder(...)`, etc.) are thin
wrappers over `apiFetch`. Total surface: ~100 lines of glue plus per-method
typings.

**Rationale.** The existing `fetchWithAuth` is tied to user auth and a
build-time base URL — both wrong for the widget. The replacement is
internal, self-contained, and per-widget-instance. Partners never see it.

#### 6. Remove layout and global-CSS leakage

**Today.** The catering flow implicitly depends on the main site's
`app/layout.tsx` — global font loading (`IBM_Plex_Mono`), navbar/footer
imports, root classes. Some sub-components also reach for classes that
only exist because a parent route configured them.

**Proposed.** The widget renders a self-contained subtree under a single
root `<div class="swift-catering-widget">`. No assumptions about parent
layout, fonts, or global classes. Fonts, if needed, are loaded via
`@font-face` scoped to the widget class.

**Rationale.** The widget must render correctly as a subtree of any host
page, including pages with no Tailwind, no DaisyUI, no custom fonts, and
possibly conflicting global styles.

#### 7. Ship compiled CSS

**Today.** Styling relies on the host app's Tailwind v4 and DaisyUI v5
configs generating CSS from utility classes in JSX.

**Proposed.** Build the widget's CSS ahead of time — run Tailwind /
DaisyUI at package build time, producing a single `dist/styles.css` that
contains only the classes the widget actually uses, scoped under a
widget-specific root class (`.swift-catering-widget`) to reduce collision
with host styles. Partners import this file once:

```tsx
import "@swift/catering-widget/dist/styles.css";
```

**Rationale.**
- Partners should not have to configure Tailwind to make a third-party
  component work. Most don't use Tailwind at all.
- Partners who do use Tailwind may have a different config; the widget
  cannot rely on their output matching ours.
- Pre-scoping under `.swift-catering-widget` reduces the risk of widget
  classes bleeding into host styles or vice versa.

#### 8. Theme prop for common customizations

**Today.** Colors, border radius, and fonts are baked into the DaisyUI
theme.

**Proposed.** Expose a small typed theme object:

```ts
type Theme = {
  primary?: string;      // hex, e.g. "#ff5a1f"
  radius?: string;       // CSS length, e.g. "8px"
  font?: string;         // CSS font-family
};
```

The widget applies these by setting CSS custom properties on its root
(`--swift-primary`, `--swift-radius`, `--swift-font`), which the compiled
stylesheet reads. Stripe Elements, which needs JS color values rather than
CSS variables, reads `theme.primary` directly.

**Rationale.** Partners want the widget to feel like it belongs on their
site; we want a narrow, stable customization API rather than a fully open
style prop. Three tokens cover ~90% of branding needs.

#### 9. Code-split heavy dependencies

**Today.** `@react-pdf/renderer` (PDF export) and the Google Maps script
loader are imported eagerly; both are sizeable.

**Proposed.**
- Dynamic-import `@react-pdf/renderer` inside the PDF download modal —
  only loaded when a user actually clicks "download PDF."
- Dynamic-import the Google Maps loader on the contact step when the
  address autocomplete mounts.

**Rationale.** The widget's first-render bundle size directly affects
partner page performance. Partners will notice; we should minimize the
cost of embedding.

#### 10. Peer dependencies and packaging

**Peer dependencies.** `react` (>=18), `react-dom` (>=18). Nothing else.

**Bundled dependencies.** Stripe JS SDK, lucide icons, dayjs,
`@react-pdf/renderer` (lazy-loaded), Google Maps loader (lazy-loaded),
`jwt-decode`.

**Build.** `tsup` (or Rollup) produces:
- `dist/index.mjs` (ESM)
- `dist/index.cjs` (CJS)
- `dist/index.d.ts` (types)
- `dist/styles.css` (compiled CSS)

Package exports declare all three entry points via the modern `exports`
field.

#### 11. Public component

Single public export, intentionally small:

```tsx
interface CateringWidgetProps {
  publishableKey: string;
  theme?: Theme;
  onReady?: () => void;
  onOrderComplete?: (result: { orderId: string; accessToken: string }) => void;
  onError?: (error: WidgetError) => void;
  onStepChange?: (step: 1 | 2) => void;
}

export function CateringWidget(props: CateringWidgetProps): JSX.Element;
```

That's the entire partner-facing surface. No factories, no adapters, no
builders.

### How a partner integrates

#### Minimal integration (covers ~90% of partners)

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

All defaults apply: Swift-hosted backend, `localStorage`-backed widget
state, default theme, internal API client and session handling.

#### Typical Next.js partner with custom navigation, theme, and toast UX

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

The partner owns navigation, toasts, analytics, logging. The widget
handles everything inside itself and fires callbacks at key moments.

### What the partner is responsible for

- Obtaining a publishable key from Swift and storing it in their env
  (e.g. `NEXT_PUBLIC_SWIFT_KEY`).
- Registering the origin(s) they'll embed on with Swift, so the backend's
  CORS check and `POST /widget/session` origin validation pass.
- Rendering `<CateringWidget>` wherever they want it.
- Handling `onOrderComplete` — navigation to a thank-you page, showing a
  confirmation UI, triggering analytics. This is business logic only they
  know.
- Providing page chrome around the widget (header, footer, SEO content).

### What the partner is NOT responsible for

- Initializing Stripe — the widget loads Stripe.js internally and mounts
  Elements within itself. Partners don't even install a Stripe SDK.
- Loading Google Maps — the widget lazy-loads the script when the
  address-autocomplete field mounts.
- API calls — menu fetching, pricing preview, promo codes, order
  submission, webhooks: all internal.
- State persistence — the widget handles its own `localStorage` under
  namespaced keys.
- Styling — one CSS import covers it; the `theme` prop handles common
  branding overrides.
- Auth / session management — the widget runs the publishable-key →
  widget-session handshake transparently.

## Backend

The backend currently has no concept of a "partner," "API key," or
"tenant." All catering endpoints are public. CORS is a hard-coded
allowlist in `src/main.ts`. To make the widget viable, the backend must
gain the ability to identify, authenticate, and scope requests by
partner.

### Partner data model

Two new tables, living alongside existing entities.

**`partner`**
- `id: uuid`
- `name: string` (internal label, e.g. "Halkin")
- `slug: string` (URL-safe, e.g. `halkin`)
- `contactEmail: string`
- `allowedOrigins: string[]` (e.g. `["https://events.halkin.com",
  "https://halkin.com"]`)
- `allowedRestaurantIds: string[]` — which restaurants this partner may
  order from
- `webhookUrl: string | null` — optional; where to POST order events
- `webhookSecret: string | null` — HMAC key for signing webhook bodies
- `active: boolean`
- `rateLimit: { windowSeconds: number; max: number } | null` — per-key
  throttle override
- `createdAt`, `updatedAt`

**`partner_api_key`**
- `id: uuid`
- `partnerId: uuid` (FK)
- `publishableKey: string` (indexed; format `pk_live_...` / `pk_test_...`)
- `secretKeyHash: string | null` (optional secret key, stored as bcrypt /
  argon2 hash; plaintext secret shown once at creation)
- `label: string` (e.g. "production", "staging")
- `active: boolean`
- `revokedAt: Date | null`
- `createdAt`

A partner has many API keys to support rotation without downtime (create
new → update frontend env → revoke old).

**Why separate entities.** Most partners will want different keys for
staging vs production (same partner, different environments, maybe
different allowed origins per key). Keeping keys separate from partners
makes rotation and environment separation clean.

### Endpoints

**`POST /widget/session`** — new, the publishable-key handshake.
- Request body: `{ publishableKey: string }`
- Required header: `Origin` (automatically set by browsers)
- Logic:
  1. Look up `partner_api_key` by `publishableKey`. If not found or
     inactive, return 401.
  2. Load the partner. If inactive, return 401.
  3. Check `Origin` is in `partner.allowedOrigins`. If not, return 403.
  4. Sign a JWT with `{ partnerId, allowedRestaurantIds, keyId, exp:
     now + 30min }` using the backend's widget-session secret.
  5. Return `{ token: <jwt>, expiresAt: <iso> }`.
- Rate-limited aggressively per publishable key (e.g. 60 handshakes /
  minute) to prevent token-minting abuse.

All other catering endpoints (`GET /menu-item/catering`,
`POST /catering-orders`, `POST /pricing/catering-verify-cart`,
`GET /catering-bundles`, etc.) continue to exist. They gain an additional
auth path described under Guards.

### Guards

Two new NestJS guards:

**`PartnerApiKeyGuard`** (applied to `POST /widget/session`)
- Extracts `publishableKey` from the request body.
- Validates existence, activity, and origin.
- On success, attaches `{ partnerId, keyId }` to `request.partner`.

**`WidgetSessionGuard`** (applied to all widget-accessible catering
endpoints)
- Extracts the JWT from the `Authorization: Bearer ...` header.
- Verifies signature and expiry.
- Attaches `{ partnerId, allowedRestaurantIds, keyId }` to
  `request.partner`.
- Returns 401 on invalid or expired tokens so the widget knows to refresh.

**Backward compatibility.** Existing callers (the main `swiftfood.uk`
site, admin dashboards) don't send these headers. During rollout, the
widget-accessible endpoints accept either path: a valid widget session
JWT *or* the existing public-access behavior. Once the main site is
rebuilt on top of the widget library (dogfood step), we can remove the
public-access fallback and require widget session tokens universally.
This staging keeps risk low.

### Dynamic CORS

**Today.** `src/main.ts` hardcodes an `origin` array including
`swiftfood.uk`, two Netlify apps, `prismo.live`, two Halkin domains, and
localhost.

**Proposed.** Replace with a function:

```ts
app.enableCors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                   // same-origin / server calls
    if (isSwiftInternalOrigin(origin)) return cb(null, true); // main site, admin
    checkPartnerAllowedOrigin(origin)
      .then((allowed) => cb(null, allowed))
      .catch((err) => cb(err));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

`checkPartnerAllowedOrigin` queries the `partner` table (with caching) to
see if any active partner has the origin in its `allowedOrigins` list.

**Rationale.** Partners must be onboardable without a backend deploy.
Static allowlists don't scale to a partner program.

### Order attribution

Add `partnerId: uuid | null` to `catering_order`. The catering service
reads `request.partner.partnerId` (populated by `WidgetSessionGuard`) and
writes it on order creation.

`null` means "ordered directly on `swiftfood.uk` without going through a
partner widget." This column enables:

- Per-partner reporting dashboards ("Halkin drove 42 orders this month").
- Per-partner commission calculations downstream.
- Abuse tracing — if a partner is being abused, we can see it in order
  patterns.

### Restaurant scoping enforcement

Every catering write endpoint (order creation, pricing verification)
checks that every `restaurantId` in the request body is in the partner's
`allowedRestaurantIds`. If not, return 403.

This is server-side enforcement; we cannot trust the frontend to only
show allowed restaurants. A malicious partner could pass any restaurant
ID; the backend must reject.

Read endpoints (menu search, bundle listing) filter by allowed
restaurants — no reject; just return the subset the partner is allowed to
see.

### Per-key rate limiting

`@nestjs/throttler` with a custom tracker keyed by `partnerId` (falling
back to IP for anonymous traffic). Default limit applies to everyone;
partner records can override via `partner.rateLimit`.

**Rationale.** One misbehaving or compromised partner shouldn't be able
to exhaust capacity for the others.

### Partner webhooks

Order lifecycle events (`created`, `paid`, `confirmed`, `completed`,
`cancelled`) emit a webhook to the partner's configured `webhookUrl`, if
set.

**Payload.**
```json
{
  "type": "order.paid",
  "orderId": "cat_abc123",
  "partnerId": "partner_xyz",
  "occurredAt": "2026-04-14T10:34:00Z",
  "data": { ...order summary... }
}
```

**Signing.** Every request includes `X-Swift-Signature:
t=<timestamp>,v1=<hmac>` where `hmac = HMAC-SHA256(secret, timestamp +
"." + body)`. Partners validate this to confirm the webhook came from
Swift.

**Reliability.** Webhooks are sent via a job queue (Bull / BullMQ — check
what the backend already uses) with retry-with-backoff on non-2xx. Dead
letters after N retries. This should use the same infrastructure as any
existing webhook work; we're not inventing a new queue.

**Rationale.** Partners need a reliable server-to-server channel for
order events. Relying solely on `onOrderComplete` firing in the browser
is fragile — the user may close the tab before it fires, or network may
drop. Webhooks are the source of truth for the partner's backend.

### Admin surface

Extend the existing admin dashboard with:

- Partner CRUD (create, edit, deactivate).
- API key CRUD under each partner (create, label, revoke).
- Allowed origins editor.
- Allowed restaurants selector.
- Webhook URL + secret rotation.
- Per-partner usage stats (orders, total revenue, API call volume —
  whatever is cheap to compute).

**Rationale.** Swift staff need to onboard partners and rotate keys
without filing tickets to engineering.

## Testing

- **Unit tests (widget).** Navigation state machine, storage
  namespacing, API client session-handling + 401 retry, context splits.
- **Component tests (widget).** Each major component (builder, checkout,
  modals) rendered with mock config context.
- **Integration tests (widget).** A minimal Vite harness app that
  imports the built package from `dist/`, embeds the widget, and walks
  the full flow against a staging backend. This verifies the *built*
  package, not just source.
- **Unit tests (backend).** Both guards, the `checkPartnerAllowedOrigin`
  function, webhook signing, rate-limit tracker.
- **Integration tests (backend).** `POST /widget/session` happy path and
  every failure mode (bad key, inactive key, bad origin, inactive
  partner). Order creation with partnerId attribution. Restaurant
  scoping rejection.
- **Manual.** Embed built package into a staging partner site. Walk
  complete flow: restaurant browse → menu → cart → contact → pay →
  confirmation → webhook delivered to partner's test endpoint.

## Rollout

Both layers must ship for a partner to use the widget, but they can be
built and deployed in stages.

1. **Backend — partner model, keys, guards, CORS, attribution.** Ships
   first. All existing endpoints continue to accept public-access
   requests; new widget-session path is additive. Zero impact on
   `swiftfood.uk`.
2. **Backend — webhooks, admin UI for partner management.** Lets us
   provision partners internally ahead of frontend availability.
3. **Frontend — extract widget into library, build pipeline, package
   publish to internal registry.** Not yet used by anyone.
4. **Frontend — dogfood on `swiftfood.uk`.** Rebuild
   `app/(public)/event-order` on top of the widget library. This proves
   parity and catches regressions. The main site now uses the same code
   path partners will.
5. **Pilot with one partner.** Provision them, provide the package and
   key, support integration, monitor orders and webhook deliveries.
6. **Widen.** Onboard additional partners. Add self-serve admin flows if
   volume justifies.
7. **Deprecate public-access fallback on backend.** Once all known
   callers use widget sessions, remove the dual-auth path and require
   session tokens universally.
