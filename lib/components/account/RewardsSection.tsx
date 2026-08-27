"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader } from "lucide-react";
import { AuthAlert } from "./AuthAlert";
import { customerAccountApi } from "@/services/api/customer-account.api";
import { AvailableDiscount } from "@/types/api/customer-account.api.types";

const formatDiscount = (discount: AvailableDiscount): string => {
  const amount =
    discount.discountType === "PERCENT"
      ? `${discount.discountAmount}% off`
      : `£${discount.discountAmount.toFixed(2)} off`;
  const cap =
    discount.discountType === "PERCENT" && discount.maxDiscount
      ? ` (up to £${discount.maxDiscount.toFixed(2)})`
      : "";
  return `${amount}${cap}`;
};

const formatExpiry = (expiresAt: string | null): string | null => {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const RewardRow = ({ discount }: { discount: AvailableDiscount }) => {
  const [copied, setCopied] = useState(false);
  const expiry = formatExpiry(discount.expiresAt);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(discount.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the code is on screen either way.
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-gray-100 last:border-b-0">
      <div className="min-w-0">
        <p className="font-mono font-bold text-black tracking-widest">{discount.code}</p>
        <p className="text-sm text-gray-400 font-light">
          {[formatDiscount(discount), expiry ? `expires ${expiry}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <button
        onClick={copy}
        className="shrink-0 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
};

export const RewardsSection = () => {
  const [discounts, setDiscounts] = useState<AvailableDiscount[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    customerAccountApi
      .getMyDiscounts()
      .then((data) => {
        if (!cancelled) setDiscounts(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load your reward codes."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
      <h2 className="text-xs font-black uppercase tracking-widest text-black mb-2">
        Your rewards
      </h2>
      <p className="text-sm text-gray-400 font-light mb-8">
        Thank-you codes from completed orders. Enter one in the discount box at
        checkout.
      </p>

      {loading && (
        <div className="py-4 flex justify-center">
          <Loader size={20} className="animate-spin text-gray-300" />
        </div>
      )}

      {!loading && error && <AuthAlert tone="error" message={error} />}

      {!loading && discounts && !discounts.length && (
        <p className="text-sm text-gray-400 font-light">
          No codes yet. We send one once an order is completed.
        </p>
      )}

      {!loading && discounts && discounts.length > 0 && (
        <div>
          {discounts.map((discount) => (
            <RewardRow key={discount.code} discount={discount} />
          ))}
        </div>
      )}
    </div>
  );
};
