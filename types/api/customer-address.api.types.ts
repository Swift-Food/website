/** The `addresses` row as /address returns it. */
export interface CustomerAddress {
  id: string;
  name: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  zipcode: string;
  placeId?: string | null;
  location?: { latitude: number; longitude: number } | null;
  isDefault: boolean;
}

/** POST /address. The owner comes from the token, never the body. */
export interface CreateCustomerAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  zipcode: string;
  placeId?: string;
  location: { latitude: number; longitude: number };
  isDefault?: boolean;
}

export type UpdateCustomerAddress = Partial<CreateCustomerAddress>;
