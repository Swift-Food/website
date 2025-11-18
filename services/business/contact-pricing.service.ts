import { cateringService } from '@/services/api/catering.api';
import { CateringPricingResult } from '@/types/catering.types';

interface MenuItem {
  id: string;
  name: string;
  groupTitle?: string;
  price: string | number;
  discountPrice?: string | number;
  isDiscount?: boolean;
  feedsPerUnit?: number;
  cateringQuantityUnit?: number;
  selectedAddons?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  restaurant?: {
    restaurantId: string;
    name: string;
  };
  restaurantId?: string;
}

interface SelectedItem {
  item: MenuItem;
  quantity: number;
}

export class ContactDetailsPricingService {
  async calculatePricing(
    selectedItems: SelectedItem[],
    promoCodes: string[]
  ): Promise<CateringPricingResult | null> {
    try {
      const groupedByRestaurant = this.groupItemsByRestaurant(selectedItems);
      const orderItems = this.buildOrderItems(groupedByRestaurant);

      const pricingResult = await cateringService.calculateCateringPricing(
        orderItems,
        promoCodes
      );

      if (!pricingResult.isValid) {
        alert(pricingResult.error || 'Unable to calculate pricing');
        return null;
      }

      return pricingResult;
    } catch (error) {
      console.error('Error calculating pricing:', error);
      alert('Failed to calculate pricing. Please try again.');
      return null;
    }
  }

  private groupItemsByRestaurant(selectedItems: SelectedItem[]) {
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

        const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
        const addonPricePerUnit = (item.selectedAddons || []).reduce(
          (addonTotal, { price, quantity }) => {
            return addonTotal + (price || 0) * (quantity || 0) * DISPLAY_FEEDS_PER_UNIT;
          },
          0
        );

        const itemTotalPrice = unitPrice * quantity + addonPricePerUnit;

        const transformedAddons = (item.selectedAddons || []).map((addon) => ({
          ...addon,
          quantity: (addon.quantity || 0) * DISPLAY_FEEDS_PER_UNIT,
        }));

        acc[restaurantId].items.push({
          menuItemId: item.id,
          name: item.name,
          groupTitle: item.groupTitle,
          quantity,
          unitPrice,
          addonPrice: addonPricePerUnit,
          selectedAddons: transformedAddons,
          totalPrice: itemTotalPrice,
        });

        return acc;
      },
      {} as Record<string, { restaurantId: string; restaurantName: string; items: any[] }>
    );
  }

  private buildOrderItems(
    groupedByRestaurant: Record<string, { restaurantId: string; restaurantName: string; items: any[] }>
  ) {
    return Object.values(groupedByRestaurant).map((group: any) => {
      const restaurantTotal = group.items.reduce(
        (sum: any, item: any) => sum + item.totalPrice,
        0
      );

      return {
        restaurantId: group.restaurantId,
        restaurantName: group.restaurantName,
        menuItems: group.items,
        status: 'pending',
        restaurantCost: restaurantTotal,
        totalPrice: restaurantTotal,
      };
    });
  }

  calculateEstimatedTotal(selectedItems: SelectedItem[]): number {
    return selectedItems.reduce((total, { item, quantity }) => {
      const price = parseFloat(item.price?.toString() || '0');
      const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
      const unitPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;

      const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
      const addonPricePerUnit = (item.selectedAddons || []).reduce(
        (addonTotal, { price, quantity }) => {
          return addonTotal + (price || 0) * (quantity || 0) * DISPLAY_FEEDS_PER_UNIT;
        },
        0
      );

      return total + unitPrice * quantity + addonPricePerUnit;
    }, 0);
  }
}

export const contactDetailsPricingService = new ContactDetailsPricingService();
