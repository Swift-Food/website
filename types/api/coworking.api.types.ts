/**
 * Coworking Space API Type Definitions
 *
 * These types match the backend DTOs for the coworking space portal.
 * Fields marked with coworkingServiceFee are new additions per the commission feature spec.
 */

export type CoworkingOrderStatus =
  | 'pending_review'
  | 'admin_reviewed'
  | 'restaurant_reviewed'
  | 'payment_link_sent'
  | 'paid'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export interface CoworkingSpace {
  id: string;
  name: string;
  commission: number; // % rate for service fee (0 = no fee)
  depositRate?: number;
  description?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt?: string | Date;
}

// ============================================================================
// TASK 3 — Order list
// ============================================================================

/**
 * Lightweight summary returned by the coworking-dashboard order list endpoint.
 * total already includes coworkingServiceFee.
 */
export interface DashboardOrderSummary {
  id: string;
  cateringOrderId: string;
  bookingReference: string | null;
  status: string;
  adminReviewStatus: string;
  memberName: string;
  memberEmail: string;
  roomLocationDetails: string | null;
  subtotal: number;
  venueHireFee: number;
  coworkingServiceFee: number;
  coworkingServiceFeeRate?: number;
  total: number;
  itemCount: number;
  estimatedDelivery: string | null;
  bookingStartTime: string | null;
  bookingEndTime: string | null;
  createdAt: string | Date;
}

// ============================================================================
// TASK 4 — Order detail modal
// ============================================================================

/**
 * Full pricing totals block returned in the order detail response.
 * total already includes coworkingServiceFee.
 */
export interface DashboardOrderTotal {
  foodSubtotal: number;
  deliveryFee: number;
  promoDiscount: number;
  venueHireFee: number;
  coworkingServiceFee: number;
  coworkingServiceFeeRate: number;
  total: number;
}

export interface DashboardOrderDetail {
  id: string;
  orderReference?: string;
  eventDate: string | Date;
  eventTime: string;
  status: CoworkingOrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  organization?: string;
  guestCount?: number;
  deliveryAddress?: string;
  specialRequirements?: string;
  totals: DashboardOrderTotal;
  restaurantCount: number;
  paid: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================================================
// TASK 5 — Calendar
// ============================================================================

/**
 * Per-order item returned for a calendar day popover.
 * total already includes coworkingServiceFee.
 */
export interface CalendarOrderItem {
  id: string;
  orderReference?: string;
  customerName: string;
  organization?: string;
  status: CoworkingOrderStatus;
  eventTime: string;
  guestCount?: number;
  total: number;
  venueHireFee: number;
  coworkingServiceFee: number;
  coworkingServiceFeeRate: number;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  orders: CalendarOrderItem[];
}

// ============================================================================
// TASK 7 — Financial metrics
// ============================================================================

export interface CoworkingMetrics {
  totalRevenue: number;
  serviceFeeRevenue: number;
  venueHireRevenue: number;
  totalOrders: number;
  confirmedOrders: number;
  averageOrderValue: number;
  periodStart: string;
  periodEnd: string;
}
