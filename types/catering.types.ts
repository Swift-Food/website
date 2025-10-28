// types/catering.types.ts

import { MenuItem } from "@/app/components/catering/Step2MenuItems";

export interface SelectedAddon {
  name: string;
  price: number;
  quantity: number; // For single-selection: portions with this addon; For multiple: always matches total portions
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

export interface EventDetails {
  eventType: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  specialRequests?: string;
  address: string;
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
    commissionPrice?: number;
    priceForRestaurant?: number;
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
}

export interface CateringPricingData {
  orderItems: OrderItemDto[];
  deliveryAddressId: string;
  promoCodes?: string[];
}

export interface CateringPricingResult {
  isValid: boolean;
  subtotal: number;
  // serviceCharge: number;
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
