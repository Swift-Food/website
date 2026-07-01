# Stripe Connect Payouts — Partner Dashboard

**Date:** 2026-07-01
**Status:** Approved

## Summary

Add a Stripe Payouts settings card to the partner dashboard settings page (`CoworkingSettings`). Partners must complete Stripe Connect Express onboarding before their commission rate can be saved. The feature touches three files; no new files are created.

---

## Files Changed

| File | Change |
|---|---|
| `types/api/coworking.api.types.ts` | Add `stripeAccountId?` and `stripeOnboardingComplete?` to `CoworkingSpace`; add `PartnerStripeStatus` interface |
| `services/api/coworking.api.ts` | Add 5 Stripe API methods |
| `app/partners/dashboard/settings/CoworkingSettings.tsx` | Add `StripePayoutsSection` sub-component; pass props from parent; lock commission form when Stripe incomplete |

---

## Types

### `CoworkingSpace` additions

```ts
stripeAccountId?: string | null;
stripeOnboardingComplete?: boolean;
```

### New interface

```ts
export interface PartnerStripeStatus {
  complete: boolean;
  currentlyDue: string[];
  detailsSubmitted: boolean;
}
```

---

## API Methods (`coworkingApi`)

All calls go through `fetchWithAuth`. Base path: `/admin/partner-spaces/:spaceId/stripe-account`.

| Method | Signature | Endpoint |
|---|---|---|
| `createStripeAccount` | `(spaceId: string) => Promise<{ accountId: string; onboardingUrl: string }>` | `POST /admin/partner-spaces/:spaceId/stripe-account` |
| `getStripeStatus` | `(spaceId: string) => Promise<PartnerStripeStatus>` | `GET /admin/partner-spaces/:spaceId/stripe-account/status` |
| `refreshStripeOnboardingLink` | `(spaceId: string) => Promise<{ onboardingUrl: string }>` | `POST /admin/partner-spaces/:spaceId/stripe-account/refresh` |
| `getStripeDetails` | `(spaceId: string) => Promise<{ accountId: string; onboardingComplete: boolean; email: string \| null; payoutsEnabled: boolean; chargesEnabled: boolean }>` | `GET /admin/partner-spaces/:spaceId/stripe-account/details` |
| `getStripeBalance` | `(spaceId: string) => Promise<{ available: number; pending: number; currency: string }>` | `GET /admin/partner-spaces/:spaceId/stripe-account/balance` |

---

## `StripePayoutsSection` Component

### Props

```ts
interface StripePayoutsSectionProps {
  spaceId: string;
  stripeAccountId: string | null | undefined;
  stripeOnboardingComplete: boolean | undefined;
  onStripeComplete: () => void;
}
```

### State machine

**State 1 — No account** (`stripeAccountId == null`)

- Body: short description + primary "Set up Stripe payouts" button
- Click: calls `createStripeAccount(spaceId)`, shows spinner, then `window.location.href = onboardingUrl`
- Error: inline red error message if call fails

**State 2 — Account exists, onboarding incomplete** (`stripeAccountId != null && !stripeOnboardingComplete`)

- On mount: calls `getStripeStatus` to confirm current status
- If `getStripeStatus` returns `complete: true`, transitions directly to State 3 and calls `onStripeComplete`
- Body: amber info box (matches commission card's `border-amber-200 bg-amber-50 text-amber-800` pattern)
- Two buttons:
  - "Complete onboarding" — calls `refreshStripeOnboardingLink`, shows spinner, redirects to `onboardingUrl`
  - "I've completed onboarding — check status" — re-calls `getStripeStatus`; if complete, transitions to State 3 and calls `onStripeComplete`; otherwise shows "Not complete yet" error

**State 3 — Onboarding complete** (`stripeOnboardingComplete == true` or confirmed via `getStripeStatus`)

- On mount: calls `getStripeBalance`
- Body: green success indicator + balance display (£ available / £ pending); if balance fetch fails, show muted "Balance unavailable" in place of the figures (do not block the success state)
- Account ID shown below in `font-mono text-xs text-gray-400`
- No action buttons

### Card shell style

Matches existing cards: `overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm`

Header: `flex items-start gap-3 border-b border-gray-100 p-5 sm:p-6` with `CreditCard` icon (lucide-react) + title "Stripe payouts" + subtitle.

Buttons: `bg-primary hover:bg-primary/90` (matches rest of component). Secondary/ghost actions use `border border-gray-300 text-gray-700`.

### Icons needed

Add `CreditCard` to the existing lucide-react import in `CoworkingSettings.tsx`. All other icons (`Loader`, `AlertCircle`, `CheckCircle`, `ExternalLink`) are already imported.

---

## Commission Form Locking

When `!space?.stripeOnboardingComplete`:

1. Amber info note rendered at the **top of the commission card body** (above the current rate display): "Complete Stripe payouts setup to configure your commission rate."
2. Commission input: `disabled`
3. Save button: `disabled`

The parent `CoworkingSettings` passes the `onStripeComplete` callback to `StripePayoutsSection`. When called, the parent updates `space` local state: `setSpace(prev => prev ? { ...prev, stripeOnboardingComplete: true } : prev)`. This unlocks the commission form without a page refresh.

---

## Data Flow

```
CoworkingSettings
├── fetches space via coworkingApi.getSpace(spaceId) on mount
├── passes space?.stripeAccountId + space?.stripeOnboardingComplete to StripePayoutsSection
├── passes onStripeComplete callback to StripePayoutsSection
│
├── Commission card — disabled (input + save) when !space?.stripeOnboardingComplete
│
└── StripePayoutsSection
    ├── owns: loading state, error state, balance state, local stripeComplete state
    ├── on mount (State 2): calls getStripeStatus
    ├── on mount (State 3): calls getStripeBalance
    └── on completion confirmed: calls onStripeComplete → parent unlocks commission
```

---

## Out of Scope

- Removing/resetting the Stripe account (`DELETE` endpoint) — not exposed in the UI
- Full account details (`getStripeDetails`) — not used in the UI (balance is sufficient for State 3)
- Dashboard gating — no full-page gate; only the commission form save is locked
