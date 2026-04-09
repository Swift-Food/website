"use client";

import { createRef, useEffect, useState } from "react";
import { X, Clock, Pencil, ShoppingBag, AlertTriangle, ChevronUp } from "lucide-react";
import { ViewOrderModalProps } from "./types";
import SelectedItemsByCategory from "./SelectedItemsByCategory";
import DateSessionNav from "./DateSessionNav";
import PricingSummary from "./contact/PricingSummary";

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
  generatingPdf,
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
  restaurants,
  pricing,
  calculatingPricing = false,
}: ViewOrderModalProps) {
  const [showPricing, setShowPricing] = useState(false);

  // Lock body scroll while the modal is open so the page behind doesn't scroll
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeSession = mealSessions[activeSessionIndex];
  if (!activeSession) return null;

  const { promotions: sessionPromotions } = getSessionDiscount(activeSessionIndex);
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
        <div className="flex items-center gap-2">
          <button
            onClick={onViewMenu}
            disabled={generatingPdf}
            className="flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generatingPdf ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            {generatingPdf ? "Generating..." : "Download PDF"}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-base-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
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
              {sessionPromotions.length > 0 && (
                <p className="text-[10px] text-green-600 font-semibold">
                  {sessionPromotions.length === 1 ? "1 offer applied" : `${sessionPromotions.length} offers applied`}
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
                restaurants={restaurants}
                sessionPromotions={sessionPromotions}
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
      <div className="relative flex-shrink-0">
        {/* Floating session detail pill + chevron button */}
        <div className="absolute -top-14 left-0 right-0 flex justify-center items-center gap-2 z-10">
          <div className="flex flex-col items-center px-3 py-1.5 rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm border border-base-200">
            <span className="text-xs font-semibold text-gray-800">{activeSession.sessionName}</span>
            <span className="text-[10px] text-gray-500">
              {activeSession.sessionDate
                ? new Date(activeSession.sessionDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                : "Date not set"}
              {activeSession.eventTime && ` · ${formatTimeDisplay(activeSession.eventTime)}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPricing((v) => !v)}
            className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm shadow-sm border border-base-200 flex items-center justify-center hover:bg-white/80 transition-colors"
            aria-label={showPricing ? "Hide pricing" : "Show pricing"}
          >
            <ChevronUp className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showPricing ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Expandable pricing summary */}
        {showPricing && (
          <div className="px-4 pt-2 pb-3 bg-white border-t border-base-200">
            <PricingSummary
              pricing={pricing ?? null}
              calculatingPricing={calculatingPricing}
              compact
            />
          </div>
        )}

        <div className="p-4 bg-primary">
          <button
            onClick={onCheckout}
            className="w-full flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-semibold">
                {isCurrentSessionValid ? "Checkout" : "Min. Order Not Met"}
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
