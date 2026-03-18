"use client";

import { createRef } from "react";
import { X, Clock, Tag, Pencil, ShoppingBag, AlertTriangle } from "lucide-react";
import { ViewOrderModalProps } from "./types";
import SelectedItemsByCategory from "./SelectedItemsByCategory";
import DateSessionNav from "./DateSessionNav";

export default function ViewOrderModal({
  isOpen,
  onClose,
  mealSessions,
  activeSessionIndex,
  onSessionChange,
  getSessionTotal,
  getSessionDiscount,
  validationErrors,
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
  canRemoveSession,
  formatTimeDisplay,
  navMode,
  dayGroups,
  selectedDayDate,
  currentDayGroup,
  onDateClick,
  onBackToDates,
  onAddDay,
  onAddSessionToDay,
}: ViewOrderModalProps) {
  if (!isOpen) return null;

  const activeSession = mealSessions[activeSessionIndex];
  if (!activeSession) return null;

  const { discount, promotion } = getSessionDiscount(activeSessionIndex);
  const sessionTotal = getSessionTotal(activeSessionIndex);
  const validationError = validationErrors[activeSessionIndex] || null;
  const isUnscheduled = !activeSession.sessionDate;
  const totalItemCount = activeSession.orderItems.reduce(
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
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-base-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Session Nav - same as main page */}
      <DateSessionNav
        navMode={navMode}
        dayGroups={dayGroups}
        selectedDayDate={selectedDayDate}
        currentDayGroup={currentDayGroup}
        expandedSessionIndex={activeSessionIndex}
        isNavSticky={false}
        onDateClick={onDateClick}
        onBackToDates={onBackToDates}
        onSessionPillClick={onSessionChange}
        onAddDay={onAddDay}
        onAddSessionToDay={onAddSessionToDay}
        formatTimeDisplay={formatTimeDisplay}
        addDayNavButtonRef={createRef()}
        backButtonRef={createRef()}
        firstDayTabRef={createRef()}
        firstSessionPillRef={createRef()}
        addSessionNavButtonRef={createRef()}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-4 bg-red-50 border-b-2 border-red-500 flex items-start gap-3">
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
                onClick={() => onEditSession(activeSessionIndex)}
                className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Edit Session Time
              </button>
            </div>
          </div>
        )}

        {/* Unscheduled Warning */}
        {isUnscheduled && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Set date & time to continue</p>
              <button
                onClick={() => onEditSession(activeSessionIndex)}
                className="mt-2 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
              >
                Edit Session
              </button>
            </div>
          </div>
        )}

        {/* Session Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {activeSession.sessionName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(activeSession.sessionDate)}
              </p>
              <p className="text-xs text-gray-500">
                {formatTime(activeSession.eventTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <span className="text-sm font-semibold text-primary">
                £{sessionTotal.toFixed(2)}
              </span>
              <p className="text-[10px] text-gray-500">{totalItemCount} items</p>
              {discount != null && discount > 0 && (
                <p className="text-[10px] text-green-600 font-semibold">
                  -£{discount.toFixed(2)} off
                </p>
              )}
            </div>
            <button
              onClick={() => onEditSession(activeSessionIndex)}
              className="p-2 rounded-full hover:bg-base-200 transition-colors text-primary"
              title="Edit Session"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {canRemoveSession(activeSessionIndex) && (
              <button
                onClick={(e) => onRemoveSession(activeSessionIndex, e)}
                className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500"
                title="Remove Session"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Promotion Discount Banner */}
        {discount != null && discount > 0 && promotion && (
          <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-green-700">
                {promotion.name || "Restaurant Promotion"}
              </span>
              <span className="text-xs text-green-600 ml-1.5">
                {promotion.promotionType === "BUY_MORE_SAVE_MORE" && promotion.discountTiers?.length
                  ? (() => {
                      const totalQty = activeSession.orderItems.reduce((s, oi) => s + oi.quantity, 0);
                      const sorted = [...promotion.discountTiers].sort((a: any, b: any) => b.minQuantity - a.minQuantity);
                      const tier = sorted.find((t: any) => totalQty >= t.minQuantity);
                      return tier ? `${Number(tier.discountPercentage)}% off` : "";
                    })()
                  : promotion.promotionType === "BOGO"
                  ? "Buy One Get One"
                  : `${Number(promotion.discountPercentage)}% off`}
              </span>
            </div>
            <span className="text-sm font-bold text-green-700 flex-shrink-0">
              -£{discount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Items */}
        <div className="p-4">
          {activeSession.orderItems.length > 0 ? (
            <div className="min-w-0 overflow-hidden">
              <SelectedItemsByCategory
                sessionIndex={activeSessionIndex}
                onEdit={onEditItem}
                onRemove={onRemoveItem}
                onSwapItem={onSwapItem}
                onRemoveBundle={onRemoveBundle}
                collapsedCategories={collapsedCategories}
                onToggleCategory={onToggleCategory}
                onViewMenu={onViewMenu}
              />
            </div>
          ) : (
            <div className="py-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Browse the menu to add items</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom – identical to main page View Order bar */}
      <div className="relative">
        {/* Session detail pill */}
        <div className="flex justify-center pb-2 px-4">
          <div className="flex flex-col items-center px-3 py-1.5 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-base-200">
            <span className="text-xs font-semibold text-gray-800">{activeSession.sessionName}</span>
            <span className="text-[10px] text-gray-500">
              {activeSession.sessionDate
                ? new Date(activeSession.sessionDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                : "Date not set"}
              {activeSession.eventTime && ` · ${formatTimeDisplay(activeSession.eventTime)}`}
            </span>
          </div>
        </div>
        {/* Checkout bar */}
        <div className="p-4 bg-primary">
          <button
            onClick={() => {
              onClose();
              onCheckout();
            }}
            className="w-full flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-semibold">
                {isCurrentSessionValid ? "Proceed to Checkout" : "Min. Order Not Met"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">£{totalPrice.toFixed(2)}</span>
              <span className="text-sm opacity-80">{totalItemCount} items</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
