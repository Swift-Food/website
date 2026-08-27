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
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountAmount: number;
  maxDiscount: number | null;
  expiresAt: string | null;
}
