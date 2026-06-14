"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cateringService } from "@/services/api/catering.api";
import { CateringOrderResponse } from "@/types/api";
import OrderStatusBadge from "@/lib/components/catering/dashboard/OrderStatusBadge";
import OrderDetails from "@/lib/components/catering/dashboard/OrderDetails";
import OrderItems from "@/lib/components/catering/dashboard/OrderItems";
import OrderSummary from "@/lib/components/catering/dashboard/OrderSummary";
import DeliveryInfo from "@/lib/components/catering/dashboard/DeliveryInfo";
import { Loader2, CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";

// Statuses where the customer can mint + pay (all restaurants have accepted).
const PAYABLE_STATUSES = ["restaurant_reviewed", "payment_link_sent"];
const PAID_STATUSES = ["paid", "confirmed", "completed"];

export default function EventOrderPayPage() {
  const params = useParams();
  const token = params.token as string;
  const [order, setOrder] = useState<CateringOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cateringService.getOrderByToken(token);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    setError(null);
    try {
      const { paymentLinkUrl } = await cateringService.createPayment(
        order.id,
        token
      );
      if (paymentLinkUrl) {
        window.location.href = paymentLinkUrl;
        return; // keep the spinner while the browser navigates
      }
      setError("We couldn't start the payment. Please try again.");
      setPaying(false);
    } catch (err: any) {
      setError(err.message || "We couldn't start the payment. Please try again.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">
            Loading your event order...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {error ||
              "We couldn't find this order. Please check your link and try again."}
          </p>
        </div>
      </div>
    );
  }

  const total = `£${Number(order.finalTotal ?? 0).toFixed(2)}`;
  const isPayable = PAYABLE_STATUSES.includes(order.status);
  const isPaid = PAID_STATUSES.includes(order.status);
  const isCancelled = order.status === "cancelled";

  const PayCard = () => {
    if (isPaid) {
      return (
        <div className="bg-white rounded-xl p-6 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Order paid</h3>
          <p className="text-sm text-gray-500">
            This order has been paid. There's nothing more to do here.
          </p>
        </div>
      );
    }
    if (isCancelled) {
      return (
        <div className="bg-white rounded-xl p-6 text-center">
          <XCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Order cancelled</h3>
          <p className="text-sm text-gray-500">This order was cancelled.</p>
        </div>
      );
    }
    if (!isPayable) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <Clock className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-amber-900 mb-1">
            Awaiting confirmation
          </h3>
          <p className="text-sm text-amber-800">
            Your order is being confirmed by the restaurants. We'll email you the
            moment it's ready to pay.
          </p>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Review &amp; pay</h3>
        <p className="text-sm text-gray-500 mb-4">
          Every restaurant has confirmed your order. You can still make changes up
          until you pay.
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Total to pay</span>
          <span className="text-2xl font-bold text-gray-900">{total}</span>
        </div>
        {error && (
          <p className="text-sm text-red-600 mb-3" role="alert">
            {error}
          </p>
        )}
        <button
          onClick={handlePay}
          disabled={paying}
          className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-pink-500 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {paying ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CreditCard className="h-5 w-5" />
          )}
          {paying ? "Starting payment..." : `Pay ${total}`}
        </button>
        <p className="mt-3 text-xs text-gray-400 text-center">
          You'll be taken to our secure payment page.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                Review &amp; Pay
              </h1>
              <p className="text-pink-100 text-sm sm:text-base">
                Reference:{" "}
                <span className="font-mono font-bold">
                  #{order.id.substring(0, 4).toUpperCase()}
                </span>
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main: the order being paid for */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <OrderDetails order={order} />
            <OrderItems
              order={order}
              onDownloadPdf={() => {}}
              generatingPdf={false}
            />
          </div>

          {/* Sidebar: summary + pay action */}
          <div className="space-y-4 sm:space-y-6">
            <DeliveryInfo order={order} />
            <OrderSummary order={order} />
            <PayCard />
          </div>
        </div>
      </div>
    </div>
  );
}
