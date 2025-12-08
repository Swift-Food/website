// app/catering/view/[token]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cateringService } from "@/services/api/catering.api";
import { CateringOrderResponse } from "@/types/api";
import OrderStatusBadge from "@/lib/components/catering/dashboard/OrderStatusBadge";
import OrderDetails from "@/lib/components/catering/dashboard/OrderDetails";
import OrderItemsByCategory from "@/lib/components/catering/dashboard/OrderItemsByCategory";
import DeliveryInfo from "@/lib/components/catering/dashboard/DeliveryInfo";
import SharedAccessManager from "@/lib/components/catering/dashboard/SharedAccessManager";
import PickupContactManager from "@/lib/components/catering/dashboard/PickupContactManager";
import DeliveryTimeManager from "@/lib/components/catering/dashboard/DeliveryTimeManager";
import { Loader2, Eye } from "lucide-react";
import RefundRequestButton from "@/lib/components/catering/dashboard/RefundRequestButton";
import { transformOrderToPdfData } from "@/lib/utils/menuPdfUtils";
import { pdf } from "@react-pdf/renderer";
import { CateringMenuPdf } from "@/lib/components/pdf/CateringMenuPdf";
import { RefundRequest } from "@/types/refund.types";
import { refundService } from "@/services/api/refund.api";
import RefundsList from "@/lib/components/catering/dashboard/refundList";
import OrderSummary from "@/lib/components/catering/dashboard/OrderSummary";

export default function CateringDashboardPage() {
  const params = useParams();
  const token = params.token as string;
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [, setLoadingRefunds] = useState(false);
  const [order, setOrder] = useState<CateringOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<
    "viewer" | "editor" | "manager" | null
  >(null);

  useEffect(() => {
    loadOrder();
  }, [token]);

  useEffect(() => {
    if (order) {
      loadRefunds();
    }
  }, [order]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cateringService.getOrderByToken(token);
      console.log("Data: ", data);
      setOrder(data);

      // Determine current user's role from the token
      const currentUser = data.sharedAccessUsers?.find(
        (u) => u.accessToken === token
      );
      setCurrentUserRole(currentUser?.role || null);
    } catch (err: any) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const loadRefunds = async () => {
    if (!order) return;
    setLoadingRefunds(true);
    try {
      const data = await refundService.getOrderRefunds(order.id);
      setRefunds(data);
    } catch (err) {
      console.error("Failed to load refunds:", err);
    } finally {
      setLoadingRefunds(false);
    }
  };

  // Handle PDF download
  const handleDownloadPdf = async () => {
    if (!order) return;

    try {
      const pdfData = transformOrderToPdfData(order, true);
      const blob = await pdf(
        <CateringMenuPdf
          sessions={pdfData.sessions}
          showPrices={pdfData.showPrices}
          deliveryCharge={pdfData.deliveryCharge}
          totalPrice={pdfData.totalPrice}
          logoUrl={pdfData.logoUrl}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `catering-menu-${order.id.substring(0, 4).toUpperCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl sm:text-5xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            {error ||
              "We couldn't find this order. Please check your link and try again."}
          </p>
        </div>
      </div>
    );
  }

  const isManager = currentUserRole === "editor";

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-1">
                Your Event Order
              </h1>
              <p className="text-pink-100 text-sm sm:text-base">
                Reference:{" "}
                <span className="font-mono font-bold">
                  #{order.id.substring(0, 4).toUpperCase()}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <OrderDetails order={order} />
            {isManager && (
              <DeliveryTimeManager
                order={order}
                onUpdate={loadOrder}
                accessToken={token}
              />
            )}
            <OrderItemsByCategory order={order} onViewMenu={handleDownloadPdf} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <DeliveryInfo order={order} />
            <OrderSummary order={order} />

            {refunds.length > 0 && <RefundsList refunds={refunds} />}
            {order.status === "completed" && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Need a Refund?
                </h3>
                <RefundRequestButton
                  orderId={order.id}
                  orderType="catering"
                  orderCompletedAt={
                    typeof order.updatedAt === "string"
                      ? order.updatedAt
                      : order.updatedAt.toISOString()
                  }
                  totalAmount={order.finalTotal ?? 0}
                  orderItems={order.restaurants || order.orderItems || []}
                  canRequestRefund={true}
                  onRefundRequested={loadOrder}
                  userId={order.userId ?? ""}
                />
              </div>
            )}

            {/* Only show management components if user is a manager */}
            {isManager ? (
              <>
                <PickupContactManager
                  order={order}
                  onUpdate={loadOrder}
                  accessToken={token}
                />
                <SharedAccessManager
                  order={order}
                  onUpdate={loadOrder}
                  currentUserRole={currentUserRole}
                />
              </>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-bold text-blue-900">
                    View Only Access
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-blue-800">
                  You have view-only access to this order. Contact the order
                  owner if you need to make changes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
