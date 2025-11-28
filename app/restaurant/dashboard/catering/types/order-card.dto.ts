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
  eventDate: string;
  collectionTime: string;
  deliveryAddress: string;
  payoutAccountName: string | null;
}
