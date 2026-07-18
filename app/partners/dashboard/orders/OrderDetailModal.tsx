"use client";

import { useEffect, useState } from "react";
import { X, Loader, AlertCircle } from "lucide-react";
import { coworkingApi } from "@/services/api/coworking.api";
import { DashboardOrderDetail } from "@/types/api/coworking.api.types";

interface Props {
  spaceId: string;
  orderId: string;
  onClose: () => void;
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
  payment_link_sent: "Payment Link Sent",
  paid: "Paid",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-yellow-100 text-yellow-800",
  admin_reviewed: "bg-yellow-100 text-yellow-800",
  restaurant_reviewed: "bg-blue-100 text-blue-800",
  payment_link_sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-gray-100 text-gray-700",
};

export const OrderDetailModal = ({ spaceId, orderId, onClose }: Props) => {
  const [order, setOrder] = useState<DashboardOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    coworkingApi
      .getOrderDetail(spaceId, orderId)
      .then(setOrder)
      .catch((err) => setError(err.message || "Failed to load order details"))
      .finally(() => setLoading(false));
  }, [spaceId, orderId]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/40 sm:items-center sm:justify-center sm:p-4"
      onClick={handleBackdrop}
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-xl sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white p-5 sm:rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader size={28} className="animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {order && (
            <div className="space-y-5">
              {/* Reference & status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Reference</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              {/* Customer info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
                <p className="font-semibold text-gray-700 mb-2">Customer</p>
                <p className="text-gray-900 font-medium">{order.customerName}</p>
                {order.organization && (
                  <p className="text-gray-600">{order.organization}</p>
                )}
                <p className="text-gray-600">{order.customerEmail}</p>
                <p className="text-gray-600">{order.customerPhone}</p>
              </div>

              {/* Event info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-1.5 text-sm">
                <p className="font-semibold text-gray-700 mb-2">Event</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-gray-900 font-medium">{fmtDate(order.eventDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-gray-900 font-medium">{order.eventTime}</p>
                  </div>
                  {order.guestCount ? (
                    <div>
                      <p className="text-xs text-gray-500">Guests</p>
                      <p className="text-gray-900 font-medium">{order.guestCount}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs text-gray-500">Caterers</p>
                    <p className="text-gray-900 font-medium">{order.restaurantCount}</p>
                  </div>
                </div>
                {order.deliveryAddress && (
                  <div className="mt-1">
                    <p className="text-xs text-gray-500">Delivery address</p>
                    <p className="text-gray-900">{order.deliveryAddress}</p>
                  </div>
                )}
                {order.specialRequirements && (
                  <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs font-semibold text-yellow-900">Special requirements</p>
                    <p className="text-xs text-yellow-800 mt-0.5">{order.specialRequirements}</p>
                  </div>
                )}
              </div>

              {/* Task 4 — Totals breakdown */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-700">Price Breakdown</p>
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Food subtotal</span>
                    <span>{fmt(order.totals.subtotal)}</span>
                  </div>

                  {order.totals.promoDiscount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Promo discount</span>
                      <span>−{fmt(order.totals.promoDiscount)}</span>
                    </div>
                  )}

                  {order.totals.deliveryFee > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery</span>
                      <span>{fmt(order.totals.deliveryFee)}</span>
                    </div>
                  )}

                  {/* Service Fee — Task 4: between delivery and venue hire, hidden when zero */}
                  {order.totals.serviceFee > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>
                        Service Fee
                        {order.totals.serviceFeeRate > 0 && (
                          <span className="ml-1 text-primary/70 text-xs">
                            ({order.totals.serviceFeeRate}%)
                          </span>
                        )}
                      </span>
                      <span className="font-medium">{fmt(order.totals.serviceFee)}</span>
                    </div>
                  )}

                  {order.totals.venueHireFee > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Venue hire</span>
                      <span>{fmt(order.totals.venueHireFee)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>{fmt(order.totals.finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
