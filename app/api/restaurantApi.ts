// api/restaurantApi.ts
import {
  TokenPair,
  SignInDto,
  StripeOnboardingStatus,
  BalanceInfo,
  WithdrawalRequest,
  AnalyticsDashboard,
  PaymentAccounts,
} from "@/types/restaurant.types";
import { CateringOrder } from "@/app/types/catering.types";
import { CorporateUser } from "@/types/catering.types";

const API_BASE_URL = "https://swiftfoods-32981ec7b5a4.herokuapp.com";

export const restaurantApi = {
  // Auth endpoints
  login: async (credentials: SignInDto): Promise<TokenPair> => {
    const response = await fetch(`${API_BASE_URL}/auth/login-consumer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  },

  loginCorporate: async (credentials: {
    email: string;
    password: string;
  }): Promise<TokenPair> => {
    const response = await fetch(`${API_BASE_URL}/auth/corporate-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error("Corporate login failed");
    const data = await response.json();
    // console.log("Corporate login response data: ", data);
    return data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenPair> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-consumer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) throw new Error("Token refresh failed");
    return response.json();
  },

  getProfile: async (token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  // Stripe onboarding endpoints
  checkStripeStatus: async (
    userId: string,
    accountId?: string | null
  ): Promise<StripeOnboardingStatus | null> => {
    try {
      const url = accountId
        ? `${API_BASE_URL}/restaurant-user/${userId}/stripe-status?accountId=${accountId}`
        : `${API_BASE_URL}/restaurant-user/${userId}/stripe-status`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn("Stripe status fetch failed:", response.status);
        return null;
      }
      return response.json();
    } catch (error) {
      console.error("Stripe status error:", error);
      return null;
    }
  },

  async getMenuGroups(restaurantId: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/restaurant/${restaurantId}/menu-groups`);
    if (!response.ok) throw new Error("Failed to get menu group titles");
    return response.json();
  },

  refreshOnboardingLink: async (
    userId: string,
    token: string,
    accountId?: string
  ): Promise<{ onboardingUrl: string }> => {
    const response = await fetch(
      `${API_BASE_URL}/restaurant-user/${userId}/stripe-refresh`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: accountId ? JSON.stringify({ accountId }) : undefined,
      }
    );
    if (!response.ok) throw new Error("Failed to refresh onboarding link");
    return response.json();
  },

  // Withdrawal endpoints
  getBalance: async (
    userId: string,
    token: string,
    accountId?: string | null
  ): Promise<BalanceInfo | null> => {
    try {
      const url = accountId
        ? `${API_BASE_URL}/withdrawals/balance/${userId}/restaurant?accountId=${accountId}`
        : `${API_BASE_URL}/withdrawals/balance/${userId}/restaurant`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        console.warn("Balance fetch failed:", response.status);
        return null;
      }
      return response.json();
    } catch (error) {
      console.error("Balance error:", error);
      return null;
    }
  },

  getPaymentAccounts: async (
    restaurantUserId: string
  ): Promise<PaymentAccounts | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/restaurant-user/${restaurantUserId}/payment-accounts`
      );
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error("Failed to fetch payment accounts:", error);
      return null;
    }
  },

  requestWithdrawal: async (
    data: {
      userId: string;
      userType: string;
      amount: number;
      notes?: string;
      isInstantPayout: boolean;
      accountId: string;
    },
    token: string
  ): Promise<WithdrawalRequest> => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to request withdrawal");
    return response.json();
  },

  getWithdrawalHistory: async (
    userId: string,
    token: string,
    accountId?: string | null
  ): Promise<WithdrawalRequest[]> => {
    const url = accountId
      ? `${API_BASE_URL}/withdrawals/history/${userId}/restaurant?accountId=${accountId}`
      : `${API_BASE_URL}/withdrawals/history/${userId}/restaurant`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch withdrawal history");
    return response.json();
  },

  // Catering endpoints
  getCateringOrders: async (
    restaurantId: string,
    selectedAccountId?: string | null
  ): Promise<CateringOrder[]> => {
    const url = selectedAccountId
      ? `${API_BASE_URL}/catering-orders/restaurant/${restaurantId}?accountId=${selectedAccountId}`
      : `${API_BASE_URL}/catering-orders/restaurant/${restaurantId}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch catering orders");
    return response.json();
  },

  reviewCateringOrder: async (
    orderId: string,
    restaurantId: string,
    accepted: boolean,
    token: string,
    selectedAccountId?: string
  ): Promise<CateringOrder> => {
    const response = await fetch(
      `${API_BASE_URL}/catering-orders/${orderId}/restaurant-review`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          accepted,
          selectedAccountId,
        }),
      }
    );
    if (!response.ok) throw new Error("Failed to review catering order");
    return response.json();
  },

  claimCateringOrder: async (
    orderId: string,
    restaurantId: string,
    selectedAccountId: string,
  ): Promise<CateringOrder> => {
    const response = await fetch(
      `${API_BASE_URL}/catering-orders/${orderId}/claim`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          selectedAccountId,
        }),
      }
    );
    if (!response.ok) throw new Error("Failed to claim catering order");
    return response.json();
  },

  // Analytics endpoints
  getAnalyticsDashboard: async (
    restaurantId: string,
    token: string
  ): Promise<AnalyticsDashboard> => {
    const response = await fetch(
      `${API_BASE_URL}/restaurant-analytics/${restaurantId}/dashboard`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch analytics dashboard");
    return response.json();
  },

  getMonthlyAnalytics: async (
    restaurantId: string,
    year: number,
    month: number,
    token: string
  ): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/restaurant-analytics/${restaurantId}/monthly?year=${year}&month=${month}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch monthly analytics");
    return response.json();
  },

  getYearlyAnalytics: async (
    restaurantId: string,
    year: number,
    token: string
  ): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/restaurant-analytics/${restaurantId}/yearly?year=${year}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch yearly analytics");
    return response.json();
  },

  // Corporate user endpoints
  getCorporateUser: async (corporateUserId: string): Promise<CorporateUser> => {
    const response = await fetch(
      `${API_BASE_URL}/corporate-users/${corporateUserId}`
    );
    if (!response.ok) throw new Error("Failed to fetch corporate user");
    const data = await response.json();
    // console.log("Corporate user data: ", data);
    return data;
  },

  // Organization endpoints
  getOrganization: async (organizationId: string): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${organizationId}`
    );
    if (!response.ok) throw new Error("Failed to fetch organization");
    const data = await response.json();
    // console.log("Organization data: ", data);
    return data;
  },

  // Inventory Management endpoints

  // Get catering portions availability
  getCateringPortionsAvailability: async (restaurantId: string): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/restaurant/${restaurantId}/catering-portions-availability`
    );
    if (!response.ok) throw new Error("Failed to fetch catering portions availability");
    return response.json();
  },

  // Update catering portions limit
  updateCateringPortionsLimit: async (
    restaurantId: string,
    maximumCateringPortionsPerDay: number,
    token: string
  ): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/restaurant/${restaurantId}/catering-portions-limit`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ maximumCateringPortionsPerDay }),
      }
    );
    if (!response.ok) throw new Error("Failed to update catering portions limit");
    return response.json();
  },

  // Update corporate inventory settings
  updateCorporateInventory: async (
    restaurantId: string,
    data: {
      sessionResetPeriod?: "daily" | "lunch_dinner" | null;
      maxPortionsPerSession?: number | null;
      limitedIngredientsPerSession?: { [key: string]: number } | null;
    },
    token: string
  ): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/restaurant/${restaurantId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("Failed to update corporate inventory");
    return response.json();
  },

  // Get restaurant details (includes inventory settings)
  getRestaurantDetails: async (restaurantId: string): Promise<any> => {
    const response = await fetch(
      `${API_BASE_URL}/restaurant/${restaurantId}`
    );
    if (!response.ok) throw new Error("Failed to fetch restaurant details");
    return response.json();
  },
};
