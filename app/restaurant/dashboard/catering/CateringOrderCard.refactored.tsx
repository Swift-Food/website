/**
 * CateringOrderCard Component (Refactored)
 *
 * Clean, decomposed version with proper separation of concerns:
 * - Pure presentational components
 * - Business logic in utility functions
 * - State management in custom hooks
 * - Strong typing with DTOs
 *
 * Architecture:
 * - types/order-card.dto.ts: Type definitions
 * - utils/: Pure business logic functions
 * - hooks/: Reusable stateful logic
 * - components/: Presentational components
 */

"use client";

import { CateringOrderCardProps } from "./types/order-card.dto";
import { useReceiptViewer } from "./hooks/useReceiptViewer";
import {
  OrderHeader,
  EarningsSummary,
  EventInformation,
  ReceiptViewButton,
  OrderItemsList,
  AccountAssignmentAlert,
  OrderReviewActions,
  SpecialRequirements,
} from "./components";

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
}: CateringOrderCardProps) => {
  // Derived state
  const isUnassigned = order.isUnassigned === true;
  const isPaidOrder = order.status === "paid" || order.status === "confirmed";
  const shouldShowAccountAssignment = isUnassigned && isPaidOrder;
  const shouldShowReviewActions = order.status === "admin_reviewed";

  // Custom hooks
  const { viewReceipt, viewingReceipt } = useReceiptViewer({
    orderId: order.id,
    restaurantId,
    eventDate: order.eventDate,
    token,
    selectedAccountId: selectedAccounts[order.id],
    availableAccounts,
  });

  // Derived data
  const orderItem = order.orderItems?.[0];
  const payoutAccountName = order.restaurantPayoutDetails?.[restaurantId]?.accountName || null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
      {/* Order Reference */}
      <OrderHeader orderId={order.id} />

      {/* Account Assignment Alert (if needed) */}
      {shouldShowAccountAssignment && (
        <AccountAssignmentAlert
          orderId={order.id}
          availableAccounts={availableAccounts}
          selectedAccounts={selectedAccounts}
          onAccountSelect={onAccountSelect}
          onClaim={onClaim}
          claiming={claiming}
        />
      )}

      {/* Earnings Summary */}
      <EarningsSummary
        status={order.status}
        restaurantTotalCost={order.restaurantTotalCost || 0}
        promotionDiscount={order.promotionDiscount}
        orderItemTotalPrice={orderItem?.totalPrice}
        orderItemPromotionDiscount={orderItem?.promotionDiscount}
        finalTotal={order.finalTotal}
        eventDate={order.eventDate}
      />

      {/* View Receipt Button */}
      <ReceiptViewButton
        onViewReceipt={viewReceipt}
        isViewingReceipt={viewingReceipt}
      />

      {/* Event Information */}
      <EventInformation
        eventDate={order.eventDate}
        eventTime={order.eventTime}
        collectionTime={order.collectionTime}
        deliveryAddress={order.deliveryAddress}
        payoutAccountName={payoutAccountName}
      />

      {/* Order Items List */}
      <OrderItemsList orderItems={order.orderItems} />

      {/* Special Requirements */}
      {order.specialRequirements && (
        <SpecialRequirements requirements={order.specialRequirements} />
      )}

      {/* Review Actions (if needed) */}
      {shouldShowReviewActions && (
        <OrderReviewActions
          orderId={order.id}
          onReview={onReview}
          reviewing={reviewing}
          availableAccounts={availableAccounts}
          selectedAccounts={selectedAccounts}
          onAccountSelect={onAccountSelect}
          loadingAccounts={loadingAccounts}
        />
      )}
    </div>
  );
};
