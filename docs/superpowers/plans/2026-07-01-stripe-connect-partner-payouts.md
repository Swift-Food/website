# Stripe Connect Partner Payouts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Stripe Payouts card to the partner dashboard settings page, gating commission saves behind Stripe onboarding completion.

**Architecture:** Three files are modified; no new files are created. Types are extended first, then API methods are added, then the UI component is built in-place inside `CoworkingSettings.tsx`. The `StripePayoutsSection` sub-component owns all Stripe loading/error state and notifies the parent when onboarding completes so the commission form can unlock.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, DaisyUI, lucide-react, `fetchWithAuth` from `@/lib/api-client/auth-client`

---

## File Map

| File | Change |
|---|---|
| `types/api/coworking.api.types.ts` | Add `stripeAccountId?` + `stripeOnboardingComplete?` to `CoworkingSpace`; add `PartnerStripeStatus` interface |
| `services/api/coworking.api.ts` | Import `PartnerStripeStatus`; add 5 Stripe methods to `coworkingApi` |
| `app/partners/dashboard/settings/CoworkingSettings.tsx` | Add `CreditCard` to lucide import; add `StripePayoutsSection` sub-component (before `CoworkingSettings`); wire commission lock + render section in `CoworkingSettings` |

---

## Task 1: Extend types

**Files:**
- Modify: `types/api/coworking.api.types.ts`

- [ ] **Step 1: Add Stripe fields to `CoworkingSpace` and new interface**

In `types/api/coworking.api.types.ts`, add two optional fields to the `CoworkingSpace` interface (after `commission`) and add the new `PartnerStripeStatus` interface at the end of the file.

Replace the `CoworkingSpace` interface block:

```ts
export interface CoworkingSpace {
  id: string;
  name: string;
  slug: string;
  publishableKey?: string;
  isActive: boolean;
  contactEmail?: string;
  webhookUrl?: string;
  allowedOrigins?: string[];
  aiChatEnabled?: boolean;
  aiPipelineVariant?: string;
  commission: number; // % rate; 0 = no service fee
  stripeAccountId?: string | null;
  stripeOnboardingComplete?: boolean;
  availableRestaurants?: { id: string; restaurant_name: string }[];
  selectedRestaurants?: { id: string; restaurant_name: string }[];
  createdAt: string | Date;
  updatedAt: string | Date;
}
```

Append at the end of the file (after the `CoworkingOrderStatus` type):

```ts
// ============================================================================
// STRIPE
// ============================================================================

export interface PartnerStripeStatus {
  complete: boolean;
  currentlyDue: string[];
  detailsSubmitted: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/arnavvaish/Code/Swift/website && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or only pre-existing errors unrelated to these types).

- [ ] **Step 3: Commit**

```bash
git add types/api/coworking.api.types.ts
git commit -m "feat: add Stripe fields to CoworkingSpace and PartnerStripeStatus type"
```

---

## Task 2: Add Stripe API methods

**Files:**
- Modify: `services/api/coworking.api.ts`

All five methods call `/admin/partner-spaces/:spaceId/stripe-account` endpoints via `fetchWithAuth`.

- [ ] **Step 1: Update the import at the top of `coworking.api.ts`**

Replace:
```ts
import {
  DashboardOrderSummary,
  DashboardOrderDetail,
  CalendarDay,
  CoworkingMetrics,
  CoworkingSpace,
} from '@/types/api/coworking.api.types';
```

With:
```ts
import {
  DashboardOrderSummary,
  DashboardOrderDetail,
  CalendarDay,
  CoworkingMetrics,
  CoworkingSpace,
  PartnerStripeStatus,
} from '@/types/api/coworking.api.types';
```

- [ ] **Step 2: Add the 5 Stripe methods to `coworkingApi`**

Add the following block immediately before the closing `};` of the `coworkingApi` object (after the `getMetrics` method):

```ts
  // POST /admin/partner-spaces/:spaceId/stripe-account
  createStripeAccount: async (spaceId: string): Promise<{ accountId: string; onboardingUrl: string }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/partner-spaces/${spaceId}/stripe-account`, {
      method: 'POST',
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to create Stripe account');
    }
    return response.json();
  },

  // GET /admin/partner-spaces/:spaceId/stripe-account/status
  getStripeStatus: async (spaceId: string): Promise<PartnerStripeStatus> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/partner-spaces/${spaceId}/stripe-account/status`);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to fetch Stripe status');
    }
    return response.json();
  },

  // POST /admin/partner-spaces/:spaceId/stripe-account/refresh
  refreshStripeOnboardingLink: async (spaceId: string): Promise<{ onboardingUrl: string }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/partner-spaces/${spaceId}/stripe-account/refresh`, {
      method: 'POST',
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to get onboarding link');
    }
    return response.json();
  },

  // GET /admin/partner-spaces/:spaceId/stripe-account/details
  getStripeDetails: async (spaceId: string): Promise<{ accountId: string; onboardingComplete: boolean; email: string | null; payoutsEnabled: boolean; chargesEnabled: boolean }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/partner-spaces/${spaceId}/stripe-account/details`);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to fetch Stripe details');
    }
    return response.json();
  },

  // GET /admin/partner-spaces/:spaceId/stripe-account/balance
  getStripeBalance: async (spaceId: string): Promise<{ available: number; pending: number; currency: string }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/partner-spaces/${spaceId}/stripe-account/balance`);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to fetch Stripe balance');
    }
    return response.json();
  },
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add services/api/coworking.api.ts
git commit -m "feat: add Stripe Connect API methods to coworkingApi"
```

---

## Task 3: Add StripePayoutsSection component

**Files:**
- Modify: `app/partners/dashboard/settings/CoworkingSettings.tsx`

Add the `StripePayoutsSection` sub-component in `CoworkingSettings.tsx`, above the `CoworkingSettings` export. The component manages its own loading/error/balance state and notifies the parent when onboarding completes.

- [ ] **Step 1: Add `CreditCard` to the lucide-react import**

At the top of `CoworkingSettings.tsx`, replace:
```ts
import { Save, Loader, AlertCircle, CheckCircle, Info, Eye, EyeOff, Copy, Check, ExternalLink, Percent, KeyRound, Store, X, SlidersHorizontal, Search } from "lucide-react";
```

With:
```ts
import { Save, Loader, AlertCircle, CheckCircle, Info, Eye, EyeOff, Copy, Check, ExternalLink, Percent, KeyRound, Store, X, SlidersHorizontal, Search, CreditCard } from "lucide-react";
```

- [ ] **Step 2: Add the `StripePayoutsSection` component**

Insert the following block immediately before the `interface Props {` line (line 325):

```tsx
interface StripePayoutsSectionProps {
  spaceId: string;
  stripeAccountId: string | null | undefined;
  stripeOnboardingComplete: boolean | undefined;
  onStripeComplete: () => void;
}

const StripePayoutsSection = ({
  spaceId,
  stripeAccountId,
  stripeOnboardingComplete,
  onStripeComplete,
}: StripePayoutsSectionProps) => {
  const [localComplete, setLocalComplete] = useState(!!stripeOnboardingComplete);
  const [balance, setBalance] = useState<{ available: number; pending: number; currency: string } | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State 2 on mount: silently verify — backend may already be complete from Stripe redirect
  useEffect(() => {
    if (stripeAccountId && !localComplete) {
      coworkingApi.getStripeStatus(spaceId).then((s) => {
        if (s.complete) {
          setLocalComplete(true);
          onStripeComplete();
        }
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State 3: fetch balance whenever localComplete becomes true
  useEffect(() => {
    if (localComplete) {
      coworkingApi.getStripeBalance(spaceId)
        .then(setBalance)
        .catch(() => setBalanceError(true));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localComplete]);

  const handleSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const { onboardingUrl } = await coworkingApi.createStripeAccount(spaceId);
      window.location.href = onboardingUrl;
    } catch (err: any) {
      setError(err.message || "Failed to create Stripe account.");
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    setError("");
    try {
      const { onboardingUrl } = await coworkingApi.refreshStripeOnboardingLink(spaceId);
      window.location.href = onboardingUrl;
    } catch (err: any) {
      setError(err.message || "Failed to get onboarding link.");
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const s = await coworkingApi.getStripeStatus(spaceId);
      if (s.complete) {
        setLocalComplete(true);
        onStripeComplete();
      } else {
        setError("Onboarding is not complete yet. Please finish in Stripe and try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to check status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-start gap-3 border-b border-gray-100 p-5 sm:p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CreditCard size={18} />
        </span>
        <div>
          <h2 className="font-semibold tracking-tight text-gray-900">Stripe payouts</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Connect your Stripe account to receive payouts from catering orders.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {/* ── State 1 — No account ─────────────────────────────── */}
        {!stripeAccountId && !localComplete && (
          <>
            <p className="text-sm text-gray-600">
              Set up Stripe Connect to receive payouts directly to your bank account when catering orders are completed.
            </p>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleSetup}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
            >
              {loading ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Setting up…
                </>
              ) : (
                <>
                  <ExternalLink size={14} />
                  Set up Stripe payouts
                </>
              )}
            </button>
          </>
        )}

        {/* ── State 2 — Account exists, incomplete ─────────────── */}
        {stripeAccountId && !localComplete && (
          <>
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <p>
                Your Stripe account has been created but onboarding is incomplete. Complete onboarding to start receiving payouts and to unlock commission settings.
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
              >
                {loading ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>
                    <ExternalLink size={14} />
                    Complete onboarding
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Checking…
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    I&apos;ve completed onboarding — check status
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* ── State 3 — Complete ───────────────────────────────── */}
        {localComplete && (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle size={14} className="flex-shrink-0" />
              Stripe account connected and payouts enabled.
            </div>

            {!balance && !balanceError && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader size={14} className="animate-spin" />
                Loading balance…
              </div>
            )}

            {balance && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Available
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
                    £{balance.available.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Pending
                  </p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
                    £{balance.pending.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {balanceError && (
              <p className="text-sm text-gray-400">Balance unavailable</p>
            )}

            {stripeAccountId && (
              <p className="font-mono text-xs text-gray-400">{stripeAccountId}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/partners/dashboard/settings/CoworkingSettings.tsx
git commit -m "feat: add StripePayoutsSection component to partner settings"
```

---

## Task 4: Wire commission locking and render StripePayoutsSection

**Files:**
- Modify: `app/partners/dashboard/settings/CoworkingSettings.tsx`

This task wires the `StripePayoutsSection` into the page, adds the `onStripeComplete` callback, and gates the commission form behind Stripe completion.

- [ ] **Step 1: Add `handleStripeComplete` callback inside `CoworkingSettings`**

In the `CoworkingSettings` component body, add the following immediately after the `handleSaveCommission` function (after line 453):

```tsx
  const handleStripeComplete = () => {
    setSpace((prev) => (prev ? { ...prev, stripeOnboardingComplete: true } : prev));
  };
```

- [ ] **Step 2: Add `stripeGated` computed value**

After the existing `const currentRate = space?.commission ?? 0;` line, add:

```tsx
  const stripeGated = !space?.stripeOnboardingComplete;
```

- [ ] **Step 3: Add the Stripe gating note to the commission form body**

In the commission card, the body section starts with `<div className="p-5 sm:p-6">` (just before the `{/* Current rate hero */}` comment). Insert the gating note as the first child of that div:

Replace:
```tsx
        <div className="p-5 sm:p-6">
          {/* Current rate hero */}
```

With:
```tsx
        <div className="p-5 sm:p-6">
          {stripeGated && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <p>Complete Stripe payouts setup to configure your commission rate.</p>
            </div>
          )}
          {/* Current rate hero */}
```

- [ ] **Step 4: Disable the commission input when gated**

Replace:
```tsx
                  <input
                    id="commission-rate"
                    type="number"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-36 rounded-lg border border-gray-300 py-2.5 pl-3 pr-8 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
```

With:
```tsx
                  <input
                    id="commission-rate"
                    type="number"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    min="0"
                    max="100"
                    step="0.5"
                    disabled={stripeGated}
                    className="w-36 rounded-lg border border-gray-300 py-2.5 pl-3 pr-8 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    placeholder="0"
                  />
```

- [ ] **Step 5: Disable the save button when gated**

Replace:
```tsx
          <button
            type="submit"
            form="commission-form"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
          >
```

With:
```tsx
          <button
            type="submit"
            form="commission-form"
            disabled={saving || stripeGated}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
          >
```

- [ ] **Step 6: Render `StripePayoutsSection` at the bottom of the settings page**

Replace:
```tsx
      <RestaurantSelection
        spaceId={spaceId}
        available={space?.availableRestaurants ?? []}
        selected={space?.selectedRestaurants ?? []}
      />
    </div>
```

With:
```tsx
      <RestaurantSelection
        spaceId={spaceId}
        available={space?.availableRestaurants ?? []}
        selected={space?.selectedRestaurants ?? []}
      />

      <StripePayoutsSection
        spaceId={spaceId}
        stripeAccountId={space?.stripeAccountId}
        stripeOnboardingComplete={space?.stripeOnboardingComplete}
        onStripeComplete={handleStripeComplete}
      />
    </div>
```

- [ ] **Step 7: Verify TypeScript compiles with no new errors**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors.

- [ ] **Step 8: Commit**

```bash
git add app/partners/dashboard/settings/CoworkingSettings.tsx
git commit -m "feat: wire Stripe payouts section and gate commission form in partner settings"
```

---

## Manual Verification Checklist

After all tasks are complete, navigate to the partner settings page and verify:

- [ ] **State 1 (no account):** "Set up Stripe payouts" button is visible. Commission form shows amber note and input/save are disabled.
- [ ] **State 1 → redirect:** Clicking "Set up Stripe payouts" shows spinner and navigates to Stripe onboarding URL.
- [ ] **State 2 (incomplete):** Amber warning is shown. "Complete onboarding" and "check status" buttons are visible. Commission form still locked.
- [ ] **State 2 — check status (not complete):** "I've completed onboarding — check status" shows red error message when onboarding not done.
- [ ] **State 2 → State 3:** After completing Stripe onboarding, clicking "check status" transitions card to green success state and unlocks commission form instantly (no page refresh).
- [ ] **State 3 (complete):** Green success banner, balance figures shown, account ID in mono text. Commission input and save button are enabled.
- [ ] **Balance error:** If balance endpoint is unavailable, "Balance unavailable" text is shown (not a broken card).
