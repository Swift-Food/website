/**
 * API TYPE DEFINITIONS - Catering Order DTOs
 *
 * These types MUST match the backend DTOs exactly:
 * Backend: src/features/order-management/catering/dto/catering-order-response.dto.ts
 *
 * IMPORTANT: Do not modify these types without updating the corresponding backend DTOs
 * Any field name changes here MUST be reflected in the backend
 */

import { PricingOrderItem } from './pricing.api.types';

/**
 * Catering order status enum
 * Backend: CateringOrderStatus
 */
export type CateringOrderStatus =
  | 'pending_review'
  | 'admin_reviewed'
  | 'restaurant_reviewed'
  | 'payment_link_sent'
  | 'paid'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

/**
 * Complete catering order response with pricing breakdown
 * Backend: CateringOrderResponseDto
 *
 * Note: This is a SUBSET of fields - backend returns more fields for internal use.
 * Only commonly used frontend fields are typed here.
 */
export interface CateringOrderResponse {
  id: string;
  orderReference: string;
  eventDate: string | Date;
  deliveryDate: string | Date; // Alias for eventDate
  eventTime: string;
  deliveryTime: string; // Alias for eventTime
  status: CateringOrderStatus;

  // Clear pricing breakdown
  restaurants: PricingOrderItem[];

  // Order totals
  customerFinalTotal: number;
  platformCommissionRevenue: number;
  restaurantsTotalGross: number;
  restaurantsTotalNet: number;

  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType?: string;
  guestCount?: number;

  // Delivery info
  deliveryAddress?: string | {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };

  // Pickup info
  pickupContactName?: string;
  pickupContactPhone?: string;
  pickupContactEmail?: string;

  // Delivery time tracking
  deliveryTimeChangedAt?: string | Date;
  deliveryTimeChangedBy?: string;

  // Additional info
  specialInstructions?: string;
  accessToken?: string;
  sharedAccessUsers?: Array<{
    userId: string;
    email: string;
    role: 'viewer' | 'editor';
    accessToken?: string;
    name?: string;
    addedAt?: string | Date;
    addedBy?: string;
  }>;

  // Payment info
  stripePaymentIntentId?: string;
  paid: boolean;
  paymentLinkUrl?: string;
  paymentLinkSentAt?: string | Date;
  paidAt?: string | Date;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string | Date;
  subtotal?: number;
  serviceCharge?: number;
  deliveryFee?: number;
  promoDiscount?: number;
  depositAmount?: number;
  estimatedTotal?: number;
  finalTotal?: number;

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;

  // Legacy/internal fields (may be present in some endpoints)
  userId?: string;
  ccEmails?: string[];
  collectionTime?: string;
  promoCodes?: string[];
  organization?: string;
  publicNote?: string;
  orderItems?: any[]; // Legacy format
  restaurantTotalCost?: number; // Legacy field
  isUnassigned?: boolean; // Restaurant endpoint only
  restaurantPayoutDetails?: Record<string, {
    accountId: string;
    accountName: string;
  }>;
  promotionDiscount?: number; // Legacy field name (use promoDiscount)
}

/**
 * Lightweight catering order summary for list endpoints
 * Backend: CateringOrderSummaryDto
 */
export interface CateringOrderSummary {
  id: string;
  orderReference: string;
  eventDate: string | Date;
  deliveryDate: string | Date; // Alias
  eventTime?: string;
  status: CateringOrderStatus;
  customerFinalTotal: number;
  restaurantCount: number;
  customerName: string;
  guestCount?: number;
  eventType?: string;
  paid: boolean;
  createdAt: string | Date;
}
