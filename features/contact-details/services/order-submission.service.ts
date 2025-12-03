/**
 * Order Submission Service for Contact Details Feature
 * Handles order submission logic
 */

import { EventDetails, SelectedMenuItem } from "@/types/catering.types";
import { ContactFormData } from "../types/contact-form.dto";
import { cateringService } from "@/services/api/catering.api";

interface PaymentInfo {
  corporateUserId?: string;
  organizationId?: string;
  useOrganizationWallet?: boolean;
  paymentMethodId?: string;
  paymentIntentId?: string;
}

class OrderSubmissionService {
  /**
   * Submit catering order
   */
  async submitOrder(
    eventDetails: EventDetails,
    selectedItems: SelectedMenuItem[],
    contactInfo: ContactFormData,
    promoCodes: string[],
    ccEmails: string[],
    paymentInfo?: PaymentInfo
  ): Promise<void> {
    try {
      await cateringService.submitCateringOrder(
        eventDetails,
        selectedItems,
        contactInfo,
        promoCodes,
        ccEmails,
        paymentInfo
      );
    } catch (error: any) {
      console.error("Order submission error:", error?.message);
      throw error;
    }
  }
}

export const orderSubmissionService = new OrderSubmissionService();
