// types/catering.types.ts - COMPLETE MERGED VERSION

import { MenuItem } from "@/app/components/catering/Step2MenuItems";

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
}

export enum CorporateUserRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
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
  corporateUser: null | CorporateUser;
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

export interface OrderItemDto {
  restaurantId: string;
  restaurantName: string;
  menuItems: {
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedAddons?: SelectedAddon[];
    addonPrice?: number;
    cateringQuantityUnit?: number;
    feedsPerUnit?: number;
  }[];
  status: string;
  restaurantCost: number;
  totalPrice: number;
  specialInstructions?: string;
}

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
}

export interface CateringPricingData {
  orderItems: OrderItemDto[];
  deliveryAddressId: string;
  promoCodes?: string[];
}

export interface CateringPricingResult {
  isValid: boolean;
  subtotal: number;
  deliveryFee: number;
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
  orderItems: OrderItemDto[];
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
