// Inventory Management Types

/**
 * Session-Based Inventory (Unified for both catering and corporate)
 * Limits portions and specific ingredients during sessions
 * Can reset daily or twice daily (lunch/dinner)
 */
export type SessionResetPeriod = 'daily' | 'lunch_dinner' | null;

export interface InventoryConfig {
  sessionResetPeriod: SessionResetPeriod;
  maxPortionsPerSession: number | null;
  limitedIngredientsPerSession: { [ingredientName: string]: number } | null;
}

export interface InventoryStatus extends InventoryConfig {
  portionsRemaining: number | null;
  limitedIngredientsRemaining: { [ingredientName: string]: number } | null;
}

/**
 * API Response Types
 */

// GET /restaurant/:restaurantId/catering-portions-availability
export interface CateringPortionsAvailabilityResponse {
  restaurantId: string;
  restaurantName: string;
  maxPortionsPerSession: number | null;
  portionsRemaining: number | null;
  sessionResetPeriod: string | null;
  isAvailable: boolean;
  isLimited: boolean;
}

// PATCH /restaurant/:restaurantId/inventory-settings
export interface UpdateInventorySettingsDto {
  sessionResetPeriod?: SessionResetPeriod;
  maxPortionsPerSession?: number | null;
  limitedIngredientsPerSession?: { [ingredientName: string]: number } | null;
}

// PATCH /restaurant/:restaurantId/order-settings
export interface AdvanceNoticeSettings {
  type: 'hours' | 'days_before_time';
  hours?: number;
  days?: number;
  cutoffTime?: string;
}

export interface UpdateOrderSettingsDto {
  minimumDeliveryNoticeHours?: number;
  maxPortionsPerOrder?: number | null;
  advanceNoticeSettings?: AdvanceNoticeSettings | null;
}

export interface IngredientLimit {
  id: string;
  name: string;
  maxPerSession: number;
}

/**
 * Reset Schedule Information
 */
export interface ResetScheduleInfo {
  period: SessionResetPeriod;
  description: string;
  cronExpression?: string;
}

export const RESET_SCHEDULES: Record<string, ResetScheduleInfo> = {
  daily: {
    period: 'daily',
    description: 'Daily at midnight (00:00)',
    cronExpression: '0 0 0 * * *',
  },
  lunch_dinner: {
    period: 'lunch_dinner',
    description: 'Lunch (12:00) & Dinner (18:00)',
    cronExpression: '0 0 12,18 * * *',
  },
};
