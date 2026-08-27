import { fetchWithAuthCustomer, API_BASE_URL } from "@/lib/api-client/auth-client";
import {
  CreateCustomerAddress,
  CustomerAddress,
  UpdateCustomerAddress,
} from "@/types/api/customer-address.api.types";

const parseError = async (response: Response, fallback: string): Promise<never> => {
  const body = await response.json().catch(() => ({}));
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
  throw new Error(message || fallback);
};

const send = async <T>(
  path: string,
  init: RequestInit,
  fallback: string
): Promise<T> => {
  const response = await fetchWithAuthCustomer(`${API_BASE_URL}${path}`, init);
  if (!response.ok) await parseError(response, fallback);
  return response.status === 204 ? (undefined as T) : response.json();
};

export const customerAddressApi = {
  // GET /address/user/:userId - scoped to the caller by the backend guard.
  list: (userId: string): Promise<CustomerAddress[]> =>
    send<CustomerAddress[]>(
      `/address/user/${userId}`,
      { method: "GET" },
      "Could not load your addresses."
    ),

  create: (address: CreateCustomerAddress): Promise<CustomerAddress> =>
    send<CustomerAddress>(
      "/address",
      { method: "POST", body: JSON.stringify(address) },
      "Could not save this address."
    ),

  update: (id: string, update: UpdateCustomerAddress): Promise<CustomerAddress> =>
    send<CustomerAddress>(
      `/address/${id}`,
      { method: "PATCH", body: JSON.stringify(update) },
      "Could not update this address."
    ),

  remove: (id: string): Promise<void> =>
    send<void>(`/address/${id}`, { method: "DELETE" }, "Could not delete this address."),
};
