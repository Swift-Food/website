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
  pending_review: "bg-amber-50 text-amber-700 border-amber-200",
  admin_reviewed: "bg-amber-50 text-amber-700 border-amber-200",
  restaurant_reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  payment_link_sent: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
};

export const OrderCard = ({ order, onViewDetail }: Props) => {
  const hasServiceFee = order.serviceFee > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md hover:shadow-gray-200/60 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold tracking-tight text-gray-900">{order.customerName}</p>
          <p className="text-xs text-gray-500">{order.customerEmail}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {fmtDate(order.eventDate)}
            {order.eventTime && <span className="ml-1">· {order.eventTime}</span>}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 ${
            STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700 border-gray-300"
          }`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Fee breakdown */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm space-y-1">
        <div className="flex justify-between text-gray-600">
          <span>Food subtotal</span>
          <span>{fmt(order.subtotal)}</span>
        </div>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span>{fmt(order.deliveryFee)}</span>
          </div>
        )}
        {hasServiceFee && (
          <div className="flex justify-between text-indigo-700">
            <span>
              Service Fee
              {order.serviceFeeRate > 0 && (
                <span className="ml-1 text-indigo-500 text-xs">
                  ({order.serviceFeeRate}%)
                </span>
              )}
            </span>
            <span>{fmt(order.serviceFee)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
          <span>Total</span>
          <span>{fmt(order.finalTotal)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end">
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
