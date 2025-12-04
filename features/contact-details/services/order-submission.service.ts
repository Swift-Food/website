/**
 * Order Submission Service for Contact Details Feature
 * Handles order submission logic
 */

import { EventDetails, MealSessionState } from "@/types/catering.types";
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
    mealSessions: MealSessionState[],
    contactInfo: ContactFormData,
    promoCodes: string[],
    ccEmails: string[],
    paymentInfo?: PaymentInfo
  ): Promise<void> {
    try {
      await cateringService.submitCateringOrder(
        eventDetails,
        mealSessions,
        contactInfo,
        promoCodes,
        ccEmails,
        paymentInfo
      );
    } catch (error: any) {
      console.error("=== ORDER SUBMISSION ERROR ===");
      console.error("Error Type:", error?.name);
      console.error("Error Message:", error?.message);
      console.error("Error Stack:", error?.stack);
      console.error("Full Error Object:", JSON.stringify(error, null, 2));

      // Re-throw for component to handle
      throw error;
    }
  }
}

export const orderSubmissionService = new OrderSubmissionService();
