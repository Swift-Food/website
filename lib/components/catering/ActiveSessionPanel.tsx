"use client";

import { Clock, X, Tag, Pencil, ShoppingBag, AlertTriangle } from "lucide-react";
import { ActiveSessionPanelProps } from "./types";
import SelectedItemsByCategory from "./SelectedItemsByCategory";

export default function ActiveSessionPanel({
  session,
  sessionIndex,
  sessionTotal,
  sessionDiscount,
  sessionPromotion,
  validationError,
  isUnscheduled,
  canRemove,
  onEditSession,
  onRemoveSession,
  onEditItem,
  onRemoveItem,
  onSwapItem,
  onRemoveBundle,
  collapsedCategories,
  onToggleCategory,
  onViewMenu,
  isCurrentSessionValid,
  totalPrice,
  onCheckout,
  showCheckoutButton = true,
}: ActiveSessionPanelProps) {
  const totalItemCount = session.orderItems.reduce(
    (sum, oi) => sum + oi.quantity,
    0
  );

  const formatDate = (date: string | undefined) => {
    if (!date) return "Date not set";
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (eventTime: string | undefined) => {
    if (!eventTime) return "Time not set";
    const [hours, minutes] = eventTime.split(":");
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    const start = `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
    const totalEnd = hour * 60 + minute + 30;
    const endHour = Math.floor(totalEnd / 60) % 24;
    const endMinute = totalEnd % 60;
    const endPeriod = endHour >= 12 ? "PM" : "AM";
    const endHour12 = endHour % 12 || 12;
    return `${start} – ${endHour12}:${String(endMinute).padStart(2, "0")} ${endPeriod}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-base-200">
      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 bg-red-50 border-b-2 border-red-500 rounded-t-xl flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 mb-1">
              Catering Hours Conflict
            </p>
            <p className="text-sm text-red-700">{validationError}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditSession();
              }}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Edit Session Time
            </button>
          </div>
        </div>
      )}

      {/* Unscheduled Warning */}
      {isUnscheduled && (
        <div className="p-4 bg-amber-50 border-b border-amber-200 rounded-t-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Set date & time to continue</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditSession();
              }}
              className="mt-2 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Edit Session
            </button>
          </div>
        </div>
      )}

      {/* Session Header */}
      <div className="px-4 py-3 md:px-5 md:py-4 flex items-center justify-between border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm md:text-base font-semibold text-gray-800">
              {session.sessionName}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(session.sessionDate)}
            </p>
            <p className="text-xs text-gray-500">
              {formatTime(session.eventTime)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <span className="text-sm md:text-base font-semibold text-primary">
              £{sessionTotal.toFixed(2)}
            </span>
            <p className="text-[10px] text-gray-500">{totalItemCount} items</p>
            {sessionDiscount != null && sessionDiscount > 0 && (
              <p className="text-[10px] text-green-600 font-semibold">
                -£{sessionDiscount.toFixed(2)} off
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditSession();
            }}
            className="p-2 rounded-full hover:bg-base-200 transition-colors text-primary"
            title="Edit Session"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {canRemove && (
            <button
              onClick={onRemoveSession}
              className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500"
              title="Remove Session"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Promotion Discount Banner */}
      {sessionDiscount != null && sessionDiscount > 0 && sessionPromotion && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs md:text-sm font-semibold text-green-700">
              {sessionPromotion.name || "Restaurant Promotion"}
            </span>
            <span className="text-xs text-green-600 ml-1.5">
              {sessionPromotion.promotionType === "BUY_MORE_SAVE_MORE" && sessionPromotion.discountTiers?.length
                ? (() => {
                    const totalQty = session.orderItems.reduce((s, oi) => s + oi.quantity, 0);
                    const sorted = [...sessionPromotion.discountTiers].sort((a: any, b: any) => b.minQuantity - a.minQuantity);
                    const tier = sorted.find((t: any) => totalQty >= t.minQuantity);
                    return tier ? `${Number(tier.discountPercentage)}% off` : "";
                  })()
                : sessionPromotion.promotionType === "BOGO"
                ? "Buy One Get One"
                : `${Number(sessionPromotion.discountPercentage)}% off`}
            </span>
          </div>
          <span className="text-sm font-bold text-green-700 flex-shrink-0">
            -£{sessionDiscount.toFixed(2)}
          </span>
        </div>
      )}

      {/* Session Content */}
      <div className="p-4 md:p-5">
        {session.orderItems.length > 0 ? (
          <div className="min-w-0 overflow-hidden">
            <SelectedItemsByCategory
              sessionIndex={sessionIndex}
              onEdit={onEditItem}
              onRemove={onRemoveItem}
              onSwapItem={onSwapItem}
              onRemoveBundle={onRemoveBundle}
              collapsedCategories={collapsedCategories}
              onToggleCategory={onToggleCategory}
              onViewMenu={onViewMenu}
              compactLayout
            />
          </div>
        ) : (
          <div className="py-12 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Browse the menu to add items</p>
          </div>
        )}
      </div>

      {/* Inline Checkout Button */}
      {showCheckoutButton && session.orderItems.length > 0 && (
        <div className="px-4 pb-4 md:px-5 md:pb-5">
          <button
            onClick={onCheckout}
            className={`w-full flex items-center justify-between px-5 py-3 rounded-xl text-white font-semibold transition-colors ${
              isCurrentSessionValid
                ? "bg-primary hover:bg-primary/90"
                : "bg-warning hover:bg-warning/90"
            }`}
          >
            <div>
              <span className="text-sm opacity-90">Total</span>
              <span className="ml-2 text-lg font-bold">£{totalPrice.toFixed(2)}</span>
            </div>
            <span>
              {isCurrentSessionValid ? "Checkout" : "Min. Order Not Met"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
