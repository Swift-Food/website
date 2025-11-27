/**
 * Pricing Service for Contact Details Feature
 * Handles pricing calculations for catering orders
 */

import { SelectedMenuItem } from '@/types/catering.types';
import { cateringService } from '@/services/api/catering.api';
import { CateringRestaurantOrderRequest } from '@/types/api/catering.request.types';

interface GroupedRestaurantItems {
  restaurantId: string;
  restaurantName: string;
  items: any[];
}

class ContactDetailsPricingService {
  /**
   * Calculate estimated total from selected items
   */
  calculateEstimatedTotal(selectedItems: SelectedMenuItem[]): number {
    return selectedItems.reduce((total, { item, quantity }) => {
      const price = parseFloat(item.price?.toString() || '0');
      const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
      const unitPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;

      // Addon total = sum of (addonPrice × addonQuantity) - no scaling multipliers
      const addonTotal = (item.selectedAddons || []).reduce(
        (sum, { price, quantity }) => {
          return sum + (price || 0) * (quantity || 0);
        },
        0
      );

      return total + unitPrice * quantity + addonTotal;
    }, 0);
  }

  /**
   * Group items by restaurant
   */
  private groupItemsByRestaurant(
    selectedItems: SelectedMenuItem[]
  ): Record<string, GroupedRestaurantItems> {
    return selectedItems.reduce(
      (acc, { item, quantity }) => {
        const restaurantId = item.restaurant?.restaurantId || item.restaurantId || 'unknown';
        const restaurantName = item.restaurant?.name || 'Unknown Restaurant';

        if (!acc[restaurantId]) {
          acc[restaurantId] = {
            restaurantId,
            restaurantName,
            items: [],
          };
        }

        const price = parseFloat(item.price?.toString() || '0');
        const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
        const unitPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;

        // Addon total = sum of (addonPrice × addonQuantity) - no scaling multipliers
        const addonTotal = (item.selectedAddons || []).reduce(
          (sum, { price, quantity }) => {
            return sum + (price || 0) * (quantity || 0);
          },
          0
        );

        // Total price includes both item price and addon price
        const itemTotalPrice = unitPrice * quantity + addonTotal;

        // Send addons as-is to backend (no quantity transformation needed)
        const transformedAddons = (item.selectedAddons || []).map((addon) => ({
          ...addon,
          quantity: addon.quantity || 0,
        }));

        acc[restaurantId].items.push({
          menuItemId: item.id,
          menuItemName: item.menuItemName,
          groupTitle: item.groupTitle,
          quantity,
          unitPrice,
          addonPrice: addonTotal,
          selectedAddons: transformedAddons,
          totalPrice: itemTotalPrice,
        });

        return acc;
      },
      {} as Record<string, GroupedRestaurantItems>
    );
  }

  /**
   * Build order items from grouped items
   * Uses minimal format - backend calculates all pricing
   */
  private buildOrderItems(groupedItems: Record<string, GroupedRestaurantItems>): CateringRestaurantOrderRequest[] {
    return Object.values(groupedItems).map((group) => ({
      restaurantId: group.restaurantId,
      menuItems: group.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        selectedAddons: item.selectedAddons?.map((addon: any) => ({
          addonId: addon.addonId,
          name: addon.name,
          quantity: addon.quantity,
          groupTitle: addon.groupTitle,
        })),
        groupTitle: item.groupTitle,
      })),
    }));
  }

  /**
   * Calculate pricing with promo codes
   */
  async calculatePricing(selectedItems: SelectedMenuItem[], promoCodes: string[]) {
    const groupedItems = this.groupItemsByRestaurant(selectedItems);
    const orderItems = this.buildOrderItems(groupedItems);

    return await cateringService.calculateCateringPricing(orderItems, promoCodes);
  }
}

export const contactDetailsPricingService = new ContactDetailsPricingService();
