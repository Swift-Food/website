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
  const hasServiceFee = order.serviceFee > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-gray-900">{order.customerName}</p>
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

      {/* Task 3 — Fee breakdown */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm space-y-1">
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
