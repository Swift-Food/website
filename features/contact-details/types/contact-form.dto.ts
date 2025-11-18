/**
 * Contact Details Feature DTOs
 */

export interface ContactFormData {
  organization: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
}

export interface ContactFormErrors {
  organization?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  zipcode?: string;
  ccEmail?: string;
}

export interface PaymentMethodSelection {
  method: 'wallet' | 'card' | null;
  corporateUserId?: string;
  organizationId?: string;
}

export interface OrderSubmissionData {
  contactInfo: ContactFormData;
  ccEmails: string[];
  promoCodes: string[];
  termsAccepted: boolean;
  paymentInfo?: {
    corporateUserId?: string;
    organizationId?: string;
    useOrganizationWallet?: boolean;
    paymentMethodId?: string;
    paymentIntentId?: string;
  };
}
