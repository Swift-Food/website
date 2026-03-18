"use client";

import { X, Clock } from "lucide-react";
import { ViewOrderModalProps } from "./types";
import ActiveSessionPanel from "./ActiveSessionPanel";

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
}: ViewOrderModalProps) {
  if (!isOpen) return null;

  const activeSession = mealSessions[activeSessionIndex];
  if (!activeSession) return null;

  const { discount, promotion } = getSessionDiscount(activeSessionIndex);

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

      {/* Session Picker */}
      {mealSessions.length > 1 && (
        <div className="px-4 py-2 border-b border-base-200 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {mealSessions.map((session, index) => (
              <button
                key={index}
                onClick={() => onSessionChange(index)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === activeSessionIndex
                    ? "bg-primary text-white"
                    : "bg-base-200 text-gray-600 hover:bg-base-300"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">
                  {session.sessionName}
                  {session.eventTime && (
                    <span className="ml-1 opacity-80">
                      {formatTimeDisplay(session.eventTime)}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <ActiveSessionPanel
          session={activeSession}
          sessionIndex={activeSessionIndex}
          sessionTotal={getSessionTotal(activeSessionIndex)}
          sessionDiscount={discount}
          sessionPromotion={promotion}
          validationError={validationErrors[activeSessionIndex] || null}
          isUnscheduled={!activeSession.sessionDate}
          canRemove={canRemoveSession(activeSessionIndex)}
          onEditSession={() => onEditSession(activeSessionIndex)}
          onRemoveSession={(e) => onRemoveSession(activeSessionIndex, e)}
          onEditItem={onEditItem}
          onRemoveItem={onRemoveItem}
          onSwapItem={onSwapItem}
          onRemoveBundle={onRemoveBundle}
          collapsedCategories={collapsedCategories}
          onToggleCategory={onToggleCategory}
          onViewMenu={onViewMenu}
          isCurrentSessionValid={isCurrentSessionValid}
          totalPrice={totalPrice}
          onCheckout={onCheckout}
          showCheckoutButton={false}
        />
      </div>

      {/* Fixed Bottom Checkout */}
      <div className="px-4 py-3 border-t border-base-200 bg-white">
        <button
          onClick={() => {
            onClose();
            onCheckout();
          }}
          className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-white font-semibold transition-colors ${
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
            {isCurrentSessionValid ? "Proceed to Checkout" : "Min. Order Not Met"}
          </span>
        </button>
      </div>
    </div>
  );
}
