/**
 * Order Submission Service for Contact Details Feature
 * Handles order submission logic
 */

import { EventDetails, SelectedMenuItem } from '@/types/catering.types';
import { ContactFormData } from '../types/contact-form.dto';
import { cateringService } from '@/services/api/catering.api';

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
    console.log('=== ORDER SUBMISSION START ===');
    console.log('Event Details:', JSON.stringify(eventDetails, null, 2));
    console.log('Selected Items:', JSON.stringify(selectedItems, null, 2));
    console.log('Contact Info:', JSON.stringify(contactInfo, null, 2));
    console.log('Promo Codes:', promoCodes);
    console.log('CC Emails:', ccEmails);
    console.log('Payment Info:', JSON.stringify(paymentInfo, null, 2));

    try {
      await cateringService.submitCateringOrder(
        eventDetails,
        selectedItems,
        contactInfo,
        promoCodes,
        ccEmails,
        paymentInfo
      );

      console.log('✅ Order submitted successfully');
    } catch (error: any) {
      console.error('=== ORDER SUBMISSION ERROR ===');
      console.error('Error Type:', error?.name);
      console.error('Error Message:', error?.message);
      console.error('Error Stack:', error?.stack);
      console.error('Full Error Object:', JSON.stringify(error, null, 2));

      // Re-throw for component to handle
      throw error;
    } finally {
      console.log('=== ORDER SUBMISSION END ===');
    }
  }
}

export const orderSubmissionService = new OrderSubmissionService();
