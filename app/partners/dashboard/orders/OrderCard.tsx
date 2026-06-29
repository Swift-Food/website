"use client";

import { DashboardOrderSummary } from "@/types/api/coworking.api.types";
import { CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface Props {
  order: DashboardOrderSummary;
  onViewDetail: (orderId: string) => void;
}

const fmt = (n: number) => `£${Number(n).toFixed(2)}`;

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  pending_review: { label: "Pending Review", badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  admin_reviewed: { label: "Admin Reviewed", badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  restaurant_reviewed: { label: "Awaiting Payment", badge: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  payment_link_sent: { label: "Link Sent", badge: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  paid: { label: "Paid", badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  confirmed: { label: "Confirmed", badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", badge: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  completed: { label: "Completed", badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

export const OrderCard = ({ order, onViewDetail }: Props) => {
  const hasServiceFee = order.serviceFee > 0;
  const status = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    badge: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <button
      onClick={() => onViewDetail(order.id)}
      className="group flex w-full flex-col rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-gray-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initialsOf(order.customerName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold tracking-tight text-gray-900">{order.customerName}</p>
          <p className="truncate text-xs text-gray-500">{order.customerEmail}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            status.badge
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>

      {/* Event date */}
      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <CalendarDays size={13} className="shrink-0 text-gray-400" />
        <span>{fmtDate(order.eventDate)}</span>
        {order.eventTime && (
          <>
            <span className="text-gray-300">·</span>
            <span>{order.eventTime}</span>
          </>
        )}
      </div>

      {/* Fee breakdown */}
      <div className="mt-3 space-y-1.5 rounded-xl bg-gray-50 p-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Food subtotal</span>
          <span className="tabular-nums">{fmt(order.subtotal)}</span>
        </div>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span className="tabular-nums">{fmt(order.deliveryFee)}</span>
          </div>
        )}
        {hasServiceFee && (
          <div className="flex justify-between text-primary">
            <span>
              Service fee
              {order.serviceFeeRate > 0 && (
                <span className="ml-1 text-xs text-primary/70">({order.serviceFeeRate}%)</span>
              )}
            </span>
            <span className="tabular-nums">{fmt(order.serviceFee)}</span>
          </div>
        )}
        <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-2">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-base font-bold tabular-nums text-gray-900">{fmt(order.finalTotal)}</span>
        </div>
      </div>

      {/* Footer affordance */}
      <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-primary transition-colors group-hover:text-primary/80">
        View details
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
};
