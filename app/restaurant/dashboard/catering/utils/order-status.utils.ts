/**
 * Order status utilities
 * Pure functions for status-related logic
 */

import { OrderStatusConfig } from "../types/order-card.dto";

/**
 * Get status color classes
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    admin_reviewed: "bg-yellow-100 text-yellow-800 border-yellow-300",
    restaurant_reviewed: "bg-blue-100 text-blue-800 border-blue-300",
    paid: "bg-green-100 text-green-800 border-green-300",
    confirmed: "bg-green-100 text-green-800 border-green-300",
    completed: "bg-blue-100 text-blue-800 border-blue-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * Get status label
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    admin_reviewed: "REVIEW",
    restaurant_reviewed: "PENDING PAYMENT",
    paid: "CONFIRMED",
    confirmed: "CONFIRMED",
    completed: "COMPLETED",
  };
  return labels[status] || status.toUpperCase();
}

/**
 * Get complete status configuration
 */
export function getStatusConfig(status: string): OrderStatusConfig {
  return {
    color: getStatusColor(status),
    label: getStatusLabel(status),
  };
}
