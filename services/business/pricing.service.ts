/**
 * PricingService
 * Centralized pricing calculations
 */

export interface PricingItem {
  unitPrice: number;
  quantity: number;
  discountPercentage?: number;
}

export interface PricingBreakdown {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  serviceCharge: number;
  total: number;
}

export interface CommissionCalculation {
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
}

class PricingService {
  private readonly DEFAULT_COMMISSION_RATE = 20; // 20%

  /**
   * Calculate total for items
   */
  calculateItemsTotal(items: PricingItem[]): number {
    return items.reduce((total, item) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      const discount = item.discountPercentage
        ? (itemSubtotal * item.discountPercentage) / 100
        : 0;
      return total + (itemSubtotal - discount);
    }, 0);
  }

  /**
   * Calculate commission
   */
  calculateCommission(
    grossAmount: number,
    commissionRate: number = this.DEFAULT_COMMISSION_RATE
  ): CommissionCalculation {
    const commissionAmount = (grossAmount * commissionRate) / 100;
    const netAmount = grossAmount - commissionAmount;

    return {
      grossAmount,
      commissionRate,
      commissionAmount,
      netAmount,
    };
  }

  /**
   * Calculate complete pricing breakdown
   */
  calculatePricingBreakdown(
    items: PricingItem[],
    deliveryFee: number = 0,
    serviceChargePercentage: number = 0,
    promoCodeDiscount: number = 0
  ): PricingBreakdown {
    const subtotal = this.calculateItemsTotal(items);
    const serviceCharge = (subtotal * serviceChargePercentage) / 100;
    const discount = promoCodeDiscount;
    const total = subtotal + deliveryFee + serviceCharge - discount;

    return {
      subtotal,
      discount,
      deliveryFee,
      serviceCharge,
      total: Math.max(0, total), // Ensure non-negative
    };
  }

  /**
   * Apply promo code discount
   */
  applyPromoDiscount(
    subtotal: number,
    discountType: 'percentage' | 'fixed',
    discountValue: number
  ): number {
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }
}

export const pricingService = new PricingService();
