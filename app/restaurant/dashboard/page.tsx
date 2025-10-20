"use client"

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, CreditCard, DollarSign, ExternalLink, LogOut, Loader } from 'lucide-react';
import { CateringOrder } from '@/app/types/catering.types';

// Types
const WithdrawalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

const UserRole = {
  RESTAURANT: 'restaurant_owner',
  CUSTOMER: 'customer',
  DRIVER: 'driver',
  ADMIN: 'admin',
} as const;

type WithdrawalStatusType = typeof WithdrawalStatus[keyof typeof WithdrawalStatus];

interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  adminMode: boolean;
}

interface SignInDto {
  email: string;
  password: string;
  role: string;
}

interface StripeOnboardingStatus {
  complete: boolean;
  currentlyDue: string[];
  detailsSubmitted: boolean;
}

interface BalanceInfo {
  available: number;
  pending: number;
  lastWithdrawal?: string;
  canWithdrawWithoutFee: boolean;
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  feeCharged: number;
  netAmount: number;
  status: WithdrawalStatusType;
  notes?: string;
  rejectionReason?: string;
  requestedAt: string;
  reviewedAt?: string;
  isInstantPayout: boolean;
}

// API Service - Replace base URL with your actual API
const API_BASE_URL = 'https://swiftfoods-32981ec7b5a4.herokuapp.com';

const api = {
  // Auth endpoints
  login: async (credentials: SignInDto): Promise<TokenPair> => {
    const response = await fetch(`${API_BASE_URL}/auth/login-consumer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  refreshToken: async (refreshToken: string): Promise<TokenPair> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-consumer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) throw new Error('Token refresh failed');
    return response.json();
  },

  getProfile: async (token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  // Stripe onboarding endpoints
  checkStripeStatus: async (userId: string): Promise<StripeOnboardingStatus | null> => {
    try {
      console.log(`${API_BASE_URL}/restaurant-user/${userId}/stripe-status`)
      const response = await fetch(`${API_BASE_URL}/restaurant-user/${userId}/stripe-status`);
      
      if (!response.ok) {
        console.warn('Stripe status fetch failed:', response.status);
        return null;
      }
      return response.json();
    } catch (error) {
      console.error('Stripe status error:', error);
      return null;
    }
  },

  refreshOnboardingLink: async (userId: string, token: string): Promise<{ onboardingUrl: string }> => {
    const response = await fetch(`${API_BASE_URL}/restaurant-user/${userId}/stripe-refresh`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to refresh onboarding link');
    return response.json();
  },

  // Withdrawal endpoints
  getBalance: async (userId: string, token: string): Promise<BalanceInfo | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/withdrawals/balance/${userId}/restaurant`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        console.warn('Balance fetch failed:', response.status);
        return null; // Return null instead of throwing
      }
      return response.json();
    } catch (error) {
      console.error('Balance error:', error);
      return null;
    }
  },
  

  requestWithdrawal: async (data: {
    userId: string;
    userType: string;
    amount: number;
    notes?: string;
    isInstantPayout: boolean;
  }, token: string): Promise<WithdrawalRequest> => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to request withdrawal');
    return response.json();
  },

  getWithdrawalHistory: async (userId: string, token: string): Promise<WithdrawalRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/withdrawals/history/${userId}/restaurant`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch withdrawal history');
    return response.json();
  },

  getCateringOrders: async (restaurantId: string) => {
 
    console.log("catering order rq", `${API_BASE_URL}/catering-orders/restaurant/${restaurantId}` )
    const response = await fetch(`${API_BASE_URL}/catering-orders/restaurant/${restaurantId}`);
    

    const data = await response.json();

    
    return data;
  },

  reviewCateringOrder: async (
    orderId: string, 
    restaurantId: string, 
    accepted: boolean,
    token: string
  ): Promise<CateringOrder> => {
    const response = await fetch(`${API_BASE_URL}/catering-orders/${orderId}/restaurant-review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ restaurantId, accepted }),
    });
    if (!response.ok) throw new Error('Failed to review catering order');
    return response.json();
  },
};

const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser).user);
      }
    }, []);
  
    const login = async (email: string, password: string) => {
      const credentials: SignInDto = {
        email,
        password,
        role: UserRole.RESTAURANT,
      };
      const tokens = await api.login(credentials);
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      
      // Fetch actual user profile
      const profile = await api.getProfile(tokens.access_token);
      localStorage.setItem('user', JSON.stringify(profile));
      
      setToken(tokens.access_token);
      setUser(profile.user);
    };
  
    const logout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    };
  
    return { user, token, login, logout, isAuthenticated: !!token };
  };

// Login Component
const LoginPage = ({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  console.log("user is")
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <CreditCard size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Login</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your withdrawals</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="restaurant@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader size={18} className="mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Stripe Onboarding Required Component
const StripeOnboardingRequired = ({ 
  userId, 
  token, 
  onRefresh 
}: { 
  userId: string; 
  token: string; 
  onRefresh: () => void;
}) => {
  console.log("user is", userId)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleRefreshLink = async () => {
    setLoading(true);
    setError('');
    try {
      const { onboardingUrl } = await api.refreshOnboardingLink(userId, token);
      window.location.href = onboardingUrl;
    } catch (err: any) {
      setError(err.message || 'Failed to get onboarding link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <AlertCircle size={32} className="text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Stripe Onboarding
        </h2>
        <p className="text-gray-700 mb-6">
          Before you can request withdrawals, you need to complete your Stripe account setup. 
          This is required to securely receive payments.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleRefreshLink}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed inline-flex items-center"
        >
          {loading ? (
            <>
              <Loader size={18} className="mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ExternalLink size={18} className="mr-2" />
              Complete Stripe Onboarding
            </>
          )}
        </button>

        <button
          onClick={onRefresh}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium block w-full"
        >
          I've completed onboarding - Refresh
        </button>
      </div>
    </div>
  );
};

// Withdrawal History Component
const WithdrawalHistory = ({ history }: { history: WithdrawalRequest[] }) => {
  // const formatCurrency = (amount: string) => `£${amount}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusColor = (status: WithdrawalStatusType) => {
    const colors = {
      [WithdrawalStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [WithdrawalStatus.APPROVED]: 'bg-blue-100 text-blue-800 border-blue-300',
      [WithdrawalStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-300',
      [WithdrawalStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-300',
      [WithdrawalStatus.FAILED]: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No withdrawal history yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((withdrawal) => (
        <div key={withdrawal.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(withdrawal.status)}`}>
                {withdrawal.status.toUpperCase()}
              </span>
              <p className="text-xs text-gray-500 mt-1">ID: {withdrawal.id.substring(0, 8)}...</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-gray-900">{withdrawal.amount}</p>
              {withdrawal.feeCharged > 0 && (
                <p className="text-xs text-red-600">Fee: -{withdrawal.feeCharged}</p>
              )}
              <p className="text-sm font-semibold text-green-600">{withdrawal.netAmount}</p>
            </div>
          </div>

          <div className="flex items-center text-xs text-gray-600 mb-2">
            <Clock size={12} className="mr-1" />
            {formatDate(withdrawal.requestedAt)}
          </div>

          {withdrawal.notes && (
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              Note: {withdrawal.notes}
            </p>
          )}

          {withdrawal.rejectionReason && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs font-medium text-red-900">Rejection Reason:</p>
              <p className="text-sm text-red-800">{withdrawal.rejectionReason}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Add new component before WithdrawalDashboard
const CateringOrdersList = ({ 
  orders, 
  restaurantId,
  token,
  onRefresh 
}: { 
  orders: CateringOrder[]; 
  restaurantId: string;
  token: string;
  onRefresh: () => void;
}) => {
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [error, setError] = useState('');

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formatCurrency = (amount: any) => `£${amount}`;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'admin_reviewed': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'restaurant_reviewed': 'bg-blue-100 text-blue-800 border-blue-300',
      'paid': 'bg-green-100 text-green-800 border-green-300',
      'confirmed': 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleReview = async (orderId: string, accepted: boolean) => {
    setReviewing(orderId);
    setError('');
    
    try {
      await api.reviewCateringOrder(orderId, restaurantId, accepted, token);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to review order');
    } finally {
      setReviewing(null);
    }
  };

  // Group orders by status
  const ordersByStatus = orders.reduce((acc, order) => {
    const status = order.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {} as Record<string, CateringOrder[]>);

  const statusOrder = ['admin_reviewed', 'restaurant_reviewed', 'paid', 'confirmed'];
  const statusLabels: Record<string, string> = {
    'admin_reviewed': 'Pending Your Review',
    'restaurant_reviewed': 'Awaiting Payment',
    'paid': 'Paid',
    'confirmed': 'Confirmed',
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No Event orders yet</p>
        <p className="text-sm mt-2">Your confirmed Event orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {statusOrder.map((status) => {
        const statusOrders = ordersByStatus[status];
        if (!statusOrders || statusOrders.length === 0) return null;

        return (
          <div key={status} className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              {statusLabels[status] || status}
              <span className="ml-2 bg-gray-200 text-gray-700 text-sm px-2 py-0.5 rounded-full">
                {statusOrders.length}
              </span>
            </h3>

            {statusOrders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">Order: {order.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-gray-900">{formatCurrency(order.restaurantTotalCost)}</p>
                    <p className="text-xs text-gray-500">Event: {formatDate(order.eventDate)}</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Event Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600">Date: <span className="text-gray-900 font-medium">{formatDate(order.eventDate)}</span></p>
                    <p className="text-gray-600">Time: <span className="text-gray-900 font-medium">{order.eventTime}</span></p>
                    <p className="text-gray-600">Guests: <span className="text-gray-900 font-medium">{order.guestCount} people</span></p>
                    <p className="text-gray-600">Type: <span className="text-gray-900 font-medium">{order.eventType}</span></p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Delivery: <span className="text-gray-900 font-medium">{order.deliveryAddress}</span>
                  </p>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                  {order.orderItems.map((restaurant, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="space-y-2">
                        {restaurant.menuItems.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Requirements */}
                {order.specialRequirements && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">Special Requirements:</p>
                    <p className="text-sm text-yellow-800">{order.specialRequirements}</p>
                  </div>
                )}

                {/* Review Buttons - Only show for ADMIN_REVIEWED status */}
                {order.status === 'admin_reviewed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      Please review this order and confirm your availability
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReview(order.id, true)}
                        disabled={reviewing === order.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {reviewing === order.id ? (
                          <>
                            <Loader size={16} className="mr-2 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} className="mr-2" />
                            Accept Order
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReview(order.id, false)}
                        disabled={reviewing === order.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {reviewing === order.id ? (
                          <>
                            <Loader size={16} className="mr-2 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <AlertCircle size={16} className="mr-2" />
                            Reject Order
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// Main Withdrawal Dashboard
const WithdrawalDashboard = ({ 
  userId, 
  restaurantUserId,
  restaurantId,
  restaurant,
  token, 
  onLogout 
}: { 
  userId: string; 
  restaurantUserId: string;
  restaurantId: string;
  restaurant: any;
  token: string; 
  onLogout: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState<StripeOnboardingStatus | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cateringOrders, setCateringOrders] = useState<CateringOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'catering'>('withdrawals');

  // Update fetchData function to include catering orders
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statusData, balanceData, historyData, cateringData] = await Promise.all([
        api.checkStripeStatus(restaurantUserId),
        api.getBalance(restaurantUserId, token),
        api.getWithdrawalHistory(restaurantUserId, token),
        api.getCateringOrders(restaurantId),
      ]);
      
      if (statusData) setStripeStatus(statusData);
      if (balanceData) setBalance(balanceData);
      setHistory(historyData || []);
      setCateringOrders(cateringData || []);
      console.log("Catering data is", cateringData, restaurantId);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, token]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const amount = parseFloat(withdrawalAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (balance && amount > balance.available) {
      setError(`Insufficient balance. Available: £${balance.available.toFixed(2)}`);
      return;
    }
  
    setSubmitting(true);

    try {
      await api.requestWithdrawal({
        userId: restaurantUserId,
        userType: 'restaurant',
        amount,
        notes: notes.trim() || undefined,
        isInstantPayout: false,
      }, token);

      setSuccess('Withdrawal request submitted successfully! Pending admin approval.');
      setWithdrawalAmount('');
      setNotes('');
      
      // Refresh data
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!stripeStatus?.complete) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Withdrawal Dashboard</h1>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
          <StripeOnboardingRequired 
            userId={restaurantUserId} 
            token={token} 
            onRefresh={fetchData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          {/* <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1> */}
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.restaurant_name} Dashboard</h1>
          <button
            onClick={onLogout}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-2">
              <DollarSign size={24} />
              <span className="ml-2 text-sm font-medium">Available Balance</span>
            </div>
            <p className="text-4xl font-bold">£{balance?.available.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-2">
              <Clock size={24} />
              <span className="ml-2 text-sm font-medium">Pending Balance</span>
            </div>
            <p className="text-4xl font-bold">£{balance?.pending.toFixed(2) || '0.00'}</p>
          </div>

          {/* <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-2">
              <CheckCircle size={24} />
              <span className="ml-2 text-sm font-medium">Last Withdrawal</span>
            </div>
            <p className="text-lg font-bold">
              {balance?.lastWithdrawal 
                ? new Date(balance.lastWithdrawal).toLocaleDateString('en-GB')
                : 'Never'}
            </p>
          </div> */}
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'withdrawals'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setActiveTab('catering')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'catering'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Event Orders
                {cateringOrders.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                    {cateringOrders.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Early Withdrawal Fee Warning */}
        {balance && !balance.canWithdrawWithoutFee && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <AlertCircle size={20} className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Early Withdrawal Fee</p>
              <p className="text-sm text-yellow-800">
                You withdrew within the last 7 days. A £0.50 fee will be charged for this withdrawal.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Withdrawal Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Withdrawal</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
                <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start text-green-700">
                <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Withdrawal Amount (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balance?.available}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: £{balance?.available.toFixed(2) || '0.00'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Add any notes about this withdrawal..."
                />
              </div>

              {/* Fee Preview */}
              {withdrawalAmount && parseFloat(withdrawalAmount) > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Requested Amount:</span>
                    <span className="font-medium">£{parseFloat(withdrawalAmount).toFixed(2)}</span>
                  </div>
                  {balance && !balance.canWithdrawWithoutFee && (
                    <div className="flex justify-between text-red-600">
                      <span>Early Withdrawal Fee:</span>
                      <span className="font-medium">-£0.50</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
                    <span>You'll Receive:</span>
                    <span>
                      £{(parseFloat(withdrawalAmount) - (balance && !balance.canWithdrawWithoutFee ? 0.50 : 0)).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 pt-2">
                    Expected arrival: 1-3 business days after approval
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !balance || balance.available <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Request Withdrawal'
                )}
              </button>
            </form>
          </div>

          {/* Withdrawal History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Withdrawal History</h2>
            <div className="max-h-[600px] overflow-y-auto">
              <WithdrawalHistory history={history} />
            </div>
          </div>
        </div>
   
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Event Orders</h2>
            <div className="max-h-[800px] overflow-y-auto">
              <CateringOrdersList 
                orders={cateringOrders} 
                restaurantId={restaurantId}
                token={token}
                onRefresh={fetchData}
              />
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

// Main App Component
const RestaurantWithdrawalApp = () => {
    const { user, token, login, logout, isAuthenticated } = useAuth();
  
    if (!isAuthenticated || !user || !token) {
      return <LoginPage onLogin={login} />;
    }
  
    // Use restaurantUser.id from the profile response
    console.log("user is", user)
    return (
      <WithdrawalDashboard 
        userId={user.id} 
        restaurantUserId={user.restaurantUser.id}
        restaurantId = {user.restaurantUser.restaurant?.id}
        restaurant={user.restaurantUser?.restaurant}
        token={token} 
        onLogout={logout}
      />
    );
  };

export default RestaurantWithdrawalApp;