/**
 * REQUEST TYPE DEFINITIONS - Catering Order Creation
 *
 * These types define what to SEND to the backend when creating/updating orders.
 * They are intentionally minimal - the backend recalculates all pricing.
 *
 * Backend: src/features/order-management/catering/dto/create-catering.dto.ts
 */

/**
 * Addon selection for a menu item (request format)
 * Just the selection data - backend calculates pricing
 */
export interface CateringAddonRequest {
  addonId?: string;
  name: string;
  quantity: number;
  groupTitle?: string;
}

/**
 * Menu item in an order (request format)
 * Minimal data - backend looks up item details and calculates pricing
 */
export interface CateringMenuItemRequest {
  menuItemId: string;
  quantity: number;
  selectedAddons?: CateringAddonRequest[];
  groupTitle?: string;
}

/**
 * Restaurant order item (request format)
 * Backend expects this structure in CreateCateringOrderDto.orderItems[]
 */
export interface CateringRestaurantOrderRequest {
  restaurantId: string;
  menuItems: CateringMenuItemRequest[];
  specialInstructions?: string;
}

/**
 * Create catering order request
 * This is what you send to POST /catering-orders
 */
export interface CreateCateringOrderRequest {
  userId: string;
  organization?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ccEmails?: string[];
  eventDate: string;
  eventTime: string;
  collectionTime?: string;
  guestCount?: number;
  eventType?: string;
  deliveryAddress: string;
  specialRequirements?: string;
  orderItems: CateringRestaurantOrderRequest[];
  estimatedTotal?: number;
  promoCodes?: string[];
  corporateUserId?: string;
  organizationId?: string;
  useOrganizationWallet?: boolean;
  paymentMethodId?: string;
  paymentIntentId?: string;
  paymentMethod?: 'wallet' | 'stripe_direct';
  restaurantPayoutDetails?: Record<string, {
    selectedAccountId: string;
    accountName: string;
    stripeAccountId: string;
    earningsAmount: number;
    selectedAt: string;
  }>;
}

/**
 * Update pickup contact request
 */
export interface UpdatePickupContactRequest {
  orderId: string;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupContactEmail: string;
  userId?: string;
  accessToken?: string;
}

/**
 * Update delivery time request
 */
export interface UpdateDeliveryTimeRequest {
  orderId: string;
  newEventTime: string;
  newCollectionTime?: string;
  userId?: string;
  accessToken?: string;
}

/**
 * Add shared access request
 */
export interface AddSharedAccessRequest {
  orderId: string;
  email: string;
  name: string;
  userId?: string;
  role: 'viewer' | 'manager';
}

/**
 * Remove shared access request
 */
export interface RemoveSharedAccessRequest {
  orderId: string;
  email: string;
}

/**
 * Update shared access role request
 */
export interface UpdateSharedAccessRoleRequest {
  orderId: string;
  email: string;
  newRole: 'viewer' | 'manager';
}
