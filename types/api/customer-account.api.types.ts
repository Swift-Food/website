import { CateringOrderResponse } from "./catering.api.types";

/**
 * A catering order as the signed-in customer sees it. `accessToken` is the
 * caller's own token for that order, so the existing guest view and reorder
 * links work unchanged.
 */
export interface MyCateringOrder extends CateringOrderResponse {
  accessToken?: string;
  myRole?: "manager" | "viewer" | null;
}

export interface MyOrdersResponse {
  /** Orders this account placed. */
  own: MyCateringOrder[];
  /** Orders someone else placed where this account is on the shared list. */
  shared: MyCateringOrder[];
}

export interface AvailableDiscount {
  code: string;
  name: string | null;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountAmount: number;
  maxDiscount: number | null;
  minOrderValue: number | null;
  discountTarget: "FOOD_SUBTOTAL" | "VENUE_HIRE_FEE";
  /** Empty means the code is valid at ALL restaurants, not none. */
  restaurants: { id: string; name: string }[];
  expiresAt: string | null;
  validFrom: string | null;
  singleUse: boolean;
}
