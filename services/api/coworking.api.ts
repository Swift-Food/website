import { fetchWithAuth, API_BASE_URL } from '@/lib/api-client/auth-client';
import {
  DashboardOrderSummary,
  DashboardOrderDetail,
  CalendarDay,
  CoworkingMetrics,
  CoworkingSpace,
} from '@/types/api/coworking.api.types';

export const coworkingApi = {
  login: async (email: string, password: string): Promise<{ access_token: string; refresh_token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login-coworking-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed. Please check your credentials.');
    return response.json();
  },

  getProfile: async (): Promise<any> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/profile`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  getSpace: async (spaceId: string): Promise<CoworkingSpace> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/coworking-dashboard/${spaceId}/info`);
    if (!response.ok) throw new Error('Failed to fetch space details');
    return response.json();
  },

  // Task 3 — Order list
  getOrders: async (spaceId: string, status?: string): Promise<DashboardOrderSummary[]> => {
    const url = status
      ? `${API_BASE_URL}/coworking-dashboard/${spaceId}/orders?status=${status}`
      : `${API_BASE_URL}/coworking-dashboard/${spaceId}/orders`;
    const response = await fetchWithAuth(url);
    if (!response.ok) throw new Error('Failed to fetch orders');
    const data = await response.json();
    // Unwrap if the API returns { orders: [...] } or { data: [...] } instead of a bare array
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.orders)) return data.orders;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  // Task 4 — Order detail
  getOrderDetail: async (spaceId: string, orderId: string): Promise<DashboardOrderDetail> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/coworking/${spaceId}/orders/${orderId}`);
    if (!response.ok) throw new Error('Failed to fetch order details');
    return response.json();
  },

  // Task 5 — Calendar
  getCalendar: async (spaceId: string, year: number, month: number): Promise<CalendarDay[]> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/coworking-dashboard/${spaceId}/calendar?year=${year}&month=${month}`
    );
    if (!response.ok) throw new Error('Failed to fetch calendar');
    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.days)) return data.days;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  // Task 6 — Commission rate
  updateCommissionRate: async (spaceId: string, commission: number): Promise<{ commission: number }> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/coworking-dashboard/${spaceId}/settings/commission-rate`, {
      method: 'PATCH',
      body: JSON.stringify({ commission }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body?.message || 'Failed to update commission rate');
    }
    return response.json();
  },

  // Task 7 — Financial metrics
  getMetrics: async (spaceId: string, from?: string, to?: string): Promise<CoworkingMetrics> => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    const response = await fetchWithAuth(
      `${API_BASE_URL}/coworking/${spaceId}/metrics${qs ? `?${qs}` : ''}`
    );
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  },
};
