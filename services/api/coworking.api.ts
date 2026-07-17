import { fetchWithAuthPartner, API_BASE_URL } from '@/lib/api-client/auth-client';
import {
  DashboardOrderSummary,
  DashboardOrderDetail,
  CalendarDay,
  CoworkingMetrics,
  CoworkingSpace,
  PartnerStripeStatus,
} from '@/types/api/coworking.api.types';

export const coworkingApi = {
  // POST /auth/login-partner
  login: async (email: string, password: string): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login-partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Login failed. Please check your credentials.');
    }
    return response.json();
  },

  getProfile: async (): Promise<any> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/auth/profile`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  // GET /partner-dashboard/:spaceId/info
  getSpace: async (spaceId: string): Promise<CoworkingSpace> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/${spaceId}/info`);
    if (!response.ok) throw new Error('Failed to fetch space details');
    return response.json();
  },

  // GET /partner-dashboard/:spaceId/orders
  getOrders: async (spaceId: string, params?: { status?: string; from?: string; to?: string; page?: number; limit?: number }): Promise<DashboardOrderSummary[]> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const url = `${API_BASE_URL}/partner-dashboard/${spaceId}/orders${qs.toString() ? `?${qs}` : ''}`;
    const response = await fetchWithAuthPartner(url);
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    // Response shape: { orders: [...], pagination: {...} }
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.orders)) return data.orders;
    return [];
  },

  // GET /partner-dashboard/:spaceId/orders/:orderId  (detail — if endpoint exists)
  getOrderDetail: async (spaceId: string, orderId: string): Promise<DashboardOrderDetail> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/${spaceId}/orders/${orderId}`);
    if (!response.ok) throw new Error('Failed to fetch order details');
    return response.json();
  },

  // GET /partner-dashboard/:spaceId/calendar
  getCalendar: async (spaceId: string): Promise<CalendarDay[]> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/${spaceId}/calendar`);
    if (!response.ok) throw new Error('Failed to fetch calendar');
    const data = await response.json();
    // Response shape: { dates: [...] }
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.dates)) return data.dates;
    if (Array.isArray(data?.days)) return data.days;
    return [];
  },

  // POST /auth/forgot-password
  forgotPassword: async (email: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, context: 'partner-admin' }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to send reset code');
    }
  },

  // POST /auth/reset-password
  resetPassword: async (email: string, code: string, newPassword: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword, context: 'partner-admin' }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to reset password');
    }
  },

  // POST /auth/change-password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to change password');
    }
  },

  // PATCH /partner-dashboard/:spaceId/restaurants
  updateSelectedRestaurants: async (spaceId: string, selectedRestaurantIds: string[]): Promise<{ selectedRestaurants: { id: string; restaurant_name: string }[] }> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/${spaceId}/restaurants`, {
      method: 'PATCH',
      body: JSON.stringify({ selectedRestaurantIds }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to update restaurant selection');
    }
    return response.json();
  },

  // POST /partner-dashboard/:spaceId/stripe-account
  createStripeAccount: async (spaceId: string): Promise<{ accountId: string; onboardingUrl: string }> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/${spaceId}/stripe-account`, {
      method: 'POST',
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to create Stripe account');
    }
    return response.json();
  },

  // GET /partner-dashboard/:spaceId/stripe-account/status
  getStripeStatus: async (spaceId: string): Promise<PartnerStripeStatus> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/${spaceId}/stripe-account/status`);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to fetch Stripe status');
    }
    return response.json();
  },

  // POST /partner-dashboard/:spaceId/stripe-account/refresh
  refreshStripeOnboardingLink: async (spaceId: string): Promise<{ onboardingUrl: string }> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/${spaceId}/stripe-account/refresh`, {
      method: 'POST',
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to get onboarding link');
    }
    return response.json();
  },

  // GET /partner-dashboard/:spaceId/stripe-account/details
  getStripeDetails: async (spaceId: string): Promise<{ accountId: string; onboardingComplete: boolean; email: string | null; payoutsEnabled: boolean; chargesEnabled: boolean; bankName: string | null; bankLast4: string | null }> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/${spaceId}/stripe-account/details`);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to fetch Stripe details');
    }
    return response.json();
  },

  // GET /partner-dashboard/:spaceId/stripe-account/balance
  getStripeBalance: async (spaceId: string): Promise<{ available: number; pending: number; currency: string }> => {
    const response = await fetchWithAuthPartner(`${API_BASE_URL}/partner-dashboard/${spaceId}/stripe-account/balance`);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to fetch Stripe balance');
    }
    return response.json();
  },

  // Financial metrics — extend this path once the backend endpoint is confirmed
  getMetrics: async (spaceId: string, from?: string, to?: string): Promise<CoworkingMetrics> => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const response = await fetchWithAuthPartner(
      `${API_BASE_URL}/partner-dashboard/${spaceId}/metrics${qs.toString() ? `?${qs}` : ''}`
    );
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  },
};
