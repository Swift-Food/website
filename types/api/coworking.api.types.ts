/**
 * Partner Dashboard API Type Definitions
 * Base path: /partner-dashboard/:spaceId
 */

// ============================================================================
// SPACE
// ============================================================================

export interface CoworkingSpace {
  id: string;
  name: string;
  slug: string;
  publishableKey?: string;
  isActive: boolean;
  contactEmail?: string;
  webhookUrl?: string;
  allowedOrigins?: string[];
  aiChatEnabled?: boolean;
  aiPipelineVariant?: string;
  commission: number; // % rate; 0 = no service fee
  stripeAccountId?: string | null;
  stripeOnboardingComplete?: boolean;
  availableRestaurants?: { id: string; restaurant_name: string }[];
  selectedRestaurants?: { id: string; restaurant_name: string }[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================================================
// TASK 3 — Order list  GET /partner-dashboard/:spaceId/orders
// ============================================================================

export interface DashboardOrderSummary {
  id: string;
  status: string;
  customerName: string;
  customerEmail: string;
  eventDate: string | Date;
  eventTime: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;      // absolute £ amount (coworkingServiceFee in spec)
  serviceFeeRate: number;  // % rate snapshotted at pricing time
  finalTotal: number;      // already includes serviceFee
  createdAt: string | Date;
}

// ============================================================================
// TASK 4 — Order detail  GET /partner-dashboard/:spaceId/orders/:orderId
// ============================================================================

export interface DashboardOrderTotal {
  subtotal: number;
  deliveryFee: number;
  promoDiscount: number;
  venueHireFee: number;
  serviceFee: number;
  serviceFeeRate: number;
  finalTotal: number;
}

export interface DashboardOrderDetail {
  id: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  organization?: string;
  eventDate: string | Date;
  eventTime: string;
  guestCount?: number;
  deliveryAddress?: string;
  specialRequirements?: string;
  totals: DashboardOrderTotal;
  restaurantCount?: number;
  paid: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================================================
// TASK 5 — Calendar  GET /partner-dashboard/:spaceId/calendar
// ============================================================================

export interface CalendarOrderItem {
  id: string;
  status: string;
  customerName: string;
  customerEmail: string;
  eventTime: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  finalTotal: number;
  createdAt: string | Date;
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

// ============================================================================
// STRIPE
// ============================================================================

export interface PartnerStripeStatus {
  complete: boolean;
  currentlyDue: string[];
  detailsSubmitted: boolean;
}

// Legacy alias kept so existing CoworkingOrderStatus references don't break
export type CoworkingOrderStatus =
  | 'pending_review'
  | 'admin_reviewed'
  | 'restaurant_reviewed'
  | 'payment_link_sent'
  | 'paid'
  | 'confirmed'
  | 'cancelled'
  | 'completed';
