// app/api/promotionsApi.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Promotion {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  type: 'RESTAURANT_WIDE' | 'GROUP_WIDE' | 'BUY_MORE_SAVE_MORE' | 'BOGO' | 'BOGO_ITEM';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'EXPIRED';
  applicability: 'CATERING' | 'CORPORATE' | 'BOTH';
  discountPercentage: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  priority: number;
  isStackable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDto {
  restaurantId: string;
  name: string;
  description?: string;
  type: 'RESTAURANT_WIDE' | 'GROUP_WIDE' | 'BUY_MORE_SAVE_MORE';
  applicability: 'CATERING' | 'CORPORATE' | 'BOTH';
  discountPercentage: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  priority?: number;
  isStackable?: boolean;
}

export const promotionsServices = {
  // Get all promotions for a restaurant
  getRestaurantPromotions: async (restaurantId: string, status?: string) => {
    const params = status ? { status } : {};
    const response = await axios.get(
      `${API_BASE_URL}/promotions/restaurant/${restaurantId}`,
      { params }
    );
    return response.data;
  },

  // Get active promotions (customer view)
  getActivePromotions: async (restaurantId: string, orderType: 'CATERING' | 'CORPORATE') => {
    const response = await axios.get(
      `${API_BASE_URL}/promotions/restaurant/${restaurantId}/active`,
      { params: { orderType } }
    );
    return response.data;
  },

  // Get single promotion
  getPromotion: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/promotions/${id}`);
    return response.data;
  },

  // Create promotion
  createPromotion: async (data: CreatePromotionDto) => {
    const response = await axios.post(`${API_BASE_URL}/promotions`, data);
    return response.data;
  },

  // Update promotion
  updatePromotion: async (id: string, data: Partial<CreatePromotionDto>) => {
    const response = await axios.put(`${API_BASE_URL}/promotions/${id}`, data);
    return response.data;
  },

  // Update status
  updatePromotionStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    const response = await axios.put(`${API_BASE_URL}/promotions/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Delete promotion
  deletePromotion: async (id: string) => {
    const response = await axios.delete(`${API_BASE_URL}/promotions/${id}`);
    return response.data;
  },

  // Validate promotion
  validatePromotion: async (
    promotionId: string,
    restaurantId: string,
    orderSubtotal: number,
    orderType: 'CATERING' | 'CORPORATE'
  ) => {
    const response = await axios.post(`${API_BASE_URL}/promotions/validate`, {
      promotionId,
      restaurantId,
      orderSubtotal,
      orderType,
    });
    return response.data;
  },
};