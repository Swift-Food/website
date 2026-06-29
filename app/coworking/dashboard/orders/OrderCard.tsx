"use client";

import { DashboardOrderSummary } from "@/types/api/coworking.api.types";
import { ExternalLink } from "lucide-react";

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

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  admin_reviewed: "Admin Reviewed",
  restaurant_reviewed: "Awaiting Payment",
  payment_link_sent: "Link Sent",
  paid: "Paid",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-yellow-100 text-yellow-800 border-yellow-300",
  admin_reviewed: "bg-yellow-100 text-yellow-800 border-yellow-300",
  restaurant_reviewed: "bg-blue-100 text-blue-800 border-blue-300",
  payment_link_sent: "bg-blue-100 text-blue-800 border-blue-300",
  paid: "bg-green-100 text-green-800 border-green-300",
  confirmed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  completed: "bg-gray-100 text-gray-700 border-gray-300",
};

export const OrderCard = ({ order, onViewDetail }: Props) => {
  const hasServiceFee = order.coworkingServiceFee > 0;

  const dateLabel = order.bookingStartTime
    ? fmtDate(order.bookingStartTime)
    : fmtDate(order.createdAt);

  const timeLabel = order.estimatedDelivery ?? order.bookingStartTime?.slice(11, 16) ?? null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-gray-900">{order.memberName}</p>
          <p className="text-xs text-gray-500">{order.memberEmail}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {dateLabel}
            {timeLabel && <span className="ml-1">· {timeLabel}</span>}
          </p>
          {order.roomLocationDetails && (
            <p className="text-xs text-indigo-600 mt-0.5">{order.roomLocationDetails}</p>
          )}
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 ${
            STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700 border-gray-300"
          }`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Task 3 — Fee breakdown */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm space-y-1">
        <div className="flex justify-between text-gray-600">
          <span>Food subtotal</span>
          <span>{fmt(order.subtotal)}</span>
        </div>
        {hasServiceFee && (
          <div className="flex justify-between text-indigo-700">
            <span>
              Service Fee
              {order.coworkingServiceFeeRate && order.coworkingServiceFeeRate > 0 && (
                <span className="ml-1 text-indigo-500 text-xs">
                  ({order.coworkingServiceFeeRate}%)
                </span>
              )}
            </span>
            <span>{fmt(order.coworkingServiceFee)}</span>
          </div>
        )}
        {order.venueHireFee > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Venue hire</span>
            <span>{fmt(order.venueHireFee)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
          <span>Total</span>
          <span>{fmt(order.total)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-gray-500">
          <span>{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</span>
          {order.bookingReference && (
            <span className="font-mono">#{order.bookingReference}</span>
          )}
        </div>
        <button
          onClick={() => onViewDetail(order.id)}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          View details
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
};
