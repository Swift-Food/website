import { cateringService } from "@/services/api/catering.api";
import {
  ContactFormData,
  OrderSubmissionData,
} from "@/features/contact-details/types/contact-form.dto";
import { EventDetails } from "@/types/catering.types";

interface SelectedItem {
  item: any;
  quantity: number;
}

export class OrderSubmissionService {
  async submitOrder(
    eventDetails: EventDetails,
    selectedItems: SelectedItem[],
    contactInfo: ContactFormData,
    promoCodes: string[],
    ccEmails: string[],
    paymentInfo?: {
      corporateUserId?: string;
      organizationId?: string;
      useOrganizationWallet?: boolean;
      paymentMethodId?: string;
      paymentIntentId?: string;
    }
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
      console.error("Submit order error:", error?.message);

      // Check if it's a network error
      if (
        error?.message?.includes("fetch") ||
        error?.message?.includes("network")
      ) {
        throw new Error(
          "Network error: Please check your internet connection and try again."
        );
      }
      // Check if it's an API error with response
      else if (error?.response) {
        throw new Error(
          `Failed to submit order: ${
            error.response.data?.message ||
            error.response.statusText ||
            "Unknown error"
          }`
        );
      }
      // Generic error
      else {
        throw new Error(
          `Failed to submit order: ${error?.message || "Please try again."}`
        );
      }
    }
  }
}

export const orderSubmissionService = new OrderSubmissionService();
