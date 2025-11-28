"use client";

import { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  EyeIcon,
} from "lucide-react";
import { fetchReceiptJson, buildReceiptHTML } from "./receiptUtils";
import { formatDeliveryAddress } from "./utils/address.utils";
import { FlattenedOrderItem } from "./types/order-card.dto";

interface CateringOrderCardProps {
  item: FlattenedOrderItem;
  restaurantId: string;
  onReview: (displayId: string, accepted: boolean, isMealSession: boolean) => Promise<void>;
  reviewing: string | null;
  availableAccounts: Record<string, any>;
  selectedAccounts: Record<string, string>;
  onAccountSelect: (parentOrderId: string, accountId: string) => void;
  loadingAccounts: boolean;
  token?: string;
  onClaim: (parentOrderId: string) => Promise<void>;
  claiming: string | null;
}

export const CateringOrderCard = ({
  item,
  restaurantId,
  onReview,
  reviewing,
  availableAccounts,
  selectedAccounts,
  onAccountSelect,
  loadingAccounts,
  token,
  onClaim,
  claiming,
}: CateringOrderCardProps) => {
  const [expandedItems, setExpandedItems] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(false);
  const isUnassigned = item.isUnassigned === true;
  const isPaidOrder = item.status === "paid" || item.status === "confirmed";
  console.log(
    "Item:",
    item.displayId,
    "isUnassigned:",
    isUnassigned,
    "status:",
    item.status,
    "isMealSession:",
    item.isMealSession
  );
  // 🔍 View receipt in new tab (no print)
  const viewReceipt = async () => {
    if (!token) {
      alert("Missing authentication token. Please log in again.");
      return;
    }
    setViewingReceipt(true);
    try {
      const selectedAccountId = selectedAccounts?.[item.parentOrderId];
      const branchName =
        selectedAccountId && availableAccounts
          ? availableAccounts[selectedAccountId]?.name
          : null;

      // Use parentOrderId for receipt (receipts are at order level)
      const data = await fetchReceiptJson(item.parentOrderId, restaurantId, token);
      const html = buildReceiptHTML(
        data,
        item.parentOrderId,
        String(item.eventDate),
        branchName
      );
      const w = window.open("", "_blank");
      if (!w) {
        alert("Popup blocked. Please allow popups to view receipt.");
        return;
      }
      w.document.write(html);
      w.document.close();
      w.focus();
    } catch (err) {
      console.error("Receipt view error:", err);
      alert(
        `Failed to view receipt: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setViewingReceipt(false);
    }
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (amount: any) => `£${Number(amount).toFixed(2)}`;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      admin_reviewed: "bg-yellow-100 text-yellow-800 border-yellow-300",
      restaurant_reviewed: "bg-blue-100 text-blue-800 border-blue-300",
      paid: "bg-green-100 text-green-800 border-green-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      completed: "bg-blue-100 text-blue-800 border-blue-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  /**
   * Helper to get restaurant net earnings for an item
   * Uses new clear API if available, otherwise falls back to legacy
   */
  const getItemNetEarnings = (item: any) => {
    // NEW API: restaurantNetAmount is what restaurant actually receives
    if (item.restaurantNetAmount !== undefined) {
      return item.restaurantNetAmount;
    }
    // LEGACY: commissionPrice (what restaurant gets per unit)
    if (item.commissionPrice !== undefined) {
      return item.commissionPrice * item.quantity;
    }
    // Fallback
    return 0;
  };

  /**
   * Helper to get gross price (before commission) for an item
   * Uses new clear API if available, otherwise falls back to legacy
   */
  const getItemGrossPrice = (item: any) => {
    // NEW API: restaurantBaseTotalPrice is before commission
    if (item.restaurantBaseTotalPrice !== undefined) {
      return item.restaurantBaseTotalPrice;
    }
    // LEGACY: priceForRestaurant (unclear if gross or net)
    if (item.priceForRestaurant !== undefined) {
      return item.priceForRestaurant * item.quantity;
    }
    // Fallback
    return 0;
  };

  /**
   * Helper to get customer price for an item
   * Uses new clear API if available, otherwise falls back to legacy
   */
  const getItemCustomerPrice = (item: any) => {
    // NEW API: customerTotalPrice is what customer pays
    if (item.customerTotalPrice !== undefined) {
      return item.customerTotalPrice;
    }
    // LEGACY: totalPrice
    if (item.totalPrice !== undefined) {
      return item.totalPrice;
    }
    // Fallback
    return 0;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      admin_reviewed: "REVIEW",
      restaurant_reviewed: "PENDING PAYMENT",
      paid: "CONFIRMED",
      confirmed: "CONFIRMED",
      completed: "COMPLETED",
    };
    return labels[status] || status.toUpperCase();
  };

  const formatEventTime = (eventTime: string) => {
    const [hours, minutes] = eventTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes - 15;
    const newHours = Math.floor(((totalMinutes + 24 * 60) % (24 * 60)) / 60);
    const newMinutes = ((totalMinutes % 60) + 60) % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
      2,
      "0"
    )}`;
  };

  const getPayoutAccountName = (): string | null => {
    if (!item.restaurantPayoutDetails) return null;
    const payoutDetail = item.restaurantPayoutDetails[restaurantId];
    return payoutDetail?.accountName || null;
  };

  const toggleItems = () => setExpandedItems(!expandedItems);

  // Use orderItems from flattened item (already resolved from session or order)
  const restaurantsData = item.orderItems || [];
  console.log("Restaurant data: ", restaurantsData);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
      <div className="w-full flex justify-center mb-3">
        <span className="text-xl text-gray-500 text-center">
          <b className="text-primary">
            {item.sessionName && (
              <span className="text-blue-600">{item.sessionName} - </span>
            )}
            Reference: {item.displayId.slice(0, 4).toUpperCase()}
          </b>
        </span>
      </div>
      {isUnassigned && isPaidOrder && (
        <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="text-yellow-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="flex-1">
              <p className="font-semibold text-yellow-900 mb-2">
                ⚠️ Action Required: Assign Payment Account
              </p>
              <p className="text-sm text-yellow-800 mb-3">
                This order has been paid by the customer. Please select which
                branch/account should receive the payout.
              </p>

              {/* Account Selector - uses parentOrderId for account assignment */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-yellow-900 mb-2">
                  💳 Select Branch/Payment Account:
                </label>
                <select
                  value={selectedAccounts[item.parentOrderId] || ""}
                  onChange={(e) => onAccountSelect(item.parentOrderId, e.target.value)}
                  className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-yellow-500 text-sm"
                >
                  <option value="">-- Choose Account --</option>
                  {Object.entries(availableAccounts).map(
                    ([id, account]: [string, any]) => (
                      <option key={id} value={id}>
                        {account.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Claim Button - uses parentOrderId */}
              <button
                onClick={() => onClaim(item.parentOrderId)}
                disabled={!selectedAccounts[item.parentOrderId] || claiming === item.parentOrderId}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:bg-yellow-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {claiming === item.parentOrderId ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Assigning Account...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Confirm & Assign Account
                  </>
                )}
              </button>

              <p className="text-xs text-yellow-700 mt-2">
                💰 Once assigned, earnings will be transferred to:{" "}
                <strong>
                  {selectedAccounts[item.parentOrderId] &&
                    availableAccounts[selectedAccounts[item.parentOrderId]]?.name}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <div className="flex flex-row gap-5 justify-center items-center">
          <span
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border inline-block text-center ${getStatusColor(
              item.status
            )}`}
          >
            {getStatusLabel(item.status)}
          </span>
        </div>
        <div className="sm:text-right">
          <div className="mb-1">
            <p className="text-xs text-gray-600 font-medium">Your Earnings</p>
            <p className="font-bold text-xl sm:text-2xl text-green-600">
              {formatCurrency(item.restaurantNetEarnings || 0)}
            </p>
          </div>

          {/* Show pricing breakdown */}
          <div className="mb-2 space-y-1">
            {item.promoDiscount && Number(item.promoDiscount) > 0 ? (
              <>
                <p className="text-sm text-gray-600">
                  Subtotal: {formatCurrency(item.subtotal)}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  Promotion Savings: -{formatCurrency(item.promoDiscount)}
                </p>
                <p className="text-sm text-gray-900 font-semibold">
                  Customer Paid: {formatCurrency(item.sessionTotal)}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Customer Paid: {formatCurrency(item.sessionTotal)}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Event: {formatDate(item.eventDate)}
          </p>
        </div>
      </div>

      {/* 👁️ View / 💾 Download Receipt Buttons */}
      <div className="flex justify-end gap-2 mb-3">
        <button
          onClick={viewReceipt}
          disabled={viewingReceipt}
          className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          type="button"
        >
          {viewingReceipt ? (
            <>
              <Loader size={14} className="animate-spin" />
              Viewing...
            </>
          ) : (
            <>
              <EyeIcon />
              View Receipt
            </>
          )}
        </button>

        {/* <button
          onClick={downloadReceipt}
          disabled={downloadingReceipt}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          type="button"
        > */}
        {/* {downloadingReceipt ? (
            <>
              <Loader size={14} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download size={14} />
              Download Receipt
            </>
          )}
        // </button> */}
      </div>

      {/* Event Details */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
          Event Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <p className="text-gray-600">
            Date:{" "}
            <span className="text-gray-900 font-medium">
              {formatDate(item.eventDate)}
            </span>
          </p>
          <p className="text-gray-600">
            Collection Time:{" "}
            <span className="text-gray-900 font-medium">
              {item.collectionTime
                ? item.collectionTime
                : formatEventTime(item.eventTime)}
            </span>
          </p>
          <p className="text-gray-600">
            Account:{" "}
            <span className="text-gray-900 font-medium">
              {getPayoutAccountName() || "Not selected"}
            </span>
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Delivery:{" "}
          <span className="text-gray-900 font-medium">
            {formatDeliveryAddress(item.deliveryAddress)}
          </span>
        </p>
      </div>
      {/* Applied Promotions */}

      {/* Order Items - Expandable */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={toggleItems}
          className="w-full flex items-center justify-between font-semibold text-gray-900 mb-3 text-sm sm:text-base hover:text-blue-600 transition-colors"
        >
          <span>
            Order Items (
            {restaurantsData.reduce(
              (total, restaurant) => total + restaurant.menuItems.length,
              0
            )}{" "}
            items)
          </span>
          {expandedItems ? (
            <ChevronUp size={20} className="text-blue-600" />
          ) : (
            <ChevronDown size={20} className="text-gray-600" />
          )}
        </button>

        {expandedItems && (
          <div>
            {restaurantsData.map((restaurant, idx) => (
              <div key={idx} className="mb-3">
                <div className="space-y-2">
                  {restaurant.menuItems.map((item: any, itemIdx: number) => {
                    // Group addons by groupTitle
                    const addonGroups: Record<string, any[]> = {};
                    if (
                      (item as any).addons &&
                      Array.isArray((item as any).addons)
                    ) {
                      (item as any).addons.forEach((addon: any) => {
                        const groupTitle = addon.groupTitle || "Other";
                        if (!addonGroups[groupTitle]) {
                          addonGroups[groupTitle] = [];
                        }
                        addonGroups[groupTitle].push(addon);
                      });
                    }

                    return (
                      <div key={itemIdx} className="space-y-2">
                        <div className="flex justify-between items-center bg-gray-50 p-2 sm:p-3 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {(item as any).menuItemName || (item as any).name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1.5 ml-2">
                            {/* Restaurant Net Earnings (what they receive after commission) */}
                            <div className="bg-green-100 border border-green-300 rounded-md px-2 py-0.5 min-h-[42px] flex flex-col justify-center">
                              <p className="text-[10px] text-green-700 font-medium leading-tight">
                                YOUR NET EARNINGS
                              </p>
                              {item.restaurantNetAmount !== undefined ? (
                                <>
                                  <p className="text-[10px] text-green-600 leading-tight">
                                    Per unit:{" "}
                                    {formatCurrency(
                                      item.restaurantNetAmount / item.quantity
                                    )}
                                  </p>
                                  <p className="text-[10px] text-green-600 leading-tight">
                                    Qty: {item.quantity}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-[10px] text-green-600 leading-tight">
                                    Total Net:{" "}
                                    {formatCurrency(getItemNetEarnings(item))}
                                  </p>
                                  <p className="text-[10px] text-green-600 leading-tight">
                                    Qty: {item.quantity}
                                  </p>
                                </>
                              )}
                              <p className="text-sm font-bold text-green-800 leading-tight mt-0.5">
                                {formatCurrency(getItemNetEarnings(item))}
                              </p>
                            </div>

                            {/* Gross Price (before commission) */}
                            <div className="bg-gray-100 border border-gray-300 rounded-md px-2 py-0.5 min-h-[42px] flex flex-col justify-center">
                              <p className="text-xs text-gray-900 font-medium leading-tight">
                                GROSS PRICE
                              </p>
                              {item.restaurantBaseTotalPrice !== undefined ? (
                                <>
                                  <p className="text-[10px] text-gray-600 leading-tight">
                                    Per unit:{" "}
                                    {formatCurrency(
                                      item.restaurantBaseUnitPrice || 0
                                    )}
                                  </p>
                                  {item.commissionRate && (
                                    <p className="text-[10px] text-gray-600 leading-tight">
                                      Commission: {item.commissionRate}%
                                    </p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <p className="text-[10px] text-gray-600 leading-tight">
                                    Total Gross:{" "}
                                    {formatCurrency(getItemGrossPrice(item))}
                                  </p>
                                  <p className="text-[10px] text-gray-600 leading-tight">
                                    Qty: {item.quantity}
                                  </p>
                                </>
                              )}
                              <p className="text-sm font-semibold text-gray-700 leading-tight mt-0.5">
                                {formatCurrency(getItemGrossPrice(item))}
                              </p>
                            </div>

                            {/* Customer Price (what customer paid) */}
                            <div className="bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 min-h-[32px] flex flex-col justify-center">
                              <p className="text-[10px] text-blue-700 font-medium leading-tight">
                                Customer Paid:{" "}
                                {formatCurrency(getItemCustomerPrice(item))}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Addons grouped by groupTitle */}
                        {Object.keys(addonGroups).length > 0 && (
                          <div className="space-y-2">
                            {Object.entries(addonGroups).map(
                              ([groupTitle, addons]) => (
                                <div
                                  key={groupTitle}
                                  className="bg-purple-50 border border-purple-200 rounded p-2"
                                >
                                  <p className="text-xs font-semibold text-purple-900 mb-1">
                                    {groupTitle}:
                                  </p>
                                  <div className="space-y-1">
                                    {addons.map((addon, addonIdx) => (
                                      <div
                                        key={addonIdx}
                                        className="flex justify-between items-center text-xs"
                                      >
                                        <span className="text-purple-800">
                                          {addon.name} × {addon.quantity}
                                        </span>
                                        {addon.customerUnitPrice !==
                                          undefined &&
                                          addon.customerUnitPrice > 0 && (
                                            <span className="text-purple-700 font-medium">
                                              {formatCurrency(
                                                addon.customerUnitPrice *
                                                  addon.quantity
                                              )}
                                            </span>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Special Requirements */}
      {item.specialRequirements && (
        <div className="mt-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs font-semibold text-yellow-900 mb-1">
            Special Requirements:
          </p>
          <p className="text-xs sm:text-sm text-yellow-800 break-words">
            {item.specialRequirements}
          </p>
        </div>
      )}

      {/* Review Buttons */}
      {item.status === "admin_reviewed" && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Account Selector - uses parentOrderId */}
          {!loadingAccounts &&
            availableAccounts &&
            Object.keys(availableAccounts).length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  💳 Select Branch/Payment Account:
                </label>
                <select
                  value={selectedAccounts[item.parentOrderId] || ""}
                  onChange={(e) => onAccountSelect(item.parentOrderId, e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(availableAccounts).map(
                    ([id, account]: [string, any]) => (
                      <option key={id} value={id}>
                        {account.name}
                      </option>
                    )
                  )}
                </select>
                <p className="text-xs text-blue-700 mt-2">
                  💰 Payment will be sent to:{" "}
                  <strong>
                    {availableAccounts[selectedAccounts[item.parentOrderId]]?.name ||
                      "Selected Account"}
                  </strong>
                </p>
              </div>
            )}

          <p className="text-xs sm:text-sm font-medium text-gray-900 mb-3">
            Please review this {item.isMealSession ? "meal session" : "order"} and confirm your availability
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => onReview(item.displayId, true, item.isMealSession)}
              disabled={reviewing === item.displayId || loadingAccounts}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {reviewing === item.displayId ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Accept Order
                </>
              )}
            </button>
            <button
              onClick={() => onReview(item.displayId, false, item.isMealSession)}
              disabled={reviewing === item.displayId || loadingAccounts}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {reviewing === item.displayId ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="mr-2" />
                  Reject Order
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
