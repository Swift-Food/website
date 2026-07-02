"use client";

import { useEffect, useState } from "react";
import { refundService } from "@/services/api/refund.api";
import type { RefundRequest } from "@/types/refund.types";

interface Props {
  orderId: string;
  restaurantId: string;
}

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toCurrency(n: number | null | undefined) {
  return `£${Number(n ?? 0).toFixed(2)}`;
}

function StatusPill({
  status,
  stripeRefundId,
}: {
  status: string;
  stripeRefundId?: string | null;
}) {
  let label = status.charAt(0).toUpperCase() + status.slice(1);
  let tone = "bg-gray-100 text-gray-700 border-gray-200";
  if (status === "processed" && stripeRefundId) {
    label = "Refunded via Stripe";
    tone = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (status === "processed") {
    label = "Processed";
    tone = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (status === "rejected") {
    label = "Rejected";
    tone = "bg-red-50 text-red-700 border-red-200";
  } else if (status === "cancelled") {
    label = "Cancelled";
    tone = "bg-gray-100 text-gray-600 border-gray-200";
  } else if (status === "pending" || status === "approved") {
    tone = "bg-blue-50 text-blue-700 border-blue-200";
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-full ${tone}`}
    >
      {label}
    </span>
  );
}

// Row for one refund the admin has issued against this restaurant on this
// order. Deliberately partner-friendly language ("deducted from your next
// payout") — hides internal Stripe ids and admin reviewer info.
function RefundRow({ refund }: { refund: RefundRequest }) {
  const amount = refund.approvedAmount ?? refund.requestedAmount;
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {toCurrency(amount)}
            <span className="text-sm text-gray-500 font-normal ml-2">
              deducted from your next payout
            </span>
          </div>
        </div>
        <StatusPill
          status={refund.status}
          stripeRefundId={refund.stripeRefundId}
        />
      </div>

      {(refund.reason || refund.additionalDetails) && (
        <div className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
            Reason
          </span>
          {refund.reason || refund.additionalDetails}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span className="font-medium">Issued:</span>{" "}
        {formatDateTime(refund.processedAt || refund.createdAt)}
      </div>
    </div>
  );
}

export default function RefundHistorySection({ orderId, restaurantId }: Props) {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    refundService
      .getOrderRefunds(orderId)
      .then((list) => {
        if (cancelled) return;
        setRefunds(
          (list || []).filter((r) => r.restaurantId === restaurantId),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load refund history",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, restaurantId]);

  if (loading) return null; // silent while loading — this section is optional context

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {error}
      </div>
    );
  }

  if (refunds.length === 0) return null;

  return (
    <section className="mt-4">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">
        Refunds on this order
      </h4>
      <div className="space-y-2">
        {refunds.map((r) => (
          <RefundRow key={r.id} refund={r} />
        ))}
      </div>
    </section>
  );
}
