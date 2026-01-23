/**
 * Utility to flatten CateringOrderResponse into display items
 *
 * Transforms orders with mealSessions into individual FlattenedOrderItem entries.
 * Each meal session becomes its own "card" that restaurants can review independently.
 * Orders without mealSessions are converted to a single FlattenedOrderItem (backward compatible).
 */

import { CateringOrderResponse, MealSessionResponse } from "@/types/api";
import { FlattenedOrderItem } from "../types/order-card.dto";

/**
 * Calculate restaurant net earnings for a meal session
 * Sums up restaurantNetAmount from all menu items for the given restaurant
 */
function calculateSessionNetEarnings(
  session: MealSessionResponse,
  restaurantId: string
): number {
  if (!session.orderItems) return 0;

  // Find the restaurant's order item in this session
  const restaurantOrder = session.orderItems.find(
    (item) => item.restaurantId === restaurantId
  );

  if (!restaurantOrder) return 0;

  // Sum up net earnings from menu items
  return restaurantOrder.menuItems?.reduce((total, menuItem) => {
    return total + (menuItem.restaurantNetAmount || 0);
  }, 0) || restaurantOrder.restaurantNetAmount || 0;
}

/**
 * Calculate customer total for a meal session (what customer pays to this restaurant)
 */
function calculateSessionCustomerTotal(
  session: MealSessionResponse,
  restaurantId: string
): number {
  if (!session.orderItems) return 0;

  // Find the restaurant's order item in this session
  const restaurantOrder = session.orderItems.find(
    (item) => item.restaurantId === restaurantId
  ) as any;

  if (!restaurantOrder) return 0;

  // Use customerTotal if available, otherwise calculate from menu items
  if (restaurantOrder.customerTotal !== undefined) {
    return restaurantOrder.customerTotal;
  }

  // Fallback: sum up customer prices from menu items
  return restaurantOrder.menuItems?.reduce((total: number, menuItem: any) => {
    return total + (menuItem.customerTotalPrice || 0);
  }, 0) || 0;
}

/**
 * Calculate restaurant net earnings for a legacy order (no meal sessions)
 */
function calculateOrderNetEarnings(
  order: CateringOrderResponse,
  restaurantId: string
): number {
  // Try new API fields first
  if (order.restaurantsTotalNet !== undefined) {
    return order.restaurantsTotalNet;
  }

  // Legacy fallback
  if (order.restaurantTotalCost !== undefined) {
    return order.restaurantTotalCost;
  }

  // Calculate from restaurants array
  const restaurants = order.restaurants || order.orderItems || [];
  const restaurantOrder = restaurants.find(
    (item: any) => item.restaurantId === restaurantId
  ) as any;

  if (!restaurantOrder) return 0;

  return restaurantOrder.restaurantNetAmount ||
         restaurantOrder.restaurantNetEarning ||
         restaurantOrder.totalPrice || 0;
}

/**
 * Calculate customer total for a legacy order (what customer pays to this restaurant)
 */
function calculateOrderCustomerTotal(
  order: CateringOrderResponse,
  restaurantId: string
): number {
  // Calculate from restaurants array
  const restaurants = order.restaurants || order.orderItems || [];
  const restaurantOrder = restaurants.find(
    (item: any) => item.restaurantId === restaurantId
  ) as any;

  if (!restaurantOrder) return 0;

  // Use customerTotal if available
  if (restaurantOrder.customerTotal !== undefined) {
    return restaurantOrder.customerTotal;
  }

  // Fallback: sum up customer prices from menu items
  return restaurantOrder.menuItems?.reduce((total: number, menuItem: any) => {
    return total + (menuItem.customerTotalPrice || 0);
  }, 0) || 0;
}

/**
 * Determine the status of a meal session
 * Checks session-level reviews, then falls back to parent order status
 */
function determineSessionStatus(
  session: MealSessionResponse,
  order: CateringOrderResponse,
  restaurantId: string
): string {
  // If session was rejected by this restaurant
  if (session.restaurantRejections?.includes(restaurantId)) {
    return 'rejected';
  }

  // If session has been reviewed by this restaurant
  if (session.restaurantReviews?.includes(restaurantId)) {
    return 'restaurant_reviewed';
  }

  // Otherwise inherit from parent order
  return order.status;
}

/**
 * Filter order items to only include items for the given restaurant
 */
function filterOrderItemsForRestaurant(
  orderItems: any[],
  restaurantId: string
): any[] {
  if (!orderItems || !Array.isArray(orderItems)) return [];
  return orderItems.filter((item: any) => item.restaurantId === restaurantId);
}

/**
 * Flatten a single order into display items
 * Returns multiple items if the order has meal sessions
 */
function flattenOrder(
  order: CateringOrderResponse,
  restaurantId: string
): FlattenedOrderItem[] {
  const items: FlattenedOrderItem[] = [];

  // Check if order has meal sessions
  if (order.mealSessions && order.mealSessions.length > 0) {
    // Multi-meal order: create an item for each session
    for (const session of order.mealSessions) {
      // Filter order items to only include this restaurant's items
      const filteredOrderItems = filterOrderItemsForRestaurant(
        session.orderItems || [],
        restaurantId
      );

      // Skip this session if the restaurant has no items in it
      if (filteredOrderItems.length === 0) continue;

      items.push({
        // Identifiers
        displayId: session.id,
        orderReference: order.id,
        sessionName: session.sessionName,

        // Timing
        eventDate: session.sessionDate,
        eventTime: session.eventTime,
        collectionTime: session.collectionTime,

        // Order data - filtered to only this restaurant's items
        orderItems: filteredOrderItems,
        guestCount: session.guestCount || order.guestCount,
        specialRequirements: session.specialRequirements || order.specialRequirements,
        deliveryAddress: order.deliveryAddress,

        // Pricing
        subtotal: session.subtotal || 0,
        deliveryFee: session.deliveryFee || 0,
        sessionTotal: session.sessionTotal || 0,
        customerTotal: calculateSessionCustomerTotal(session, restaurantId),
        restaurantNetAmount: calculateSessionNetEarnings(session, restaurantId),
        promoDiscount: session.promoDiscount,
        promotionDiscount: session.promotionDiscount,

        // Status & review
        status: determineSessionStatus(session, order, restaurantId),
        restaurantReviews: session.restaurantReviews,
        isUnassigned: order.isUnassigned,

        // Parent order reference
        parentOrderId: order.id,
        restaurantPayoutDetails: order.restaurantPayoutDetails,

        // Flag
        isMealSession: true,
      });
    }
  } else {
    // Single-meal order (legacy or no sessions): treat as-is
    const allOrderItems = order.restaurants || order.orderItems || [];

    // Filter order items to only include this restaurant's items
    const filteredOrderItems = filterOrderItemsForRestaurant(
      allOrderItems,
      restaurantId
    );

    // Skip this order if the restaurant has no items in it
    if (filteredOrderItems.length === 0) return items;

    items.push({
      // Identifiers
      displayId: order.id,
      orderReference: order.id,
      sessionName: undefined,

      // Timing
      eventDate: order.eventDate,
      eventTime: order.eventTime,
      collectionTime: order.collectionTime,

      // Order data - filtered to only this restaurant's items
      orderItems: filteredOrderItems,
      guestCount: order.guestCount,
      specialRequirements: order.specialRequirements,
      deliveryAddress: order.deliveryAddress,

      // Pricing
      subtotal: order.subtotal || 0,
      deliveryFee: order.deliveryFee || 0,
      sessionTotal: order.finalTotal || order.estimatedTotal || 0,
      customerTotal: calculateOrderCustomerTotal(order, restaurantId),
      restaurantNetAmount: calculateOrderNetEarnings(order, restaurantId),
      promoDiscount: order.promoDiscount,
      promotionDiscount: order.promotionDiscount,

      // Status & review
      status: order.status,
      restaurantReviews: order.restaurantReviews,
      isUnassigned: order.isUnassigned,

      // Parent order reference (same as displayId for non-session orders)
      parentOrderId: order.id,
      restaurantPayoutDetails: order.restaurantPayoutDetails,

      // Flag
      isMealSession: false,
    });
  }

  return items;
}

/**
 * Flatten all orders into display items
 * Main export - used by CateringOrdersList
 */
export function flattenOrdersToDisplayItems(
  orders: CateringOrderResponse[],
  restaurantId: string
): FlattenedOrderItem[] {
  const items: FlattenedOrderItem[] = [];

  for (const order of orders) {
    items.push(...flattenOrder(order, restaurantId));
  }

  // Sort by event date (most recent first), then by session order
  items.sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);

    // Different dates: sort by date descending
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }

    // Same date: sort by time
    return a.eventTime.localeCompare(b.eventTime);
  });

  return items;
}

/**
 * Group flattened items by parent order ID
 * Useful for displaying related sessions together
 */
export function groupByParentOrder(
  items: FlattenedOrderItem[]
): Map<string, FlattenedOrderItem[]> {
  const grouped = new Map<string, FlattenedOrderItem[]>();

  for (const item of items) {
    const existing = grouped.get(item.parentOrderId) || [];
    existing.push(item);
    grouped.set(item.parentOrderId, existing);
  }

  return grouped;
}

/**
 * Check if any flattened item in a list needs review
 */
export function hasItemsNeedingReview(
  items: FlattenedOrderItem[],
  restaurantId: string
): boolean {
  return items.some(
    (item) =>
      item.status === 'admin_reviewed' &&
      !item.restaurantReviews?.includes(restaurantId)
  );
}
