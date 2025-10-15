// Add after existing types
interface CateringOrderItem {
    restaurantId: string;
    restaurantName: string;
    menuItems: {
      menuItemId: string;
      name: string;
      quantity: number;
      totalPrice: number;
      cateringQuantityUnit?: number;
      feedsPerUnit?: number;
    }[];
    specialInstructions?: string;
  }
  
  interface CateringOrder {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventDate: string;
    eventTime: string;
    guestCount: number;
    eventType: string;
    deliveryAddress: string;
    specialRequirements?: string;
    orderItems: CateringOrderItem[];
    subtotal: number;
    serviceCharge: number;
    deliveryFee: number;
    promoDiscount: number;
    estimatedTotal: number;
    finalTotal: number;
    restaurantTotalCost: number;
    status: string;
    createdAt: string;
  }