/**
 * LEGACY CATERING TYPES
 *
 * ⚠️ IMPORTANT: This file contains MIXED types:
 *
 * 1. **Frontend-only types** (✅ USE THESE):
 *    - EventDetails, SelectedMenuItem, ContactInfo
 *    - SearchResult, SearchResponse, SearchFilters
 *    - DTOs for SENDING to backend (CreateCateringOrderDto, OrderItemDto)
 *
 * 2. **API Response types** (⚠️ PREFER types/api/ instead):
 *    - CateringOrderDetails, PricingOrderItemDto, etc.
 *    - For NEW code, use types from @/types/api/catering.api.types
 *    - These are kept for backwards compatibility only
 *
 * See: /types/api/README.md for migration guide
 */

import { MenuItem } from "@/lib/components/catering/Step2MenuItems";

export interface SelectedAddon {
  name: string;
  price: number;
  quantity: number;
  groupTitle: string;
}

export interface SearchResult {
  type: "restaurant" | "menu_item";
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: string;
  isDiscount: boolean;
  discountPrice?: string;
  groupTitle?: string;
  cateringQuantityUnit?: number;
  feedsPerUnit?: number;
  rating?: number;
  reviews?: number;
  isOpen?: boolean;
  openHours?: string;
  openingHours?: any[];
  marketId?: string;
  restaurantId: string;
  fsa?: number;
  fsaLink?: string;
  minimumDeliveryNoticeHours?: number;
  addonPrice?: number;
  itemDisplayOrder: number;
  addons: any[];
  allergens?: string[];
  averageRating?: string;
  status?: string;
  portionQuantity?: number;
  selectedAddons?: {
    name: string;
    price: number;
    quantity: number;
    groupTitle: string;
  }[];
  restaurant?: {
    id: string;
    name: string;
    description: string;
    matchType: string;
    image: string[];
    rating: string;
    reviews: number;
    isOpen: boolean;
    openHours: string;
    openingHours: any[];
    minimumDeliveryNoticeHours?: number;
    marketId: string;
    restaurantId: string;
    fsa?: number;
    fsaLink?: string;
  };
  score: number;
  matchType: "exact" | "prefix" | "word" | "partial" | "description";
}

export interface SearchResponse {
  restaurants: any[];
  menuItems: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface SearchFilters {
  page?: number;
  limit?: number;
  marketId?: string;
  categoryId?: string;
  minRating?: number;
  maxPrice?: number;
  dietaryFilters?: string[];
  allergens?: string[];
}

export enum CorporateUserRole {
  employee = "EMPLOYEE",
  manager = "MANAGER",
  admin = "ADMIN",
}

export enum CorporateUserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export interface CorporateUser {
  id: string;
  userId: string;
  organizationId: string;
  corporateRole: CorporateUserRole;
  email: string;

  // Employee info
  employeeCode?: string;
  fullName: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  designation?: string;

  // Budget configuration
  dailyBudgetLimit?: number;
  monthlyBudgetLimit?: number;

  // Budget tracking
  dailyBudgetSpent: number;
  monthlyBudgetSpent: number;
  lastMonthlyReset?: Date | string;
  lastDailyReset?: Date | string;

  // Preferences
  dietaryRestrictions?: string[];
  defaultDeliveryAddressId?: string;

  // Status
  status: CorporateUserStatus;
  canOrder: boolean;

  // Approval info
  approvedBy?: string;
  approvedAt?: Date | string;

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;

  // Job Title
  jobTitleId?: string | null;

  // Relations (optional - populate when needed)
  user?: {
    email?: string;
    phoneNumber?: string;
    [key: string]: any;
  };
  organization?: {
    name?: string;
    [key: string]: any;
  };
  // user?: User; // TODO: Define User type if needed
  // organization?: Organization; // TODO: Define Organization type if needed
  // subOrders?: CorporateSubOrder[]; // TODO: Define CorporateSubOrder type if needed
  // jobTitle?: JobTitle; // TODO: Define JobTitle type if needed
}

export interface EventDetails {
  eventType: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  specialRequests?: string;
  address: string;
  userType: "guest" | "corporate";
  // corporateUser: null | CorporateUser;
}

export interface SelectedMenuItem {
  item: SearchResult | MenuItem;
  quantity: number;
}

export interface ContactInfo {
  organization: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
}

export interface CateringOrder {
  eventDetails: EventDetails;
  selectedItems: SelectedMenuItem[];
  contactInfo: ContactInfo;
}

/**
 * @deprecated This is the OLD format - DO NOT use for new order creation!
 *
 * Still temporarily used ONLY for:
 * - Pricing verification (POST /pricing/catering-verify-cart)
 * - Promo validation (POST /promotions/validate-catering)
 *
 * For ORDER CREATION, use CateringRestaurantOrderRequest from @/types/api instead.
 * The backend will migrate these pricing endpoints to use the new format soon.
 */
export interface OrderItemDto {
  restaurantId: string;
  restaurantName: string;
  menuItems: {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customerTotalPrice?: number; // New pricing format field
    selectedAddons?: SelectedAddon[];
    addonPrice?: number;
    cateringQuantityUnit?: number;
    feedsPerUnit?: number;
    // New pricing fields
    restaurantNetAmount?: number;
    commissionPrice?: number;
    restaurantBaseTotalPrice?: number;
    restaurantBaseUnitPrice?: number;
    commissionRate?: number;
    priceForRestaurant?: number;
  }[];
  status: string;
  restaurantCost: number;
  totalPrice: number;
  specialInstructions?: string;
  promotionDiscount?: number; // Promotion discount applied
}

// ============================================================================
// DEPRECATED API RESPONSE TYPES - Use types from @/types/api/ instead
// ============================================================================
// These types are kept for backwards compatibility but should not be used
// in new code. For API responses, prefer:
// - @/types/api/pricing.api.types for pricing types
// - @/types/api/catering.api.types for catering order responses
// ============================================================================

/**
 * @deprecated Use PricingAddon from @/types/api/pricing.api.types instead
 */
export interface PricingAddonDto {
  name: string;
  price: number;
  quantity: number;
  groupTitle: string;
}

/**
 * @deprecated Use PricingMenuItem from @/types/api/pricing.api.types instead
 */
export interface PricingMenuItemDto {
  menuItemId: string;
  name: string;
  quantity: number;

  // Customer Layer - What customer pays
  customerUnitPrice: number;
  customerTotalPrice: number;

  // Restaurant Layer - Before commission
  restaurantBaseUnitPrice: number;
  restaurantBaseTotalPrice: number;

  // Commission
  commissionRate: number;
  commissionAmount: number;
  restaurantNetAmount: number;

  // Discount Info
  isDiscounted: boolean;
  originalUnitPrice?: number;
  discountAmount?: number;
  discountType?: "PLATFORM_ABSORBED" | "RESTAURANT_ABSORBED";

  // Platform Layer
  platformCommissionRevenue: number;
  platformAbsorbedDiscount: number;
  platformNetRevenue: number;

  // Additional Info
  selectedAddons: PricingAddonDto[];
  cateringQuantityUnit?: number;
  feedsPerUnit?: number;
  restaurantId: string;
}

/**
 * @deprecated Use PricingOrderItem from @/types/api/pricing.api.types instead
 */
export interface PricingOrderItemDto {
  restaurantId: string;
  restaurantName: string;
  status: string;
  menuItems: PricingMenuItemDto[];

  // Commission info
  commissionRate: number;

  // Customer totals
  customerTotal: number;
  customerTotalAfterPromotions: number;

  // Restaurant totals
  restaurantBaseTotal: number;
  restaurantPromotionDiscount: number;
  restaurantBaseTotalAfterPromotions: number;
  restaurantCommissionTotal: number;
  restaurantNetEarning: number;

  // Platform totals
  platformCommissionRevenue: number;
  platformAbsorbedDiscountTotal: number;
  platformNetRevenue: number;

  // Discount summary
  totalDiscountAmount: number;
  discountedItemsCount: number;
  totalItemsCount: number;
  appliedPromotions: any[];
}

/**
 * @deprecated Legacy type - use types from @/types/api/ instead
 */
export interface PricingBreakdownDto {
  orderId: string;
  orderType: "CATERING" | "CORPORATE";

  // Customer totals
  customerSubtotal: number;
  customerDeliveryFee: number;
  customerServiceCharge: number;
  promoCodeDiscount: number;
  customerFinalTotal: number;

  // Promo code info
  promoCode?: string;
  promoCodeAbsorbedBy?: "PLATFORM" | "RESTAURANT";

  // Per-restaurant breakdown
  restaurants: PricingOrderItemDto[];
}

export interface RestaurantPayoutDto {
  restaurantName: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  menuItems: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    addon: string;
  }[];
}

/**
 * @deprecated Use CreateCateringOrderRequest from @/types/api/catering.request.types instead
 *
 * This legacy type uses OrderItemDto which includes client-calculated prices.
 * The new format uses CateringRestaurantOrderRequest with minimal data (IDs and quantities only).
 * Backend calculates all pricing server-side for accuracy.
 */
export interface CreateCateringOrderDto {
  userId: string;
  organization: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ccEmails: string[];
  eventDate: string;
  eventTime: string;
  collectionTime?: string;
  guestCount: number;
  eventType?: string;
  deliveryAddress: string;
  specialRequirements?: string;
  orderItems: OrderItemDto[];
  estimatedTotal?: number;
  promoCodes?: string[];
  corporateUserId?: string;
  organizationId?: string;
  useOrganizationWallet?: boolean;
  paymentMethodId?: string;
  paymentIntentId?: string;
}

/**
 * @deprecated No longer used - pricing endpoints now accept CateringRestaurantOrderRequest[]
 *
 * The backend pricing endpoints have been updated to accept minimal format
 * (CateringRestaurantOrderRequest with just IDs and quantities).
 * Backend calculates all pricing from database.
 */
export interface CateringPricingData {
  orderItems: OrderItemDto[];
  deliveryAddressId: string;
  promoCodes?: string[];
}

export interface CateringPricingResult {
  isValid: boolean;
  subtotal: number;
  deliveryFee: number;
  restaurantPromotionDiscount?: number; // NEW: Restaurant promotion discount
  totalDiscount?: number; // NEW: Combined discount
  promoDiscount?: number;
  total: number;
  error?: string;
}

export interface PromoCodeValidation {
  valid: boolean;
  reason?: string;
  discount?: number;
}

// NEW TYPES FOR DASHBOARD
export interface SharedAccessUser {
  email: string;
  name: string;
  accessToken: string;
  addedAt: string;
  addedBy: string;
  role: SharedAccessRole;
}

export enum CateringOrderStatus {
  PENDING_REVIEW = "pending_review",
  ADMIN_REVIEWED = "admin_reviewed",
  RESTAURANT_REVIEWED = "restaurant_reviewed",
  PAYMENT_LINK_SENT = "payment_link_sent",
  PAID = "paid",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

/**
 * @deprecated Use CateringOrderResponse from @/types/api/catering.api.types instead
 *
 * This legacy type has field name mismatches with backend DTOs.
 * For API responses, use the strict types from @/types/api/ to prevent bugs.
 */
export interface CateringOrderDetails {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  organization?: string;
  publicNote?: string;
  ccEmails: string[];
  eventDate: string;
  eventTime: string;
  collectionTime: string;
  guestCount: number;
  eventType: string;
  deliveryAddress: string;
  specialRequirements?: string;
  orderItems: OrderItemDto[]; // Legacy format still returned by some endpoints
  restaurants?: PricingOrderItemDto[]; // NEW: Clear pricing format returned by new endpoints
  estimatedTotal: number;
  finalTotal: number;
  depositAmount: number;
  status: CateringOrderStatus;
  paymentId?: string;
  paymentLinkUrl?: string;
  paymentLinkSentAt?: string;
  paidAt?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  promoCodes: string[];
  promoDiscount: number;
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  sharedAccessUsers?: SharedAccessUser[];
  pickupContactName?: string;
  pickupContactPhone?: string;
  pickupContactEmail?: string;
  deliveryTimeChangedAt?: string;
  deliveryTimeChangedBy?: string;
  createdAt: string;
  updatedAt: string;

  // NEW: Clear pricing totals
  customerFinalTotal?: number;
  platformCommissionRevenue?: number;
  restaurantsTotalGross?: number;
  restaurantsTotalNet?: number;

  // Restaurant payout details
  restaurantPayoutDetails?: Record<string, {
    accountId: string;
    accountName: string;
  }>;

  // Legacy fields for backwards compatibility
  restaurantTotalCost?: number;
  promotionDiscount?: number;
  isUnassigned?: boolean; // Flag for unassigned orders
}

export enum SharedAccessRole {
  VIEWER = "viewer",
  MANAGER = "manager",
}

export interface AddSharedAccessDto {
  orderId: string;
  email: string;
  name: string;
  userId?: string;
  role: SharedAccessRole;
}

export interface RemoveSharedAccessDto {
  orderId: string;
  email: string;
}

export interface UpdatePickupContactDto {
  orderId: string;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupContactEmail: string;
  userId?: string;
  accessToken?: string;
}
export interface UpdateSharedAccessRoleDto {
  orderId: string;
  email: string;
  newRole: SharedAccessRole;
}

export interface UpdateDeliveryTimeDto {
  orderId: string;
  newEventTime: string;
  newCollectionTime?: string;
  userId?: string;
  accessToken?: string;
}

// MENU MANAGEMENT TYPES
export interface MenuItemAddon {
  name: string;
  price: number;
  allergens: string[];
  groupTitle?: string;
  selectionType?: "single" | "multiple";
  isRequired?: boolean;
}

export enum MenuItemStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
  SOLD_OUT = "SOLD_OUT",
  CATERING = "CATERING",
}

export enum MenuItemStyle {
  CARD = "CARD",
  HORIZONTAL = "HORIZONTAL",
}

export interface MenuCategory {
  id: string;
  name: string;
  images: string | null;
  clicks: number;
}

export interface CreateMenuItemDto {
  restaurantId: string;
  categoryIds: string[];
  groupTitle: string;
  name: string;
  description: string;
  price: number;
  prepTime: number;
  discountPrice?: number;
  isDiscount?: boolean;
  image: string;
  isAvailable: boolean;
  allergens: string[];
  addons: MenuItemAddon[] | null;
  itemDisplayOrder?: number;
  popular?: boolean;
  style?: MenuItemStyle;
  status: MenuItemStatus;
}

export interface MenuItemDetails extends CreateMenuItemDto {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  averageRating: string;
  categories?: MenuCategory[];

}

export interface UpdateMenuItemDto {
  categoryIds?: string[];
  groupTitle?: string;
  name?: string;
  description?: string;
  price?: number;
  prepTime?: number;
  discountPrice?: number;
  isDiscount?: boolean;
  image?: string;
  isAvailable?: boolean;
  allergens?: string[];
  addons?: MenuItemAddon[] | null;
  itemDisplayOrder?: number;
  popular?: boolean;
  style?: MenuItemStyle;
  status?: MenuItemStatus;
}
