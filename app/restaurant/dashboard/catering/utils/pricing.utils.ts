/**
 * Pricing calculation utilities
 * Pure functions with no side effects
 */

import { MenuItemPricingDto } from "../types/order-card.dto";

/**
 * Get restaurant net earnings for an item
 * Uses new clear API if available, otherwise falls back to legacy
 */
export function getItemNetEarnings(item: any): number {
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
}

/**
 * Get gross price (before commission) for an item
 * Uses new clear API if available, otherwise falls back to legacy
 */
export function getItemGrossPrice(item: any): number {
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
}

/**
 * Get customer price for an item
 * Uses new clear API if available, otherwise falls back to legacy
 */
export function getItemCustomerPrice(item: any): number {
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
}

/**
 * Calculate complete pricing information for a menu item
 */
export function calculateMenuItemPricing(item: any): MenuItemPricingDto {
  const netEarnings = getItemNetEarnings(item);
  const grossPrice = getItemGrossPrice(item);
  const customerPrice = getItemCustomerPrice(item);
  const quantity = item.quantity || 1;

  return {
    netEarnings,
    netEarningsPerUnit: netEarnings / quantity,
    grossPrice,
    grossPricePerUnit: grossPrice / quantity,
    customerPrice,
    quantity,
    commissionRate: item.commissionRate,
  };
}

/**
 * Order items belonging to a specific restaurant
 */
export function getRestaurantOrderItems(order: any, restaurantId: string): any[] {
  const restaurants = order.restaurants || order.orderItems || [];
  return restaurants.filter((item: any) => item.restaurantId === restaurantId);
}

/**
 * Restaurant net earnings for an order
 * Prefers earningsAmount from payoutDetails as it includes adjustments
 */
export function getRestaurantNetEarnings(order: any, restaurantId: string): number {
  const payoutDetail = order.restaurantPayoutDetails?.[restaurantId];
  if (payoutDetail?.earningsAmount !== undefined) {
    return payoutDetail.earningsAmount;
  }
  return getRestaurantOrderItems(order, restaurantId).reduce(
    (total: number, item: any) => {
      if (item.restaurantNetAmount !== undefined) {
        return total + item.restaurantNetAmount;
      }
      const menuItemTotal =
        item.menuItems?.reduce(
          (sum: number, menuItem: any) => sum + (menuItem.restaurantNetAmount || 0),
          0
        ) || 0;
      return total + menuItemTotal;
    },
    0
  );
}

/**
 * Total the customer pays for this restaurant's part of an order
 */
export function getRestaurantCustomerTotal(order: any, restaurantId: string): number {
  return getRestaurantOrderItems(order, restaurantId).reduce(
    (total: number, item: any) => {
      if (item.customerTotal !== undefined) {
        return total + item.customerTotal;
      }
      const menuItemTotal =
        item.menuItems?.reduce(
          (sum: number, menuItem: any) => sum + (menuItem.customerTotalPrice || 0),
          0
        ) || 0;
      return total + menuItemTotal;
    },
    0
  );
}
