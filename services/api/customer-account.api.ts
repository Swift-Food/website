import { fetchWithAuthCustomer, API_BASE_URL } from "@/lib/api-client/auth-client";
import {
  AvailableDiscount,
  MyOrdersResponse,
} from "@/types/api/customer-account.api.types";

const read = async <T>(path: string, fallback: string): Promise<T> => {
  const response = await fetchWithAuthCustomer(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || fallback);
  }
  return response.json();
};

export const customerAccountApi = {
  // GET /catering-orders/my-orders
  getMyOrders: (): Promise<MyOrdersResponse> =>
    read<MyOrdersResponse>("/catering-orders/my-orders", "Could not load your orders."),

  // GET /catering-orders/my-discounts
  getMyDiscounts: (): Promise<AvailableDiscount[]> =>
    read<AvailableDiscount[]>(
      "/catering-orders/my-discounts",
      "Could not load your reward codes."
    ),
};
