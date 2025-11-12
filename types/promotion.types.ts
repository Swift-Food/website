// types/promotion.types.ts
export type PromotionType = 'RESTAURANT_WIDE' | 'GROUP_WIDE' | 'BUY_MORE_SAVE_MORE' | 'BOGO' | 'BOGO_ITEM';
export type PromotionStatus = 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'EXPIRED';
export type PromotionApplicability = 'CATERING' | 'CORPORATE' | 'BOTH';

export interface PromotionTypeInfo {
  type: PromotionType;
  title: string;
  description: string;
  icon: string;
  available: boolean;
  comingSoon?: boolean;
}

export const PROMOTION_TYPES: PromotionTypeInfo[] = [
  {
    type: 'RESTAURANT_WIDE',
    title: 'Restaurant-Wide Discount',
    description: 'Apply a percentage discount to all orders from your restaurant',
    icon: '🏪',
    available: true,
  },
  {
    type: 'GROUP_WIDE',
    title: 'Menu Group Discount',
    description: 'Discount specific menu categories or groups',
    icon: '📁',
    available: true,
    comingSoon: true,
  },
  {
    type: 'BUY_MORE_SAVE_MORE',
    title: 'Buy More Save More',
    description: 'Tiered discounts based on order quantity or amount',
    icon: '📊',
    available: true,
    comingSoon: true,
  },
  {
    type: 'BOGO',
    title: 'Buy One Get One',
    description: 'Buy one item, get another free or at a discount',
    icon: '🎁',
    available: false,
    comingSoon: true,
  },
  {
    type: 'BOGO_ITEM',
    title: 'BOGO Specific Item',
    description: 'Buy specific item, get a different item free',
    icon: '🎯',
    available: false,
    comingSoon: true,
  },
];