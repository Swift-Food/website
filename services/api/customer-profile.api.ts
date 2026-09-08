import { fetchWithAuthCustomer, API_BASE_URL } from "@/lib/api-client/auth-client";
import {
  CustomerProfile,
  CustomerProfileUpdate,
} from "@/types/api/customer-profile.api.types";

const parseError = async (response: Response, fallback: string): Promise<never> => {
  const body = await response.json().catch(() => ({}));
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
  throw new Error(message || fallback);
};

export const customerProfileApi = {
  // GET /consumer-user/me/profile
  get: async (): Promise<CustomerProfile> => {
    const response = await fetchWithAuthCustomer(
      `${API_BASE_URL}/consumer-user/me/profile`
    );
    if (!response.ok) await parseError(response, "Could not load your details.");
    return response.json();
  },

  // PATCH /consumer-user/me/profile
  update: async (update: CustomerProfileUpdate): Promise<CustomerProfile> => {
    const response = await fetchWithAuthCustomer(
      `${API_BASE_URL}/consumer-user/me/profile`,
      { method: "PATCH", body: JSON.stringify(update) }
    );
    if (!response.ok) await parseError(response, "Could not save your details.");
    return response.json();
  },
};
