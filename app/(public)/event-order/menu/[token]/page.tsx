"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cateringService } from "@/services/api/catering.api";
import { CateringOrderResponse } from "@/types/api";
import { Loader2, ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";
import { transformOrderToPdfData } from "@/lib/utils/menuPdfUtils";
import { pdf } from "@react-pdf/renderer";
import { CateringMenuPdf } from "@/lib/components/pdf/CateringMenuPdf";

export default function FullMenuPage() {
  const params = useParams();
  const token = params.token as string;
  const [order, setOrder] = useState<CateringOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    loadOrder();
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

  const handleSaveAsPdf = async () => {
    if (!order || generatingPdf) return;

    setGeneratingPdf(true);
    try {
      // Transform order data to PDF format (now async to handle image fetching)
      const pdfData = await transformOrderToPdfData(order, true);

      // Generate PDF
      const blob = await pdf(
        <CateringMenuPdf
          sessions={pdfData.sessions}
          showPrices={pdfData.showPrices}
          deliveryCharge={pdfData.deliveryCharge}
          totalPrice={pdfData.totalPrice}
          logoUrl={pdfData.logoUrl}
        />
      ).toBlob();

      // Download PDF
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
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">
            Loading your event menu...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl sm:text-5xl mb-4">!</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Menu Not Found
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            {error ||
              "We couldn't find this menu. Please check your link and try again."}
          </p>
        </div>
      </div>
    );
  }

  const hasMealSessions = order.mealSessions && order.mealSessions.length > 0;
  const sortedMealSessions = hasMealSessions
    ? [...order.mealSessions!].sort((a, b) => {
        const dateA = new Date(a.sessionDate);
        const dateB = new Date(b.sessionDate);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.eventTime.localeCompare(b.eventTime);
      })
    : [];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Render menu items grouped by category for a session
  const renderMenuItems = (orderItems: any[]) => {
    // Group items by category
    const groupedItems = new Map<string, any[]>();

    orderItems.forEach((restaurant) => {
      restaurant.menuItems.forEach((item: any) => {
        const category = item.category?.name || item.categoryName || item.groupTitle || "Other Items";
        if (!groupedItems.has(category)) {
          groupedItems.set(category, []);
        }
        groupedItems.get(category)!.push({
          ...item,
          restaurantName: restaurant.restaurantName,
        });
      });
    });

    return Array.from(groupedItems.entries()).map(([category, items]) => (
      <div key={category} className="mb-6">
        <h4 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-pink-300 flex items-center gap-2">
          <span>🍽️</span>
          {category}
          <span className="font-normal text-gray-500 text-sm ml-2">
            ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
        </h4>
        <div className="space-y-3">
          {items.map((item: any, idx: number) => {
            console.log("item is", JSON.stringify(item))
            const cateringUnit = item.cateringQuantityUnit || 1;
            const feedsPerUnit = item.feedsPerUnit || 10;
            const numUnits = item.quantity / cateringUnit;
            const totalFeeds = numUnits * feedsPerUnit;
            const itemAddons = item.selectedAddons || [];

            return (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.menuItemName || item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {Math.round(numUnits)} portion
                      {Math.round(numUnits) !== 1 ? "s" : ""} • Serves ~
                      {Math.round(totalFeeds)} people
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      From: {item.restaurantName}
                    </p>
                  </div>
                  <p className="font-bold text-pink-600 whitespace-nowrap">
                    £{Number(item.customerTotalPrice || 0).toFixed(2)}
                  </p>
                </div>

                {/* Addons */}
                {itemAddons.length > 0 && (
                  <div className="mt-3 pl-4 border-l-3 border-pink-300 bg-white rounded-r-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Add-ons:
                    </p>
                    <div className="space-y-1">
                      {itemAddons.map((addon: any, addonIdx: number) => (
                        <div
                          key={addonIdx}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-700">
                            • {addon.name}{" "}
                            <span className="text-gray-500">
                              × {addon.quantity}
                            </span>
                          </span>
                          <span className="text-pink-600 font-semibold">
                            +£
                            {(
                              (addon.customerUnitPrice || 0) * addon.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden on print */}
      <div className="print:hidden bg-gradient-to-r from-pink-500 to-pink-400 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                href={`/event-order/view/${token}`}
                className="inline-flex items-center gap-1 text-pink-100 hover:text-white mb-2 text-sm transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Order
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold">Full Event Menu</h1>
              <p className="text-pink-100 text-sm mt-1">
                Reference:{" "}
                <span className="font-mono font-bold">
                  #{order.id.substring(0, 4).toUpperCase()}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                onClick={handleSaveAsPdf}
                disabled={generatingPdf}
                className="flex items-center gap-2 bg-white text-pink-600 px-4 py-2 rounded-lg font-medium hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {generatingPdf ? "Generating..." : "Save PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Header - Only shown on print */}
      <div className="hidden print:block bg-pink-500 text-white p-6">
        <h1 className="text-2xl font-bold">Event Menu</h1>
        <p className="text-pink-100">
          Reference: #{order.id.substring(0, 4).toUpperCase()}
        </p>
        <p className="text-pink-100 mt-1">
          {order.customerName}
          {order.organization && ` - ${order.organization}`}
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Customer Info Card - Hidden on print */}
        <div className="print:hidden bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-semibold text-gray-900">{order.customerName}</p>
              {order.organization && (
                <p className="text-sm text-gray-600">{order.organization}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="text-gray-900">{order.customerEmail}</p>
              <p className="text-gray-900">{order.customerPhone}</p>
            </div>
          </div>
        </div>

        {/* Meal Sessions */}
        {hasMealSessions ? (
          <div className="space-y-6">
            {sortedMealSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm print:shadow-none print:border print:border-gray-200"
                style={{ pageBreakInside: "avoid" }}
              >
                {/* Session Header */}
                <div className="bg-gradient-to-r from-pink-100 to-pink-50 px-4 sm:px-6 py-4">
                  <h3 className="text-xl font-bold text-pink-700">
                    {session.sessionName}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      📅 {formatDate(session.sessionDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      🕐 {formatTime(session.eventTime)}
                    </span>
                  </div>
                </div>

                {/* Session Items */}
                <div className="p-4 sm:p-6">
                  {renderMenuItems(session.orderItems)}

                  {/* Session Total */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Session Total:</span>
                      <span className="text-pink-600">
                        £{Number(session.sessionTotal || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Legacy format - single view
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-pink-100 to-pink-50 px-4 sm:px-6 py-4">
              <h3 className="text-xl font-bold text-pink-700">Event Menu</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1">
                  📅 {formatDate(order.eventDate)}
                </span>
                <span className="flex items-center gap-1">
                  🕐 {formatTime(order.eventTime)}
                </span>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {renderMenuItems(order.restaurants || order.orderItems || [])}
            </div>
          </div>
        )}

        {/* Grand Total */}
        <div className="bg-gradient-to-r from-pink-100 to-pink-50 rounded-xl p-4 sm:p-6 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-pink-700">Grand Total:</span>
            <span className="text-2xl font-bold text-pink-700">
              £{Number(order.finalTotal || order.customerFinalTotal || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer - Only shown on print */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Swift Food Services • Catering Made Simple</p>
          <p className="mt-1">
            Generated on{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
