/**
 * DTOs for CateringOrderCard component
 * Clear, typed interfaces with no business logic
 */

import { CateringOrderResponse } from "@/types/api";

/**
 * Props for the main CateringOrderCard component
 */
export interface CateringOrderCardProps {
  order: CateringOrderResponse & { isUnassigned?: boolean };
  restaurantId: string;
  onReview: (orderId: string, accepted: boolean) => Promise<void>;
  reviewing: string | null;
  availableAccounts: Record<string, PayoutAccountDto>;
  selectedAccounts: Record<string, string>;
  onAccountSelect: (orderId: string, accountId: string) => void;
  loadingAccounts: boolean;
  token?: string;
  onClaim: (orderId: string) => Promise<void>;
  claiming: string | null;
}

/**
 * Payout account information
 */
export interface PayoutAccountDto {
  id: string;
  name: string;
  accountNumber?: string;
  sortCode?: string;
}

/**
 * Order status configuration
 */
export interface OrderStatusConfig {
  color: string;
  label: string;
}

/**
 * Pricing display data for a menu item
 */
export interface MenuItemPricingDto {
  netEarnings: number;
  netEarningsPerUnit: number;
  grossPrice: number;
  grossPricePerUnit: number;
  customerPrice: number;
  quantity: number;
  commissionRate?: number;
}

/**
 * Event information display data
 */
export interface EventInfoDto {
  eventDate: string | Date;
  collectionTime?: string;
  deliveryAddress?: string;
  payoutAccountName: string | null;
}

// ============================================================================
// FLATTENED ORDER ITEM (for meal session support)
// ============================================================================

/**
 * Flattened item that CateringOrderCard will display.
 * Normalizes both legacy orders (no mealSessions) and individual meal sessions
 * into a common display format. Restaurants see each as a separate "order card".
 */
export interface FlattenedOrderItem {
  // Display identifiers
  displayId: string;           // mealSession.id or order.id
  orderReference: string;      // Parent order ID (first 4 chars shown)
  sessionName?: string;        // "Breakfast", "Lunch" - only for meal sessions

  // Timing (session-level or order-level)
  eventDate: string | Date;
  eventTime: string;
  collectionTime?: string;

  // Order data
  orderItems: any[];           // PricingOrderItem[] - restaurant order items
  guestCount?: number;
  specialRequirements?: string;
  deliveryAddress?: string | { street: string; city: string; postcode: string; country: string };

  // Pricing (session-level or order-level)
  subtotal: number;
  deliveryFee: number;
  sessionTotal: number;        // For sessions, or finalTotal for orders
  customerTotal: number;       // What customer pays to this specific restaurant
  restaurantNetAmount: number;
  promoDiscount?: number;
  promotionDiscount?: number;

  // Status & review
  status: string;
  restaurantReviews?: string[];
  isUnassigned?: boolean;

  // Parent order reference (for account assignment, payout details)
  parentOrderId: string;
  restaurantPayoutDetails?: Record<string, {
    accountId?: string;
    accountName?: string;
    selectedAccountId?: string;
    stripeAccountId?: string;
    earningsAmount?: number;
    selectedAt?: string;
  }>;

  // Flags
  isMealSession: boolean;
}

/**
 * Props for the CateringOrderCard component using flattened items
 */
export interface FlattenedOrderCardProps {
  item: FlattenedOrderItem;
  restaurantId: string;
  onReview: (displayId: string, accepted: boolean, isMealSession: boolean) => Promise<void>;
  reviewing: string | null;
  availableAccounts: Record<string, PayoutAccountDto>;
  selectedAccounts: Record<string, string>;
  onAccountSelect: (parentOrderId: string, accountId: string) => void;
  loadingAccounts: boolean;
  token?: string;
  onClaim: (parentOrderId: string) => Promise<void>;
  claiming: string | null;
}
