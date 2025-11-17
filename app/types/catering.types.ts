// Add after existing types
export interface CateringOrderItem {
  restaurantId: string;
  restaurantName: string;
  menuItems: {
    menuItemId: string;
    name: string;
    quantity: number;
    totalPrice: number;
    commissionPrice?: number;
    priceForRestaurant?: number;
    cateringQuantityUnit?: number;
    feedsPerUnit?: number;
  }[];
  appliedPromotions?: any[]
  promotionDiscount: number,
  specialInstructions?: string;
  totalPrice?: number;
}

export interface CateringOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  eventType: string;
  collectionTime?: string;
  deliveryAddress: string;
  specialRequirements?: string;
  orderItems: CateringOrderItem[];
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  promoDiscount: number;
  isUnassigned?: boolean;
  estimatedTotal: number;
  finalTotal: number;
  restaurantTotalCost: number;
  status: string;
  createdAt: string;
  restaurantReviews: string[];
  restaurantPayoutDetails: any;
  appliedPromotions: any[];
  promotionDiscount: number;
}
