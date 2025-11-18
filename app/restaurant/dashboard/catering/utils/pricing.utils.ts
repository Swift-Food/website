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
