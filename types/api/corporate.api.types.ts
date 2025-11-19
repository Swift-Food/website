/**
 * API TYPE DEFINITIONS - Corporate Order DTOs
 *
 * These types MUST match the backend DTOs exactly:
 * Backend: src/features/order-management/corporate-order/dto/corporate-order-response.dto.ts
 *
 * IMPORTANT: Do not modify these types without updating the corresponding backend DTOs
 * Any field name changes here MUST be reflected in the backend
 */

import { PricingOrderItem } from './pricing.api.types';

/**
 * Corporate order status enum
 * Backend: CorporateOrderStatus
 */
export type CorporateOrderStatus =
  | 'pending_approval'
  | 'approved'
  | 'ready_for_checkout'
  | 'processing_payment'
  | 'paid'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'failed';

/**
 * Sub-order status enum
 * Backend: SubOrderStatus
 */
export type SubOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

/**
 * Individual employee sub-order response
 * Backend: SubOrderResponseDto
 */
export interface SubOrderResponse {
  id: string;
  status: SubOrderStatus;
  employeeName: string;
  employeeEmail: string;

  // Clear pricing breakdown
  restaurants: PricingOrderItem[];

  // Sub-order totals
  customerTotal: number;
  platformCommission: number;
  restaurantGross: number;
  restaurantNet: number;

  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Complete corporate order response with pricing breakdown
 * Backend: CorporateOrderResponseDto
 */
export interface CorporateOrderResponse {
  id: string;
  orderReference: string;
  deliveryDate: string | Date;
  deliveryTime?: string;
  status: CorporateOrderStatus;

  // Organization info
  organizationId: string;
  organizationName: string;
  managerName?: string;
  managerEmail?: string;

  // Sub-orders (individual employee orders)
  subOrders: SubOrderResponse[];

  // Aggregated restaurant breakdown across all sub-orders
  restaurantBreakdown: PricingOrderItem[];

  // Order totals
  customerFinalTotal: number;
  platformCommissionRevenue: number;
  restaurantsTotalGross: number;
  restaurantsTotalNet: number;

  // Payment info
  paid: boolean;
  paymentIntentId?: string;
  paidAt?: string | Date;

  // Delivery info
  deliveryAddress?: string | {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Lightweight corporate order summary for list endpoints
 * Backend: CorporateOrderSummaryDto
 */
export interface CorporateOrderSummary {
  id: string;
  orderReference: string;
  deliveryDate: string | Date;
  status: CorporateOrderStatus;
  organizationName: string;
  customerFinalTotal: number;
  subOrderCount: number;
  restaurantCount: number;
  paid: boolean;
  createdAt: string | Date;
}
