# Event-Order → Catering Widget Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the in-tree custom catering ordering flow at `app/(public)/event-order/` with the published `@swift-food-services/catering-widget` package, while preserving (a) the restaurant portal's use of `services/api/catering.api.ts`, (b) post-order share/dashboard token routes, and (c) the `swiftfood.uk/event-order` URL.

**Architecture:** The widget is a self-contained client React component that handles menu browsing, cart, contact details, and Stripe checkout against `api.swiftfood.uk`. On this site it mounts at the existing `/event-order` path inside a thin client wrapper that measures the host navbar for `stickyTopOffset` and forwards `onOrderComplete` / `onError`. The widget owns its own state, styling (prebuilt `styles.css`), and API client — so `context/CateringContext.tsx`, `context/CateringFilterContext.tsx`, and customer-facing components under `lib/components/catering/` (except `dashboard/` and `modals/PdfDownloadModal.tsx`, which the surviving token routes still need) are deleted. The restaurant-portal-facing exports from `services/api/catering.api.ts` and `types/catering.types.ts` stay untouched.

**Tech Stack:** Next.js 16 App Router, React 19, `@swift-food-services/catering-widget@beta` (currently `0.1.0-beta.11`), Tailwind 4, DaisyUI 5.

**Scope exclusions (deliberate):**
- The two post-order routes `app/(public)/event-order/menu/[token]/page.tsx` and `app/(public)/event-order/view/[token]/page.tsx` remain in place. They are share/dashboard views, not part of the build-order flow that the widget covers.
- Restaurant portal pages (`app/restaurant/**`) and their use of `cateringService` / `types/catering.types.ts` are not changed.
- No backend changes. The widget calls `api.swiftfood.uk` directly via its baked-in base URL.

---

## Pre-flight reference

**Env vars (already defined in this project):**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SWIFT_CATERING_PUBLISHABLE_KEY` — pass to widget's `publishableKey` prop
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — pass to widget's `googleMapsApiKey` prop

**Widget public API (from `dist/index.d.ts`):**
```ts
interface CateringWidgetProps {
  publishableKey: string;
  googleMapsApiKey: string;
  baseUrl?: string;
  theme?: Theme;
  initialData?: InitialData;
  allowedCateringTimes?: AllowedCateringTimes;
  stickyTopOffset?: number;
  onReady?: () => void;
  onOrderComplete?: (result: OrderCompleteResult) => void;
  onOrderCompleteDelaySeconds?: number;
  onError?: (error: WidgetError) => void;
}
```

**Reference host implementation:** `/Users/thadoos/Coding/AllRestaurantApps/catering-widget/examples/next-app/app/catering/page.tsx`.

**Files retained (do not delete):**
- `services/api/catering.api.ts` — used by `app/restaurant/**`, `services/business/order-submission.service.ts`, `lib/components/restaurant-promotion/**`, `lib/components/modals/CorporateLoginModal.tsx`, `app/(public)/menu/MenuClient.tsx`, and the two surviving token routes.
- `types/catering.types.ts` — same reason.
- `lib/components/catering/dashboard/**` — consumed by `event-order/view/[token]/page.tsx`.
- `lib/components/catering/modals/PdfDownloadModal.tsx` — consumed by both token routes.
- `lib/components/pdf/CateringMenuPdf.tsx` and `lib/utils/menuPdfUtils.ts` — same reason.

**Files to delete (customer build-flow only):**
- `app/(public)/event-order/EventOrderClient.tsx`
- `context/CateringContext.tsx`
- `context/CateringFilterContext.tsx`
- `lib/components/catering/ActiveSessionPanel.tsx`
- `lib/components/catering/AllMealSessionsItems.tsx`
- `lib/components/catering/BundleBrowser.tsx`
- `lib/components/catering/BundleCard.tsx`
- `lib/components/catering/CategoryMenuBrowser.tsx`
- `lib/components/catering/catering-order-helpers.ts`
- `lib/components/catering/CateringFilterModal.tsx`
- `lib/components/catering/CateringFilterRow.tsx`
- `lib/components/catering/CateringOrderBuilder.tsx`
- `lib/components/catering/CheckoutBar.tsx`
- `lib/components/catering/DateSessionNav.tsx`
- `lib/components/catering/EventPhotosDisplay.tsx`
- `lib/components/catering/Menu.tsx`
- `lib/components/catering/MenuBrowserColumn.tsx`
- `lib/components/catering/MenuCatalogue.tsx`
- `lib/components/catering/MenuItemCard.tsx`
- `lib/components/catering/MenuItemModal.tsx`
- `lib/components/catering/RestaurantCatalogue.tsx`
- `lib/components/catering/RestaurantMenuBrowser.tsx`
- `lib/components/catering/SelectedItemsByCategory.tsx`
- `lib/components/catering/SessionAccordion.tsx`
- `lib/components/catering/SessionEditor.tsx`
- `lib/components/catering/Step2MenuItems.tsx`
- `lib/components/catering/Step3ContactDetails.tsx`
- `lib/components/catering/TimeSlotDropdown.tsx`
- `lib/components/catering/TutorialTooltip.tsx`
- `lib/components/catering/types.ts`
- `lib/components/catering/ViewOrderModal.tsx`
- `lib/components/catering/contact/**` (used only by `Step3ContactDetails`)
- `lib/components/catering/hooks/useCateringData.ts` and any sibling hooks not referenced by `dashboard/` or token routes
- `lib/components/catering/modals/SwapItemModal.tsx` and any other modals not referenced by the surviving routes
- `lib/utils/catering-min-order-validation.ts`
- `features/contact-details/**` (transitive — only used by `Step3ContactDetails`)
- `services/business/order-submission.service.ts` (transitive — only used by the customer flow)

The exact deletion set is verified by grep in Task 5.

---

## File map

**Created:**
- (none — all changes are edits or deletions)

**Modified:**
- `package.json` — add `@swift-food-services/catering-widget` dependency.
- `.env.example` — document the new public env var if a `.env.example` exists. (If absent, skip — do not create one.)
- `app/(public)/event-order/EventOrderClient.tsx` — rewrite as a thin wrapper around `<CateringWidget>`.

The widget bundles its CSS via tsup's `injectStyle: true` and injects a `<style>` tag at runtime when the module loads — no `dist/styles.css` import is needed by the consumer. (The `"./dist/styles.css"` package export exists as an opt-in for advanced consumers who want SSR-safe styles; ignore it for this integration.)

**Deleted:** see the list above.

---

## Task 1: Install the widget package

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the package**

Run from repo root:
```bash
npm install @swift-food-services/catering-widget@beta
```

Expected: `package.json` gains `"@swift-food-services/catering-widget": "^0.1.0-beta.11"` (or newer beta) under `dependencies`. `package-lock.json` updates.

- [ ] **Step 2: Confirm peer deps are satisfied**

Run:
```bash
npm ls react react-dom
```
Expected: both resolve to a single 19.x version (no peer-dep warnings about React).

- [ ] **Step 3: Verify the type entry resolves**

Run:
```bash
node -e "console.log(require.resolve('@swift-food-services/catering-widget'))"
```
Expected: prints a path under `node_modules/@swift-food-services/catering-widget/dist/`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @swift-food-services/catering-widget dependency"
```

---

## Task 2: Build the new event-order client wrapper

The widget needs the host navbar height to position its sticky header correctly. This mirrors the reference implementation in `catering-widget/examples/next-app/app/catering/page.tsx`. The wrapper is a client component because it uses `useLayoutEffect` and `useRef`.

The host site uses `lib/components/navbar`. We must measure that navbar at runtime. Reading the existing navbar code is required to find the right DOM node — if the navbar is rendered inside `app/layout.tsx` and the wrapper can't get a ref to it, fall back to reading `--navbar-height` from CSS or hardcoding via a measured value, but try the ref approach first by reading the navbar component to confirm whether it sets a stable id/class on its outer element.

**Files:**
- Modify: `app/(public)/event-order/EventOrderClient.tsx` (rewrite contents — keeping the filename so the page.tsx import doesn't change)

- [ ] **Step 1: Inspect the host navbar to find a selector**

Run:
```bash
head -40 /Users/thadoos/Coding/AllRestaurantApps/website/lib/components/navbar/index.tsx 2>/dev/null || head -40 /Users/thadoos/Coding/AllRestaurantApps/website/lib/components/navbar.tsx
```
Note the outer element's tag and any stable class/id. If none exists, the next step adds one.

- [ ] **Step 2: If needed, add a stable selector to the navbar**

If the navbar's outer element has no usable selector (no id, no stable class), add `id="site-navbar"` to its outermost `<nav>` or `<header>`. Commit this separately so the diff stays small. Skip if a selector already exists.

```bash
git add lib/components/navbar/...
git commit -m "chore: tag site navbar for height measurement"
```

- [ ] **Step 3: Replace `EventOrderClient.tsx` contents**

Open `app/(public)/event-order/EventOrderClient.tsx` and replace the entire file with:

```tsx
"use client";

import { useLayoutEffect, useState } from "react";
import { CateringWidget } from "@swift-food-services/catering-widget";

const NAVBAR_SELECTOR = "#site-navbar"; // adjust to whatever Step 1/2 settled on

export default function EventOrderClient() {
  const [navHeight, setNavHeight] = useState(0);

  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(NAVBAR_SELECTOR);
    if (!el) return;
    const measure = () => setNavHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <CateringWidget
      publishableKey={process.env.NEXT_PUBLIC_SWIFT_CATERING_PUBLISHABLE_KEY!}
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
      stickyTopOffset={navHeight}
      theme={{
        primary: "#bd2429",
      }}
      onOrderCompleteDelaySeconds={0}
      onOrderComplete={({ accessToken }) => {
        if (accessToken && typeof window !== "undefined") {
          window.location.href = `/event-order/view/${accessToken}`;
        }
      }}
      onError={(e) => {
        console.error("catering widget error", e);
      }}
    />
  );
}
```

Notes:
- The `theme.primary` value `#bd2429` is the site's existing catering accent (from the example app). If the site has a brand token defined elsewhere, swap it in — search `tailwind.config.ts` / `globals.css` for an existing primary value before hardcoding.
- `onOrderComplete` redirects to `/event-order/view/{accessToken}` using the `accessToken` field from `OrderCompleteResult` (confirmed shape: `{ orderId, accessToken, summary }`). If the token is missing for any reason the redirect is skipped and the widget's built-in success screen takes over — see Task 3 for the verification.

- [ ] **Step 4: Confirm `page.tsx` still resolves**

`app/(public)/event-order/page.tsx` imports `EventOrderClient` as default. Open it and confirm no changes are needed — the import path and default export are unchanged.

Run:
```bash
npx tsc --noEmit
```
Expected: no type errors.

- [ ] **Step 5: Manual smoke test**

```bash
npm run dev
```
Open `http://localhost:3000/event-order`. Expected:
- The widget renders below the site navbar.
- Scrolling: the widget's internal sticky header (cart bar / step bar) stops at the bottom of the navbar, not behind it.
- DevTools console shows no errors.
- The Network tab shows requests going to `api.swiftfood.uk` (the widget's baked-in base URL).

If the widget renders but `stickyTopOffset` is wrong, revisit the selector in `NAVBAR_SELECTOR`.

- [ ] **Step 6: Commit**

```bash
git add app/(public)/event-order/EventOrderClient.tsx
git commit -m "feat: mount catering widget at /event-order"
```

---

## Task 3: Verify the `onOrderComplete` → `/event-order/view/[token]` redirect end-to-end

The widget's `OrderCompleteResult` is `{ orderId: string; accessToken: string; summary: OrderSummary }` (confirmed in `dist/index.d.ts`). The redirect uses `accessToken`. This task only confirms that `accessToken` is the same token the existing `view/[token]` route loads via `cateringService`.

- [ ] **Step 1: Confirm `view/[token]` resolves `accessToken`**

```bash
head -80 /Users/thadoos/Coding/AllRestaurantApps/website/app/\(public\)/event-order/view/\[token\]/page.tsx
```

Expected: the page reads `params.token` and passes it to a `cateringService` method that fetches an order by share/access token. If the route instead expects an order id or a different token format, the redirect's fallback (no redirect) kicks in and the widget's own success screen handles the UX — no code change needed unless we want to wire the route up to `accessToken` specifically.

- [ ] **Step 2: End-to-end test**

Place a real test order through the widget on `http://localhost:3000/event-order`. After checkout, the wrapper should redirect to `/event-order/view/<accessToken>` and the page should render the order. Confirm:
- The redirect fires.
- The view page loads the order without 404 / auth errors.
- Browser back-button behavior is sane (back to the widget or to the homepage — either is acceptable).

- [ ] **Step 3: If the view route can't resolve `accessToken`**

Two paths, pick one:
- **(a) Drop the redirect.** Change the `onOrderComplete` body to `() => {}` (or only log analytics). The widget's built-in success state is the post-order UI.
- **(b) Wire the route to `accessToken`.** If `cateringService` already supports lookup by access token but under a different method name, point the view page at it. Do not extend the backend.

Default: (a). Don't grow the API surface for this.

- [ ] **Step 4: Commit (if changes were made)**

```bash
git add app/(public)/event-order/EventOrderClient.tsx app/(public)/event-order/view/\[token\]/page.tsx
git commit -m "fix: align catering widget onOrderComplete with site routes"
```

---

## Task 4: Delete customer-flow code, batch 1 — pages & contexts

This task and the next are split so the diffs stay readable. Each deletion batch ends with a typecheck + grep to confirm no dangling imports.

**Files (deleted):**
- `context/CateringContext.tsx`
- `context/CateringFilterContext.tsx`
- `features/contact-details/**` (entire subtree)
- `services/business/order-submission.service.ts`

- [ ] **Step 1: Confirm zero remaining customer-flow consumers of CateringContext**

```bash
grep -rln "from \"@/context/CateringContext\"\|from \"@/context/CateringFilterContext\"" \
  /Users/thadoos/Coding/AllRestaurantApps/website --include="*.ts" --include="*.tsx" \
  | grep -v "/lib/components/catering/" \
  | grep -v "\.next"
```
Expected: empty output. (Files inside `lib/components/catering/` are deleted in Task 5, so consumers there don't count.) If anything else shows up, stop and investigate before deleting.

- [ ] **Step 2: Delete the contexts and dependent feature folder**

```bash
git rm context/CateringContext.tsx context/CateringFilterContext.tsx
git rm -r features/contact-details
git rm services/business/order-submission.service.ts
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```
Expected: errors only from files inside `lib/components/catering/` (which import the deleted contexts). Those files are deleted in Task 5. **No errors from anywhere else.**

If errors appear outside `lib/components/catering/`, stop and either (a) remove the additional consumer, or (b) revert and reassess.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove catering customer-flow contexts and contact services"
```

---

## Task 5: Delete customer-flow code, batch 2 — components

**Files (deleted):** all of `lib/components/catering/` except `dashboard/` and `modals/PdfDownloadModal.tsx`, plus `lib/utils/catering-min-order-validation.ts`.

- [ ] **Step 1: List what's currently there**

```bash
ls lib/components/catering/
ls lib/components/catering/modals/
ls lib/components/catering/hooks/
```

- [ ] **Step 2: For each file, confirm it is *not* referenced by `dashboard/`, by either token route, or by `lib/components/pdf/`**

```bash
for f in $(find lib/components/catering -maxdepth 1 -type f); do
  base="${f##*/}"
  name="${base%.*}"
  refs=$(grep -rln "from \"@/lib/components/catering/${name}\"\|from \"\\./${name}\"\|from \"\\./\\.\\./catering/${name}\"" \
    app/\(public\)/event-order/menu \
    app/\(public\)/event-order/view \
    lib/components/catering/dashboard \
    lib/components/pdf 2>/dev/null)
  if [ -n "$refs" ]; then
    echo "KEEP: $f (referenced by: $refs)"
  else
    echo "DELETE: $f"
  fi
done
```

Expected: only `dashboard/` files (handled separately) and `modals/PdfDownloadModal.tsx` are flagged KEEP. Everything else is DELETE.

If any unexpected file is flagged KEEP, investigate before deleting it. If a file is unexpectedly flagged DELETE that you thought was needed, the grep missed an alias — broaden the pattern.

- [ ] **Step 3: Delete the flagged files**

Run a `git rm` for each file the script printed as `DELETE`. Also delete subtrees not in the keep list:

```bash
# Definitely safe to remove wholesale:
git rm -r lib/components/catering/contact

# Hooks: only delete if grep above showed no references from kept files.
# Inspect lib/components/catering/hooks/ and remove only the customer-flow hooks.
ls lib/components/catering/hooks/
# Then for each hook file confirmed unused, `git rm` it.

# Modals (keep PdfDownloadModal.tsx):
ls lib/components/catering/modals/
# For each modal file other than PdfDownloadModal.tsx, confirm via grep, then git rm.

# Min-order validation util:
git rm lib/utils/catering-min-order-validation.ts
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit
```
Expected: clean. If errors appear, they point to either (a) a kept file that imports a deleted file (revisit the keep list), or (b) a non-customer-flow consumer we missed.

- [ ] **Step 5: Lint**

```bash
npm run lint
```
Expected: clean.

- [ ] **Step 6: Build**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: remove catering customer-flow components"
```

---

## Task 6: Smoke-test the surviving token routes

Confirm that the post-order pages still work after the deletions.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Hit the view route with a known order token**

Use a real share token from a prior order (ask the user for one if needed). Open `http://localhost:3000/event-order/view/<token>`. Expected:
- Page renders with order status, items, delivery info.
- No console errors related to missing imports.

- [ ] **Step 3: Hit the menu route**

Open `http://localhost:3000/event-order/menu/<token>` with the same token. Expected: full-menu view renders, PDF download button works.

- [ ] **Step 4: If either route is broken**

The deletion in Task 5 was too aggressive. Identify the missing import from the console / build error, then either (a) restore the file from `git`, or (b) decide the route should be deleted too and consult the user before proceeding.

- [ ] **Step 5: Commit any restorations**

```bash
git add -A
git commit -m "fix: restore catering components needed by token routes"
```

(Skip if nothing was restored.)

---

## Task 7: Final verification

- [ ] **Step 1: Full typecheck + lint + build**

```bash
npx tsc --noEmit && npm run lint && npm run build
```
All three must pass.

- [ ] **Step 2: End-to-end widget flow on a fresh build**

```bash
npm run start
```
Open `http://localhost:3000/event-order`. Place a test order from start to finish (browse menus, add items, fill contact details, complete Stripe checkout in test mode). Confirm:
- Sticky offset is correct under the navbar.
- Order completes successfully.
- Post-order behavior matches the decision made in Task 3.

- [ ] **Step 3: Check the restaurant portal still works**

Open `http://localhost:3000/restaurant/dashboard` (logged in as a restaurant). Verify:
- Dashboard loads order list (uses `cateringService`).
- Menu CRUD pages render.
- No console errors.

- [ ] **Step 4: Final commit (if any fixups were made above)**

If Step 1–3 surfaced issues, fix them and commit. Otherwise skip.

---

## Risks & open questions

These are flagged here, not in tasks, because they require judgment in the moment:

1. **CSS layer conflicts.** The widget auto-injects its compiled DaisyUI 5 + Tailwind 4 stylesheet (via tsup `injectStyle: true`) when the module loads. The host site is also Tailwind 4 + DaisyUI 5. If host global styles override widget styles or vice versa (e.g. a `*` reset, a body font), the widget will look subtly wrong inside this site. Mitigation: the widget scopes everything under `.swift-catering-widget`, so this should not happen — but verify on Task 2 Step 5.

2. **Stripe key mismatch.** The widget calls Stripe via its own bundled `@stripe/stripe-js`. The site's `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is not passed to the widget directly — the widget's checkout is initiated server-side by `api.swiftfood.uk` and the publishable key is returned with the checkout intent. There is nothing to wire here on the site, but confirm Stripe checkout succeeds end-to-end in Task 7.

3. **Theme primary color.** The placeholder `#bd2429` from the example may not be Swift's brand red. Before merging, replace with the site's actual primary token (check `app/globals.css` and `tailwind.config.ts`).

4. **`accessToken` ↔ view route compatibility.** The widget's `OrderCompleteResult.accessToken` is the redirect target. Task 3 confirms the existing `view/[token]` route can resolve it. If not, the fallback (no redirect, widget shows its own success state) is a graceful degradation — not a blocker.

5. **Stale imports in seemingly unrelated files.** A few non-catering files (`lib/components/modals/CorporateLoginModal.tsx`, `lib/components/restaurant-promotion/*`, `lib/components/pdf/PdfDownloadButton.tsx`) import from `services/api/catering.api.ts` or `types/catering.types.ts`. These imports stay. If Task 5's typecheck flags them, it means a deletion was overreach — revisit the keep list, do not edit those files.
