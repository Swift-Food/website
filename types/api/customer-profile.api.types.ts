export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

/** GET|PATCH /consumer-user/me/profile. `email` is read-only. */
export interface CustomerProfile {
  fullName: string | null;
  email: string;
  phone: string | null;
  organization: string | null;
  billingAddress: BillingAddress | null;
  seededFromOrderAt: string | null;
}

export type CustomerProfileUpdate = Partial<
  Pick<CustomerProfile, "fullName" | "phone" | "organization" | "billingAddress">
>;
