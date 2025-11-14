// app/api/promotionsApi.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface DiscountTier {
  minQuantity: number;
  discountPercentage: number;
}

export interface Promotion {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  promotionType: 'RESTAURANT_WIDE' | 'ITEM_SPECIFIC' | 'CATEGORY_SPECIFIC' | 'BUY_MORE_SAVE_MORE';
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'EXPIRED';
  applicability: 'CATERING' | 'CORPORATE' | 'BOTH';
  discountPercentage: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  startDate: string;
  endDate: string;
  applicableMenuItemIds?: string[] | null;
  applicableCategories?: string[] | null;
  priority: number;
  discountTiers?: DiscountTier[] | null;
  applyToAllGroups?: boolean;
  isStackable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDto {
  restaurantId: string;
  name: string;
  description?: string;
  promotionType: 'RESTAURANT_WIDE' | 'ITEM_SPECIFIC' | 'CATEGORY_SPECIFIC' | 'BUY_MORE_SAVE_MORE';
  applicability: 'CATERING' | 'CORPORATE' | 'BOTH';
  discountPercentage: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  startDate: string;
  endDate: string;
  applicableMenuItemIds?: string[];
  applicableCategories?: string[];
  discountTiers?: DiscountTier[];
  applyToAllGroups?: boolean;
  priority?: number;
  isStackable?: boolean;
}

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {
  status?: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'EXPIRED';
}

export interface PromotionValidationResult {
  isValid: boolean;
  discount: number;
  message?: string;
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
    // console.log("promotion dto", JSON.stringify(data))
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

  async getPromotionById(promotionId: string): Promise<Promotion> {
    const response = await axios.get(`${API_BASE_URL}/promotions/${promotionId}`);
    return response.data;
  },

};