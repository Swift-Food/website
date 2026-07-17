"use client";

import { useState, useEffect } from "react";
import { Save, Loader, AlertCircle, CheckCircle, Info, Eye, EyeOff, Copy, Check, ExternalLink, Percent, KeyRound, Store, X, SlidersHorizontal, Search, CreditCard } from "lucide-react";
import { coworkingApi } from "@/services/api/coworking.api";
import { CoworkingSpace } from "@/types/api/coworking.api.types";

interface RestaurantSelectionProps {
  spaceId: string;
  available: { id: string; restaurant_name: string }[];
  selected: { id: string; restaurant_name: string }[];
}

interface RestaurantSelectModalProps {
  available: { id: string; restaurant_name: string }[];
  initialSelected: Set<string>;
  onClose: () => void;
  onApply: (ids: Set<string>) => void;
}

const RestaurantSelectModal = ({
  available,
  initialSelected,
  onClose,
  onApply,
}: RestaurantSelectModalProps) => {
  const [draft, setDraft] = useState<Set<string>>(() => new Set(initialSelected));
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? available.filter((r) => r.restaurant_name.toLowerCase().includes(q))
    : available;

  const toggle = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk actions apply to the current matches, so they stay useful while filtering.
  const selectAll = () =>
    setDraft((prev) => {
      const next = new Set(prev);
      filtered.forEach((r) => next.add(r.id));
      return next;
    });
  const deselectAll = () =>
    setDraft((prev) => {
      const next = new Set(prev);
      filtered.forEach((r) => next.delete(r.id));
      return next;
    });

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/40 sm:items-center sm:justify-center sm:p-4"
      onClick={handleBackdrop}
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-xl sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 p-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">
              Select restaurants
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {draft.size} of {available.length} selected
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search + bulk actions */}
        <div className="shrink-0 space-y-2.5 border-b border-gray-100 p-3 sm:px-5">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants…"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-primary/60 hover:text-primary"
            >
              {q ? "Select matches" : "Select all"}
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-primary/60 hover:text-primary"
            >
              {q ? "Deselect matches" : "Deselect all"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-500">
              No restaurants match “{query.trim()}”.
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((r) => {
                const checked = draft.has(r.id);
                return (
                  <li key={r.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        checked ? "bg-primary/5" : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(r.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                      />
                      <span className="text-sm text-gray-800">{r.restaurant_name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/60 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const RestaurantSelection = ({ spaceId, available, selected }: RestaurantSelectionProps) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(selected.map((r) => r.id))
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const applySelection = (ids: Set<string>) => {
    setCheckedIds(ids);
    setSaveSuccess(false);
    setSaveError("");
    setModalOpen(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await coworkingApi.updateSelectedRestaurants(spaceId, Array.from(checkedIds));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to update restaurant selection.");
    } finally {
      setSaving(false);
    }
  };

  const selectedNames = available
    .filter((r) => checkedIds.has(r.id))
    .map((r) => r.restaurant_name);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Card header */}
        <div className="flex items-start gap-3 border-b border-gray-100 p-5 sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store size={18} />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight text-gray-900">
              Available restaurants
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Choose which restaurants your customers can order from.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {available.length === 0 ? (
            <p className="text-sm text-gray-500">
              No restaurants have been assigned to your space yet. Contact Swift to add restaurants.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                {selectedNames.length > 0 ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNames.length} of {available.length}{" "}
                      {available.length === 1 ? "restaurant" : "restaurants"} enabled
                    </p>
                    <p className="mt-0.5 truncate text-sm text-gray-500">
                      {selectedNames.join(", ")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">No restaurants enabled</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Customers won&apos;t see any restaurants until you choose some.
                    </p>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary/60 hover:text-primary"
              >
                <SlidersHorizontal size={15} />
                {selectedNames.length > 0 ? "Edit" : "Choose"}
              </button>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={14} className="flex-shrink-0" />
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle size={14} className="flex-shrink-0" />
              Restaurant selection saved.
            </div>
          )}
        </div>

        {/* Footer action */}
        {available.length > 0 && (
          <div className="flex justify-end border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:px-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
            >
              {saving ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save selection
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <RestaurantSelectModal
          available={available}
          initialSelected={checkedIds}
          onClose={() => setModalOpen(false)}
          onApply={applySelection}
        />
      )}
    </>
  );
};

interface StripePayoutsSectionProps {
  spaceId: string;
  stripeAccountId: string | null | undefined;
  stripeOnboardingComplete: boolean | undefined;
  onStripeComplete: () => void;
}

// Stripe returns bank names shouting ("BARCLAYS BANK UK PLC") — title-case
// them but keep initialisms like UK/PLC/LTD/HSBC/TSB upper.
const prettyBankName = (name: string) =>
  name
    .toLowerCase()
    .split(" ")
    .map((w) =>
      ["uk", "plc", "ltd", "llp", "hsbc", "tsb", "rbs"].includes(w)
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");

const StripePayoutsSection = ({
  spaceId,
  stripeAccountId,
  stripeOnboardingComplete,
  onStripeComplete,
}: StripePayoutsSectionProps) => {
  const [localComplete, setLocalComplete] = useState(!!stripeOnboardingComplete);
  const [balance, setBalance] = useState<{ available: number; pending: number; currency: string } | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  const [accountLabel, setAccountLabel] = useState("");
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

  // State 3: fetch balance + account identity whenever localComplete becomes true
  useEffect(() => {
    if (localComplete) {
      coworkingApi.getStripeBalance(spaceId)
        .then(setBalance)
        .catch(() => setBalanceError(true));
      coworkingApi.getStripeDetails(spaceId)
        .then((d) => {
          const bank = d.bankName ? `${prettyBankName(d.bankName)} ••••${d.bankLast4}` : "";
          setAccountLabel([d.email, bank].filter(Boolean).join(" · "));
        })
        .catch(() => {});
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

            {accountLabel ? (
              <p className="text-xs text-gray-400" title={stripeAccountId || undefined}>
                {accountLabel}
              </p>
            ) : stripeAccountId ? (
              <p className="font-mono text-xs text-gray-400">{stripeAccountId}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

interface Props {
  spaceId: string;
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "S";

const PublishableKeyField = ({ value }: { value: string }) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Publishable key
      </label>
      <div className="flex items-stretch gap-2">
        <div className="flex flex-1 items-center min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
          <span className="flex-1 truncate font-mono text-sm text-gray-700">
            {revealed ? value : "•".repeat(Math.min(value.length, 32))}
          </span>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide key" : "Reveal key"}
            className="ml-2 shrink-0 text-gray-400 transition-colors hover:text-gray-700"
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy key"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          {copied ? (
            <>
              <Check size={15} className="text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy size={15} />
              Copy
            </>
          )}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        Used by the{" "}
        <a
          href="https://www.npmjs.com/package/@swift-food-services/catering-widget"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          @swift-food-services/catering-widget
          <ExternalLink size={12} />
        </a>{" "}
        package.
      </p>
    </div>
  );
};

export const CoworkingSettings = ({ spaceId }: Props) => {
  const [space, setSpace] = useState<CoworkingSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Task 6 — Commission rate state
  const [commission, setCommission] = useState<string>("0");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    coworkingApi
      .getSpace(spaceId)
      .then((s) => {
        setSpace(s);
        setCommission(String(s.commission ?? 0));
      })
      .catch((err) => setLoadError(err.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, [spaceId]);

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const value = parseFloat(commission);
    if (isNaN(value) || value < 0 || value > 100) {
      setSaveError("Please enter a rate between 0 and 100.");
      setSaving(false);
      return;
    }

    try {
      const result = await coworkingApi.updateCommissionRate(spaceId, value);
      setCommission(String(result.commission));
      setSpace((prev) => prev ? { ...prev, commission: result.commission } : prev);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to update commission rate.");
    } finally {
      setSaving(false);
    }
  };

  const handleStripeComplete = () => {
    setSpace((prev) => (prev ? { ...prev, stripeOnboardingComplete: true } : prev));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <AlertCircle size={16} className="flex-shrink-0" />
        {loadError}
      </div>
    );
  }

  const currentRate = space?.commission ?? 0;
  const stripeGated = !space?.stripeOnboardingComplete;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Workspace profile card ─────────────────────────────────── */}
      {space && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Banner */}
          <div className="h-24 bg-gray-50" />

          <div className="px-5 pb-6 sm:px-6">
            {/* Avatar + status, overlapping the banner */}
            <div className="-mt-10 flex items-end justify-between">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-white shadow-md ring-4 ring-white">
                {initialsOf(space.name)}
              </span>
              <span
                className={
                  space.isActive
                    ? "mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    : "mb-1 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                }
              >
                <span
                  className={
                    space.isActive
                      ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                      : "h-1.5 w-1.5 rounded-full bg-gray-400"
                  }
                />
                {space.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Name + email */}
            <div className="mt-3">
              <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                {space.name}
              </h2>
              {space.contactEmail && (
                <p className="text-sm text-gray-500">{space.contactEmail}</p>
              )}
            </div>

            {/* Integration / publishable key */}
            {space.publishableKey && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <KeyRound size={15} className="text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">Integration</p>
                </div>
                <PublishableKeyField value={space.publishableKey} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Catering Service Fee card ──────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Card header */}
        <div className="flex items-start gap-3 border-b border-gray-100 p-5 sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Percent size={18} />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight text-gray-900">
              Catering service fee
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              A percentage charged on top of the catering food subtotal, after promotions.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {stripeGated && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <p>Complete Stripe payouts setup to configure your commission rate.</p>
            </div>
          )}
          {/* Current rate hero */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Current rate
              </p>
              {currentRate === 0 ? (
                <p className="mt-0.5 text-3xl font-bold tracking-tight text-gray-300">
                  No fee
                </p>
              ) : (
                <p className="mt-0.5 text-3xl font-bold tracking-tight text-gray-900 tabular-nums">
                  {currentRate}
                  <span className="text-xl text-gray-400">%</span>
                </p>
              )}
            </div>
            <span
              className={
                currentRate > 0
                  ? "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  : "inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500"
              }
            >
              <span
                className={
                  currentRate > 0
                    ? "h-1.5 w-1.5 rounded-full bg-primary"
                    : "h-1.5 w-1.5 rounded-full bg-gray-400"
                }
              />
              {currentRate > 0 ? "Active" : "Disabled"}
            </span>
          </div>

          <form id="commission-form" onSubmit={handleSaveCommission} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="commission-rate"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Update rate
              </label>
              <div className="flex items-center gap-2.5">
                <div className="relative">
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
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                    %
                  </span>
                </div>
                <span className="text-sm text-gray-500">of food subtotal</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Set to 0 to disable the service fee entirely.
              </p>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={14} className="flex-shrink-0" />
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle size={14} className="flex-shrink-0" />
                Service fee rate updated successfully.
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <p>
                This rate only applies to <strong>new orders</strong> placed after
                saving. Existing orders are not affected — they retain the rate that was
                active at the time of pricing.
              </p>
            </div>
          </form>
        </div>

        {/* Sticky-feel footer action */}
        <div className="flex justify-end border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:px-6">
          <button
            type="submit"
            form="commission-form"
            disabled={saving || stripeGated}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
          >
            {saving ? (
              <>
                <Loader size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={14} />
                Save rate
              </>
            )}
          </button>
        </div>
      </div>

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
  );
};
