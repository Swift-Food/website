/**
 * API TYPE DEFINITIONS - Guest Ticket View DTOs
 *
 * These types MUST match the backend DTOs exactly:
 * Backend: src/features/order-management/catering/dto/guest-ticket-view.dto.ts
 *
 * Used for the public guest ticket view endpoint: /event-order/view/:id
 */

/**
 * Category information for menu items
 * Backend: GuestTicketCategoryDto
 */
export interface GuestTicketCategory {
  id: string;
  name: string;
  displayOrder: number;
}

/**
 * Subcategory information for menu items
 * Backend: GuestTicketSubcategoryDto
 */
export interface GuestTicketSubcategory {
  id: string;
  name: string;
  categoryId: string;
  displayOrder: number;
}

/**
 * Addon in guest ticket view
 * Backend: GuestTicketAddonDto
 */
export interface GuestTicketAddon {
  name: string;
  quantity: number;
  customerUnitPrice: number;
}

/**
 * Menu item in guest ticket view
 * Backend: GuestTicketMenuItemDto
 */
export interface GuestTicketMenuItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  customerUnitPrice: number;
  customerTotalPrice: number;
  groupTitle?: string;
  category?: GuestTicketCategory;
  subcategory?: GuestTicketSubcategory;
  selectedAddons?: GuestTicketAddon[];
}

/**
 * Restaurant in guest ticket view
 * Backend: GuestTicketRestaurantDto
 */
export interface GuestTicketRestaurant {
  restaurantId: string;
  restaurantName: string;
  menuItems: GuestTicketMenuItem[];
  customerTotal: number;
  specialInstructions?: string;
  collectionTime?: string;
}

/**
 * Meal session in guest ticket view
 * Backend: GuestTicketMealSessionDto
 */
export interface GuestTicketMealSession {
  id: string;
  sessionName: string;
  sessionOrder: number;
  sessionDate: string | Date;
  eventTime: string;
  collectionTime?: string;
  restaurantCollectionTimes?: Record<string, string>;
  guestCount: number;
  specialRequirements?: string;
  orderItems: GuestTicketRestaurant[];

  // Session pricing
  subtotal: number;
  deliveryFee: number;
  serviceCharge: number;
  promoDiscount?: number;
  promotionDiscount?: number;
  sessionTotal: number;
}

/**
 * Address in guest ticket view
 * Backend: GuestTicketAddressDto
 */
export interface GuestTicketAddress {
  street: string;
  city: string;
  postcode: string;
  country: string;
}

/**
 * Complete guest ticket view response
 * Backend: GuestTicketViewDto
 */
export interface GuestTicketViewResponse {
  id: string;
  orderReference: string;
  currentUserRole?: 'viewer' | 'editor' | 'manager';
  eventDate: string | Date;
  eventTime: string;
  status: string;

  // Multi-meal support
  isMultiMeal: boolean;
  mealSessionCount: number;
  mealSessions?: GuestTicketMealSession[];

  // Single-meal order items (legacy)
  restaurants?: GuestTicketRestaurant[];

  // Pricing
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  promoDiscount?: number;
  finalTotal: number;

  // Customer info
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  eventType?: string;
  guestCount: number;

  // Delivery info
  deliveryAddress?: GuestTicketAddress;

  // Pickup info
  pickupContactName?: string;
  pickupContactPhone?: string;
  specialInstructions?: string;

  // Timestamps
  createdAt: string | Date;
}
