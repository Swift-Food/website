// services/cateringServices.ts - Add refund methods

import apiClient from "@/app/api/client";
import { RefundRequest } from "@/types/refund.types";

class RefundService {
  async createRefundRequest(data: {
    orderType: 'catering' | 'corporate';
    orderId: string;
    refundItems?: { // Add this
      menuItemId: string;
      itemName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
    restaurantId: string;
    reason: string;
    additionalDetails?: string;
    images?: string[];
    requestedAmount: number;
    },  
    userId: string
  ): Promise<RefundRequest> {
    const response = await apiClient.post(`/refunds/${userId}`, data);
    return response.data;
  }

  async getOrderRefunds(orderId: string): Promise<RefundRequest[]> {
    console.log("orderid", {orderId})
    const response = await apiClient.get(`/refunds/order/${orderId}?orderType=catering`);
    return response.data;
  }

  async getRestaurantRefundRequests(restaurantId: string): Promise<RefundRequest[]> {
    const response = await apiClient.get(`/refunds/restaurant/${restaurantId}`);
    return response.data;
  }

}

export const refundService = new RefundService();