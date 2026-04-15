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
order), contact and delivery details, promo codes, and pricing. Payment
itself happens out of band — after the order is submitted, Swift
reviews it and sends the customer a Stripe payment link by email. The
widget does not handle payment. Partners get a plug-in catering channel without integrating dozens
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
- **In-widget payment.** Order submission does not take payment inline.
  Customers receive a payment link from Swift after the order is
  reviewed and confirmed, and pay on Swift's own site. The widget
  therefore does not embed Stripe Elements or any other payment UI.
  Corporate-user payment flows (saved cards, organization wallet) on
  `swiftfood.uk` are not exposed through the widget.
- **Partner self-serve onboarding.** Partners are provisioned by
  engineering calling the new `/admin/partners` endpoints directly
  (curl/Postman). An internal admin UI that consumes these endpoints,
  and any partner-facing self-serve signup flow, are later adds.
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
  validated `partnerId` in its payload, signed with a backend secret.
  Downstream endpoints don't need to re-check the origin; they just verify
  the JWT signature and read the claims.

### Flow

1. Widget mounts with the partner's publishable key as a prop.
2. On first API call, widget's internal client sends
   `POST /widget/session` with `{ publishableKey }` and the browser-attached
   `Origin` header.
3. Backend looks up the partner by publishable key, checks the `Origin`
   against the partner's allowed-origins list, and returns a signed JWT
   containing `{ partnerId, exp }` (30 min expiry).
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
  summary, submit bar. The file also contains a corporate-user Stripe
  Elements payment modal for same-session payment by logged-in corporate
  accounts; this is the only path that renders Stripe UI today, and it
  is not used by the default guest flow that the widget will ship.
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
  and immutable thereafter: `partnerId`, `theme`, `initialData`, and the
  host callbacks (`onOrderComplete`, `onError`, `onReady`).

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
  etc.). No payment endpoints — the widget does not take payment.
- Attach `Authorization: Bearer <widget-session-jwt>` to every request.
- Set the base URL from a compile-time constant that defaults to
  `https://api.swiftfood.uk` (overridable per build for staging).

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
stylesheet reads.

**Rationale.** Partners want the widget to feel like it belongs on their
site; we want a narrow, stable customization API rather than a fully open
style prop. Three tokens cover ~90% of branding needs.

#### 9. Peer dependencies and packaging

**Peer dependencies.** `react` (>=18), `react-dom` (>=18). Nothing else.

**Bundled dependencies.** Lucide icons, dayjs, `@react-pdf/renderer`,
Google Maps loader, `jwt-decode`.

**Build.** `tsup` (or Rollup) produces:
- `dist/index.mjs` (ESM)
- `dist/index.cjs` (CJS)
- `dist/index.d.ts` (types)
- `dist/styles.css` (compiled CSS)

Package exports declare all three entry points via the modern `exports`
field.

#### 10. Initial data prop for host-supplied pre-fill

**Today.** The order builder always starts empty. A user on
`swiftfood.uk/event-order` enters every field from scratch, including
event date, guest count, delivery address, and contact info.

**Proposed.** Add an optional `initialData` prop so partners can
pre-populate fields they already know. A typical use case is a venue that
already has the event's date, address, and primary contact on file —
there's no reason to force the user to re-type them.

```ts
interface InitialData {
  eventName?: string;
  eventDate?: string;        // ISO date, e.g. "2026-05-14"
  eventTime?: string;        // "19:00"
  guestCount?: number;
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    lat?: number;
    lng?: number;
  };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
  };
}
```

All fields are optional — partners supply only what they have. The widget
applies `initialData` to state **only on first mount** (when no persisted
order state exists in storage). If the user previously started an order
and refreshed, the persisted state wins and `initialData` is ignored.

**Rationale.**
- **User intent preservation.** If a user filled in half a form, closed
  the tab, and came back, clobbering their input with `initialData` on
  every re-render would be surprising and destructive.
- **Pre-fill, not lock.** The fields are editable after pre-fill; the
  widget does not enforce that the user keep the partner-supplied values.
  A "locked fields" feature would require UI-level changes and is not
  part of this phase.

#### 11. Public component

Single public export, intentionally small:

```tsx
interface OrderSummary {
  eventName?: string;
  eventDate: string;
  total: number;
  currency: string;
  itemCount: number;
  restaurants: { id: string; name: string }[];
  deliveryAddress: { line1: string; city: string; postcode: string };
  contactEmail: string;
}

interface CateringWidgetProps {
  publishableKey: string;
  theme?: Theme;
  initialData?: InitialData;
  onReady?: () => void;
  onOrderComplete?: (result: {
    orderId: string;
    accessToken: string;
    summary: OrderSummary;
  }) => void;
  onError?: (error: WidgetError) => void;
}

export function CateringWidget(props: CateringWidgetProps): JSX.Element;
```

That's the entire partner-facing surface. No factories, no adapters, no
builders.

**Why `summary` is included.** The partner's page may want to render a
thank-you view without making another API call — event name, total,
address, etc. The `summary` object carries just enough data for a
standalone confirmation screen. Partners that want the full order detail
view direct users to Swift's hosted view page using `accessToken`; the
widget itself does not handle post-order viewing.

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

#### Venue with known event details (pre-fill via `initialData`)

```tsx
"use client";
import { CateringWidget } from "@swift/catering-widget";
import "@swift/catering-widget/dist/styles.css";

export default function EventCateringPage({ event }: { event: Event }) {
  return (
    <CateringWidget
      publishableKey={process.env.NEXT_PUBLIC_SWIFT_KEY!}
      initialData={{
        eventName: event.name,
        eventDate: event.date,        // "2026-07-12"
        guestCount: event.expectedGuests,
        deliveryAddress: {
          line1: event.venue.line1,
          city: event.venue.city,
          postcode: event.venue.postcode,
        },
        contact: {
          name: event.organizer.name,
          email: event.organizer.email,
        },
      }}
      onOrderComplete={({ orderId }) => {
        window.location.href = `/events/${event.id}/catering/${orderId}`;
      }}
    />
  );
}
```

The widget opens with event, address, and contact fields populated from
the partner's booking system. The user can still edit any field.
`initialData` applies only on first mount — if the user already has an
order in progress (persisted state exists), it is preserved and
`initialData` is ignored.

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

- Handling payment — the widget submits the order and shows a
  confirmation message; payment happens later via a Stripe link Swift
  sends to the customer by email.
- Loading Google Maps — the widget loads the script internally for the
  address-autocomplete field.
- API calls — menu fetching, pricing preview, promo codes, order
  submission: all internal.
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

One new table, living alongside existing entities.

**`partner`**
- `id: uuid`
- `name: string` (internal label, e.g. "Halkin")
- `slug: string` (URL-safe, e.g. `halkin`)
- `contactEmail: string`
- `publishableKey: string` (indexed; format `pk_live_...`)
- `allowedOrigins: string[]` (e.g. `["https://events.halkin.com",
  "https://halkin.com"]`)
- `active: boolean`
- `createdAt`, `updatedAt`

One key per partner for MVP. Rotating a compromised key requires the
partner to update their env var and redeploy during a short maintenance
window; multi-key hot rotation is deferred until a partner needs it.

### Endpoints

**`POST /widget/session`** — new, the publishable-key handshake.
- Request body: `{ publishableKey: string }`
- Required header: `Origin` (automatically set by browsers)
- Logic:
  1. Look up `partner` by `publishableKey`. If not found or inactive,
     return 401.
  2. Check `Origin` is in `partner.allowedOrigins`. If not, return 403.
  3. Sign a JWT with `{ partnerId, exp: now + 30min }` using the
     backend's widget-session secret.
  4. Return `{ token: <jwt>, expiresAt: <iso> }`.
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
- On success, attaches `{ partnerId }` to `request.partner`.

**`WidgetSessionGuard`** (applied to all widget-accessible catering
endpoints)
- Extracts the JWT from the `Authorization: Bearer ...` header.
- Verifies signature and expiry.
- Attaches `{ partnerId }` to `request.partner`.
- Returns 401 on invalid or expired tokens so the widget knows to refresh.

**Backward compatibility and origin-scoped public access.** Existing
callers (the main `swiftfood.uk` site, admin dashboards) don't send
widget session tokens. Widget-accessible endpoints therefore accept one
of two paths, decided by the guard on every request:

```
IF Authorization has a valid widget session JWT:
    → allow, attach partnerId to request
ELSE IF no Authorization header:
    IF origin is Swift-internal (swiftfood.uk and admin origins):
        → allow as public, partnerId = null
    ELSE:
        → reject 401 (partner origins must authenticate via the widget)
ELSE (header present but invalid):
    → reject 401
```

The crucial rule: **the public-access path is open only to Swift's own
origins.** A request from any partner-registered origin must carry a
widget session token. Without this, a registered partner could skip the
widget and hit `/catering-orders` directly with no header, creating
orders with `partnerId = null` and avoiding attribution. CORS alone
doesn't protect against this (partner origins are allowed by CORS
precisely so their widget *can* talk to the backend); the guard does.

This dual-auth arrangement lets us ship the backend changes without
touching `swiftfood.uk` frontend code. The public-access path remains in
place until a later phase migrates the main site onto the widget
library, at which point the guard can enforce widget sessions
universally.

**Layer responsibilities.**
- **CORS** decides whether a browser is allowed to send the request at
  all, based on the request's origin. Enforced per-request, queries the
  partner table (see Dynamic CORS below).
- **Guard** decides, once the request arrives, whether it's
  authenticated enough to proceed and what `partnerId` to attribute it
  to. Reads the JWT and (for no-auth requests) the origin.

Both layers are needed: CORS keeps unregistered origins out of the
system entirely; the guard distinguishes Swift-internal traffic from
partner traffic among the origins CORS lets through.

**Worked examples.**

*Example 1 — Partner using the widget correctly (`halkin.com`).*
1. Widget mounts on `halkin.com/catering` with `pk_live_halkin`.
2. `POST /widget/session`: CORS check finds `halkin.com` in
   `partner.allowedOrigins` → passes. Handshake validates key + origin
   → returns JWT with `partnerId = halkin`.
3. `POST /catering-orders` with `Authorization: Bearer <jwt>`: CORS
   passes (same reason). Guard sees valid JWT → attaches
   `partnerId = halkin`. Order saved with `partnerId = halkin`.

*Example 2 — Swift's own site (`swiftfood.uk/event-order`).*
1. User submits order from the main site. Frontend sends
   `POST /catering-orders` with no `Authorization` header.
2. CORS check finds `swiftfood.uk` in the Swift-internal list → passes.
3. Guard sees no header → checks origin → Swift-internal → allows as
   public. Order saved with `partnerId = null`. Main site code is
   unchanged from today.

*Example 3 — Attacker: registered partner tries to skip the widget.*
A dev at Halkin writes a script in their partner site that calls
`POST /catering-orders` directly, without embedding the widget, hoping
to create orders with `partnerId = null` to dodge attribution.
1. Request goes out from `halkin.com` with no `Authorization` header.
2. CORS passes (Halkin's origin is registered).
3. Guard sees no header → checks origin → `halkin.com` is **not**
   Swift-internal → rejects with `401`.

The guard's origin check is what prevents this. CORS alone would let
the request through, because Halkin's origin has to be allowed for the
legitimate widget path to work; the guard is what enforces "if you're a
partner origin, you must authenticate."

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

### Rate limiting on the handshake

A blanket rate limit on `POST /widget/session` (e.g. 60 requests per
minute per publishable key, IP-scoped as fallback) to prevent
token-minting abuse. Other catering endpoints rely on whatever global
throttling already exists on the backend.

**Rationale.** The handshake endpoint is the only new attack surface
introduced by this design; everything else reuses existing endpoints.
Per-partner rate-limit overrides are deferred — if one partner
legitimately needs a higher ceiling later, add the customization then.

### Partner management endpoints

New admin-only endpoints for managing partner records. All are protected
by the existing admin auth guard used by the current admin dashboard
(restaurant-owner/admin JWT or whatever the dashboard already uses — not
the widget session token).

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/admin/partners` | Create a new partner. Generates `publishableKey` on the server and returns it in the response (one-time view). |
| `GET` | `/admin/partners` | List partners (paginated). |
| `GET` | `/admin/partners/:id` | Get a single partner's details. |
| `PATCH` | `/admin/partners/:id` | Edit name, contactEmail, allowedOrigins, active flag. |
| `POST` | `/admin/partners/:id/regenerate-key` | Rotate the `publishableKey`. Returns the new key once. |
| `DELETE` | `/admin/partners/:id` | Soft-delete (sets `active: false`). Order attribution history is preserved; the partner simply stops being able to authenticate. |

These endpoints give Swift staff (and a future admin UI) a complete
CRUD surface. In the MVP, the endpoints exist but are called via
`curl`/Postman by engineering when onboarding a partner. The generated
publishable key is shared with the partner out of band (e.g. 1Password).

Implementation note: a Swift-internal admin dashboard page that consumes
these endpoints — forms for create/edit, a partner list with
deactivate/regenerate buttons — is out of scope for this phase. It
should be added to the existing admin dashboard as a follow-up when
partner volume justifies it. The backend work is complete without it.

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
  function.
- **Integration tests (backend).** `POST /widget/session` happy path and
  every failure mode (bad key, inactive key, bad origin, inactive
  partner). Order creation with partnerId attribution. `/admin/partners`
  CRUD endpoints with admin auth required.
- **Manual.** Embed built package into a staging partner site. Walk
  complete flow: restaurant browse → menu → cart → contact → pay →
  confirmation.

## Rollout

Both layers must ship for a partner to use the widget, but they can be
built and deployed in stages.

1. **Backend — partner model, guards, CORS, attribution.** Ships first.
   All existing endpoints continue to accept public-access requests; new
   widget-session path is additive. Zero impact on `swiftfood.uk`.
2. **Frontend — extract widget into library, build pipeline, package
   publish to internal registry.** Not yet used by anyone.
3. **Pilot with one partner.** Provision via the `/admin/partners`
   endpoints, provide the package and key, support integration, monitor
   orders. The main `swiftfood.uk` site continues to render the original
   `lib/components/catering/*` code untouched.
4. **Widen.** Onboard additional partners. Build internal admin UI
   consuming the `/admin/partners` endpoints when volume justifies.
5. **Later — migrate `swiftfood.uk/event-order` onto the widget library.**
   Rebuild the main site's event-order page to render `<CateringWidget>`
   so there is one code path for Swift and for partners. Not part of
   this phase.
6. **Deprecate public-access fallback on backend.** Once the main site
   has migrated and all known callers use widget sessions, remove the
   dual-auth path and require session tokens universally.

## Partner developer flow — start to first order

Here's what a partner dev actually does, end to end.

### 1. Swift provisions them (one-time, happens before the dev starts)

- Swift staff hit `POST /admin/partners` with the partner's info: name, contact, `allowedOrigins` (e.g. `["https://halkin.com", "https://staging.halkin.com", "http://localhost:3000"]`).
- Backend creates the row and returns a generated `publishableKey` (e.g. `pk_live_abc123xyz`).
- Swift shares the key with the partner via 1Password / secure email.

The dev starts at step 2 with a publishable key in hand.

### 2. Install the package

In their project:

```bash
npm install @swift/catering-widget
```

That's one line. NPM pulls the compiled package from the registry.

### 3. Add the publishable key to their env

They store the key wherever they keep config. For a Next.js app:

```bash
# .env.local
NEXT_PUBLIC_SWIFT_KEY=pk_live_abc123xyz
```

For Vite: `VITE_SWIFT_KEY=...`. For plain React: whatever their env pattern is.

The key is public (ships in the browser bundle) — the `NEXT_PUBLIC_` / `VITE_` prefix is just the framework convention for "bundle this into the client." This is intentional and safe; the backend's origin check and widget session handshake protect against misuse.

### 4. Render the component

They create a page (anywhere they want the catering flow to live):

```tsx
// app/catering/page.tsx  (Next.js example)
"use client";
import { CateringWidget } from "@swift/catering-widget";
import "@swift/catering-widget/dist/styles.css";  // one-time CSS import
import { useRouter } from "next/navigation";

export default function CateringPage() {
  const router = useRouter();

  return (
    <CateringWidget
      publishableKey={process.env.NEXT_PUBLIC_SWIFT_KEY!}
      onOrderComplete={({ orderId }) => {
        router.push(`/thanks?order=${orderId}`);
      }}
      onError={(err) => console.error(err)}
    />
  );
}
```

Done. That's a working integration.

### 5. Run locally

```bash
npm run dev
```

- Partner's dev server starts (e.g. `localhost:3000`).
- They visit `/catering`.
- Widget mounts → fires `POST /widget/session` with their publishable key.
- Backend validates key + checks `Origin: http://localhost:3000` is in their `allowedOrigins` → issues a JWT.
- Widget fetches menu, user browses, builds an order, reaches checkout, pays.
- `onOrderComplete` fires → their router pushes to `/thanks`.

First order placed against staging, end-to-end, in roughly 10 minutes from `npm install`.

### 6. Optional: add pre-fill and theming

If the partner has event context already (e.g. a venue page with a known event):

```tsx
<CateringWidget
  publishableKey={process.env.NEXT_PUBLIC_SWIFT_KEY!}
  theme={{ primary: "#ff5a1f", radius: "8px" }}
  initialData={{
    eventName: event.name,
    eventDate: event.date,
    deliveryAddress: { line1: event.venue.line1, city: event.venue.city, postcode: event.venue.postcode },
    contact: { name: event.organizer.name, email: event.organizer.email },
  }}
  onOrderComplete={({ orderId }) => router.push(`/orders/${orderId}`)}
/>
```

### 7. Deploy to production

- They build their app normally (`npm run build`).
- They deploy to their host (Vercel, Netlify, their own infra — doesn't matter).
- Make sure the production origin (`https://halkin.com`) is in the partner record's `allowedOrigins` list on Swift's side. If it was added at provisioning time, nothing to do.
- First request from production goes through: widget session handshake validates origin → widget works in prod.

### 8. Ongoing

- **Updates:** `npm update @swift/catering-widget` pulls new versions. Semver rules apply (patch = bug fixes, minor = new features backward compatible, major = breaking).
- **New origins:** partner wants to embed on a new subdomain? They ask Swift to add the origin to their partner record. No code change, no redeploy on Swift's side beyond the SQL / admin-endpoint call.
- **Key rotation:** Swift regenerates key via `POST /admin/partners/:id/regenerate-key`, partner updates their env var, redeploys. Brief maintenance window while old key becomes invalid.

## Summary

From the partner dev's perspective, the whole integration is:

1. `npm install @swift/catering-widget`
2. Put key in env
3. Render `<CateringWidget>` with a publishable key and an `onOrderComplete` handler
4. Deploy

Four steps. Nothing else on their end — no payment integration, no Google Maps script, no API client, no state management, no session handling. The widget is a sealed unit; they plug in a key and a callback and it works.
