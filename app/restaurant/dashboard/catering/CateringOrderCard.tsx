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
import { CateringOrderResponse, MealSessionResponse } from "@/types/api";
import { PickupAddress } from "@/types/restaurant.types";

interface CateringOrderCardProps {
  order: CateringOrderResponse & { effectiveStatus?: string };
  restaurantId: string;
  onReview: (orderId: string, accepted: boolean) => Promise<void>;
  reviewing: string | null;
  availableAccounts: Record<string, any>;
  selectedAccounts: Record<string, string>;
  onAccountSelect: (orderId: string, accountId: string) => void;
  loadingAccounts: boolean;
  token?: string;
  onClaim: (orderId: string) => Promise<void>;
  claiming: string | null;
  pickupAddresses?: PickupAddress[];
  selectedPickupAddressIndex?: number;
  onPickupAddressSelect?: (orderId: string, index: number) => void;
}

export const CateringOrderCard = ({
  order,
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
  pickupAddresses = [],
  selectedPickupAddressIndex = 0,
  onPickupAddressSelect,
}: CateringOrderCardProps) => {
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [viewingReceipt, setViewingReceipt] = useState(false);

  const isUnassigned = order.isUnassigned === true;
  const status = order.effectiveStatus || order.status;
  const isPaidOrder = status === "paid" || status === "confirmed";

  // Get restaurant-specific data from order
  const getRestaurantOrderItems = () => {
    const restaurants = order.restaurants || order.orderItems || [];
    return restaurants.filter((item: any) => item.restaurantId === restaurantId);
  };

  // Calculate restaurant net earnings - use earningsAmount (includes adjustments) if available
  const calculateRestaurantNetEarnings = (): number => {
    // Prefer earningsAmount from payoutDetails as it includes adjustments
    const payoutDetail = order.restaurantPayoutDetails?.[restaurantId];
    if (payoutDetail?.earningsAmount !== undefined) {
      return payoutDetail.earningsAmount;
    }
    // Fallback: calculate from order items
    const restaurantItems = getRestaurantOrderItems();
    return restaurantItems.reduce((total: number, item: any) => {
      if (item.restaurantNetAmount !== undefined) {
        return total + item.restaurantNetAmount;
      }
      const menuItemTotal = item.menuItems?.reduce((sum: number, menuItem: any) => {
        return sum + (menuItem.restaurantNetAmount || 0);
      }, 0) || 0;
      return total + menuItemTotal;
    }, 0);
  };

  // Calculate customer total for this restaurant
  const calculateCustomerTotal = (): number => {
    const restaurantItems = getRestaurantOrderItems();
    return restaurantItems.reduce((total: number, item: any) => {
      if (item.customerTotal !== undefined) {
        return total + item.customerTotal;
      }
      // Fallback: sum from menu items
      const menuItemTotal = item.menuItems?.reduce((sum: number, menuItem: any) => {
        return sum + (menuItem.customerTotalPrice || 0);
      }, 0) || 0;
      return total + menuItemTotal;
    }, 0);
  };

  const restaurantNetEarnings = calculateRestaurantNetEarnings();
  const customerTotal = calculateCustomerTotal();
  const restaurantOrderItems = getRestaurantOrderItems();

  // View receipt
  const viewReceipt = async () => {
    if (!token) {
      alert("Missing authentication token. Please log in again.");
      return;
    }
    setViewingReceipt(true);
    try {
      const selectedAccountId = selectedAccounts?.[order.id];
      const branchName =
        selectedAccountId && availableAccounts
          ? availableAccounts[selectedAccountId]?.name
          : null;

      const data = await fetchReceiptJson(order.id, restaurantId, token);
      const html = buildReceiptHTML(
        data,
        order.id,
        String(order.eventDate),
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
    if (!order.restaurantPayoutDetails) return null;
    const payoutDetail = order.restaurantPayoutDetails[restaurantId];
    return payoutDetail?.accountName || null;
  };

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Helper functions for pricing
  const getItemNetEarnings = (item: any) => {
    if (item.restaurantNetAmount !== undefined) {
      return item.restaurantNetAmount;
    }
    if (item.commissionPrice !== undefined) {
      return item.commissionPrice * item.quantity;
    }
    return 0;
  };

  const getItemGrossPrice = (item: any) => {
    if (item.restaurantBaseTotalPrice !== undefined) {
      return item.restaurantBaseTotalPrice;
    }
    if (item.priceForRestaurant !== undefined) {
      return item.priceForRestaurant * item.quantity;
    }
    return 0;
  };

  const getItemCustomerPrice = (item: any) => {
    if (item.customerTotalPrice !== undefined) {
      return item.customerTotalPrice;
    }
    if (item.totalPrice !== undefined) {
      return item.totalPrice;
    }
    return 0;
  };

  // Render menu items for a restaurant
  const renderMenuItems = (menuItems: any[]) => {
    return menuItems.map((item: any, itemIdx: number) => {
      // Group addons by groupTitle
      const addonGroups: Record<string, any[]> = {};
      if (item.addons && Array.isArray(item.addons)) {
        item.addons.forEach((addon: any) => {
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
                {item.menuItemName || item.name}
              </p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <div className="flex flex-col gap-1.5 ml-2">
              {/* Restaurant Net Earnings */}
              <div className="bg-green-100 border border-green-300 rounded-md px-2 py-0.5 min-h-[42px] flex flex-col justify-center">
                <p className="text-[10px] text-green-700 font-medium leading-tight">
                  YOUR NET EARNINGS
                </p>
                {item.restaurantNetAmount !== undefined ? (
                  <>
                    <p className="text-[10px] text-green-600 leading-tight">
                      Per unit: {formatCurrency(item.restaurantNetAmount / item.quantity)}
                    </p>
                    <p className="text-[10px] text-green-600 leading-tight">
                      Qty: {item.quantity}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-green-600 leading-tight">
                      Total Net: {formatCurrency(getItemNetEarnings(item))}
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

              {/* Gross Price */}
              <div className="bg-gray-100 border border-gray-300 rounded-md px-2 py-0.5 min-h-[42px] flex flex-col justify-center">
                <p className="text-xs text-gray-900 font-medium leading-tight">
                  GROSS PRICE
                </p>
                {item.restaurantBaseTotalPrice !== undefined ? (
                  <>
                    <p className="text-[10px] text-gray-600 leading-tight">
                      Per unit: {formatCurrency(item.restaurantBaseUnitPrice || 0)}
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
                      Total Gross: {formatCurrency(getItemGrossPrice(item))}
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

              {/* Customer Price */}
              <div className="bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 min-h-[32px] flex flex-col justify-center">
                <p className="text-[10px] text-blue-700 font-medium leading-tight">
                  Customer Paid: {formatCurrency(getItemCustomerPrice(item))}
                </p>
              </div>
            </div>
          </div>

          {/* Addons grouped by groupTitle */}
          {Object.keys(addonGroups).length > 0 && (
            <div className="space-y-2">
              {Object.entries(addonGroups).map(([groupTitle, addons]) => (
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
                        {addon.customerUnitPrice !== undefined &&
                          addon.customerUnitPrice > 0 && (
                            <span className="text-purple-700 font-medium">
                              {formatCurrency(addon.customerUnitPrice * addon.quantity)}
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  // Render a meal session card
  const renderMealSession = (session: MealSessionResponse) => {
    const sessionRestaurantItems = session.orderItems?.filter(
      (item: any) => item.restaurantId === restaurantId
    ) || [];

    if (sessionRestaurantItems.length === 0) return null;

    const isExpanded = expandedSessions[session.id] || false;

    // Use backend-computed restaurantNetEarnings (includes adjustments) if available
    const sessionNetEarnings = (session as any).restaurantNetEarnings ??
      sessionRestaurantItems.reduce((total: number, item: any) => {
        if (item.restaurantNetAmount !== undefined) {
          return total + item.restaurantNetAmount;
        }
        const menuItemTotal = item.menuItems?.reduce((sum: number, menuItem: any) => {
          return sum + (menuItem.restaurantNetAmount || 0);
        }, 0) || 0;
        return total + menuItemTotal;
      }, 0);

    return (
      <div key={session.id} className="border border-blue-200 rounded-lg p-3 bg-blue-50/30">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h5 className="font-semibold text-blue-800">{session.sessionName}</h5>
            <p className="text-xs text-gray-600">
              {formatDate(session.sessionDate)} at {session.restaurantCollectionTimes?.[restaurantId] || session.collectionTime || formatEventTime(session.eventTime)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Session Earnings</p>
            <p className="font-bold text-green-600">{formatCurrency(sessionNetEarnings)}</p>
          </div>
        </div>

        {session.specialRequirements && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs font-semibold text-yellow-900">Special Requirements:</p>
            <p className="text-xs text-yellow-800">{session.specialRequirements}</p>
          </div>
        )}

        {/* Expandable items */}
        <button
          onClick={() => toggleSession(session.id)}
          className="w-full flex items-center justify-between text-sm text-blue-700 hover:text-blue-900 py-1"
        >
          <span>
            View Items ({sessionRestaurantItems.reduce((count: number, r: any) =>
              count + (r.menuItems?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0), 0
            )} items)
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-2">
            {sessionRestaurantItems.map((restaurantItem: any, idx: number) => (
              <div key={idx}>
                {renderMenuItems(restaurantItem.menuItems || [])}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Check if order has meal sessions
  const hasMealSessions = order.mealSessions && order.mealSessions.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
      {/* Order Reference Header */}
      <div className="w-full flex justify-center mb-3">
        <span className="text-xl text-gray-500 text-center">
          <b className="text-primary">
            Reference: {order.id.slice(0, 4).toUpperCase()}
          </b>
        </span>
      </div>

      {/* Unassigned Alert */}
      {isUnassigned && isPaidOrder && (
        <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="text-yellow-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="flex-1">
              <p className="font-semibold text-yellow-900 mb-2">
                Action Required: Assign Payment Account
              </p>
              <p className="text-sm text-yellow-800 mb-3">
                This order has been paid by the customer. Please select which
                branch/account should receive the payout.
              </p>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-yellow-900 mb-2">
                  Select Branch/Payment Account:
                </label>
                <select
                  value={selectedAccounts[order.id] || ""}
                  onChange={(e) => onAccountSelect(order.id, e.target.value)}
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

              <button
                onClick={() => onClaim(order.id)}
                disabled={!selectedAccounts[order.id] || claiming === order.id}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:bg-yellow-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {claiming === order.id ? (
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
                Once assigned, earnings will be transferred to:{" "}
                <strong>
                  {selectedAccounts[order.id] &&
                    availableAccounts[selectedAccounts[order.id]]?.name}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Status and Earnings */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
        <div className="flex flex-row gap-5 justify-center items-center">
          <span
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border inline-block text-center ${getStatusColor(
              status
            )}`}
          >
            {getStatusLabel(status)}
          </span>
        </div>
        <div className="sm:text-right">
          <div className="mb-1">
            <p className="text-xs text-gray-600 font-medium">Your Total Earnings</p>
            <p className="font-bold text-xl sm:text-2xl text-green-600">
              {formatCurrency(restaurantNetEarnings)}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Customer Total: {formatCurrency(customerTotal)}
          </p>
          <p className="text-xs text-gray-500">
            Event: {formatDate(order.eventDate)}
          </p>
        </div>
      </div>

      {/* View Receipt Button */}
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
              <EyeIcon size={14} />
              View Receipt
            </>
          )}
        </button>
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
              {formatDate(order.eventDate)}
            </span>
          </p>
          <p className="text-gray-600">
            Collection Time:{" "}
            <span className="text-gray-900 font-medium">
              {order.mealSessions?.[0]?.restaurantCollectionTimes?.[restaurantId] || order.collectionTime || formatEventTime(order.eventTime)}
            </span>
          </p>
          <p className="text-gray-600">
            Account:{" "}
            <span className="text-gray-900 font-medium">
              {getPayoutAccountName() || "Not selected"}
            </span>
          </p>
          {order.guestCount && (
            <p className="text-gray-600">
              Total Guests:{" "}
              <span className="text-gray-900 font-medium">{order.guestCount}</span>
            </p>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Delivery:{" "}
          <span className="text-gray-900 font-medium">
            {formatDeliveryAddress(order.deliveryAddress)}
          </span>
        </p>
      </div>

      {/* Meal Sessions or Order Items */}
      <div className="border-t border-gray-200 pt-4">
        {hasMealSessions ? (
          <>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
              Meal Sessions ({order.mealSessions!.length})
            </h4>
            <div className="space-y-3">
              {order.mealSessions!.map((session) =>
                renderMealSession(session)
              )}
            </div>
          </>
        ) : (
          <>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
              Order Items ({restaurantOrderItems.reduce((count: number, r: any) =>
                count + (r.menuItems?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0), 0
              )} items)
            </h4>
            <div className="space-y-2">
              {restaurantOrderItems.map((restaurantItem: any, idx: number) => (
                <div key={idx}>
                  {renderMenuItems(restaurantItem.menuItems || [])}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Special Requirements */}
      {order.specialRequirements && (
        <div className="mt-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs font-semibold text-yellow-900 mb-1">
            Special Requirements:
          </p>
          <p className="text-xs sm:text-sm text-yellow-800 break-words">
            {order.specialRequirements}
          </p>
        </div>
      )}

      {/* Review Buttons */}
      {status === "admin_reviewed" && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Account Selector */}
          {!loadingAccounts &&
            availableAccounts &&
            Object.keys(availableAccounts).length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Select Branch/Payment Account:
                </label>
                <select
                  value={selectedAccounts[order.id] || ""}
                  onChange={(e) => onAccountSelect(order.id, e.target.value)}
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
                  Payment will be sent to:{" "}
                  <strong>
                    {availableAccounts[selectedAccounts[order.id]]?.name ||
                      "Selected Account"}
                  </strong>
                </p>
              </div>
            )}

          {/* Pickup Address Selector */}
          {pickupAddresses.length > 0 && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <label className="block text-sm font-semibold text-purple-900 mb-2">
                Select Pickup Address:
              </label>
              <select
                value={selectedPickupAddressIndex}
                onChange={(e) =>
                  onPickupAddressSelect?.(order.id, parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-purple-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-purple-500"
              >
                {pickupAddresses.map((addr, idx) => (
                  <option key={idx} value={idx}>
                    {addr.name} - {addr.addressLine1}, {addr.city} {addr.zipcode}
                    {idx === 0 ? " (Default)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-purple-700 mt-2">
                Collection from:{" "}
                <strong>
                  {pickupAddresses[selectedPickupAddressIndex]?.name ||
                    pickupAddresses[0]?.name}
                </strong>
              </p>
            </div>
          )}

          <p className="text-xs sm:text-sm font-medium text-gray-900 mb-3">
            Please review this order and confirm your availability
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => onReview(order.id, true)}
              disabled={reviewing === order.id || loadingAccounts}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {reviewing === order.id ? (
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
              onClick={() => onReview(order.id, false)}
              disabled={reviewing === order.id || loadingAccounts}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {reviewing === order.id ? (
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
