"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  LogOut,
  Loader,
} from "lucide-react";
import { CateringOrder } from "@/app/types/catering.types";

// Types
// const WithdrawalStatus = {
//   PENDING: 'pending',
//   APPROVED: 'approved',
//   REJECTED: 'rejected',
//   COMPLETED: 'completed',
//   FAILED: 'failed',
// } as const;

const UserRole = {
  RESTAURANT: "restaurant_owner",
  CUSTOMER: "customer",
  DRIVER: "driver",
  ADMIN: "admin",
} as const;

type WithdrawalStatusType =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "failed";

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
const API_BASE_URL = "https://swiftfoods-32981ec7b5a4.herokuapp.com";

const api = {
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
      console.log(url);
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
          "Content-Type": "application/json"
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
        return null; // Return null instead of throwing
      }
      return response.json();
    } catch (error) {
      console.error("Balance error:", error);
      return null;
    }
  },

  getPaymentAccounts: async (restaurantUserId: string): Promise<Record<string, { name: string; stripeAccountId: string }> | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurant-user/${restaurantUserId}/payment-accounts`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('Failed to fetch payment accounts:', error);
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

  getCateringOrders: async (
    restaurantId: string,
    accountId?: string | null
  ) => {
    const url = accountId
      ? `${API_BASE_URL}/catering-orders/restaurant/${restaurantId}?accountId=${accountId}`
      : `${API_BASE_URL}/catering-orders/restaurant/${restaurantId}`;
    console.log("catering order rq", url);
    const response = await fetch(url);

    const data = await response.json();

    return data;
  },

  reviewCateringOrder: async (
    orderId: string,
    restaurantId: string,
    accepted: boolean,
    token: string,
    selectedAccountId?: string, // NEW
  ): Promise<CateringOrder> => {
    const response = await fetch(`${API_BASE_URL}/catering-orders/${orderId}/restaurant-review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        restaurantId, 
        accepted,
        selectedAccountId, // NEW
      }),
    });
    if (!response.ok) throw new Error('Failed to review catering order');
    return response.json();
  },
};

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
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
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);

    // Fetch actual user profile
    const profile = await api.getProfile(tokens.access_token);
    localStorage.setItem("user", JSON.stringify(profile));

    setToken(tokens.access_token);
    setUser(profile.user);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return { user, token, login, logout, isAuthenticated: !!token };
};

// Login Component
const LoginPage = ({
  onLogin,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  console.log("user is");
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <CreditCard size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Login</h1>
          <p className="text-gray-600 mt-2">
            Sign in to manage your withdrawals
          </p>
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
              "Sign In"
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
  onRefresh,
  paymentAccounts,
  selectedAccountId,
}: {
  userId: string;
  token: string;
  onRefresh: () => void;
  paymentAccounts: { [accountId: string]: { name: string; stripeAccountId: string; stripeOnboardingComplete?: boolean } } | null;
  selectedAccountId: string | null;
}) => {
  console.log("user is", userId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasMultipleBranches = paymentAccounts && Object.keys(paymentAccounts).length > 0;
  const showAllBranches = hasMultipleBranches && selectedAccountId === null;

  const handleRefreshLink = async (accountId?: string) => {
    setLoading(true);
    setError("");
    try {
      const { onboardingUrl } = await api.refreshOnboardingLink(userId, token, accountId);
      window.location.href = onboardingUrl;
    } catch (err: any) {
      setError(err.message || "Failed to get onboarding link");
    } finally {
      setLoading(false);
    }
  };

  // Show status of all branches when "All Branches" is selected
  if (showAllBranches) {
    const accounts = Object.entries(paymentAccounts!);
    const incompleteAccounts = accounts.filter(([, account]) => !account.stripeOnboardingComplete);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <AlertCircle size={32} className="text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Stripe Onboarding Status
            </h2>
            <p className="text-gray-700">
              Select a branch from the navigation above to complete its Stripe onboarding.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Branch Status:</h3>
            {accounts.map(([accountId, account]) => (
              <div
                key={accountId}
                className={`p-4 rounded-lg border-2 ${
                  account.stripeOnboardingComplete
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {account.stripeOnboardingComplete ? (
                      <CheckCircle size={20} className="text-green-600 mr-2" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600 mr-2" />
                    )}
                    <span className="font-medium text-gray-900">{account.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    account.stripeOnboardingComplete ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {account.stripeOnboardingComplete ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {incompleteAccounts.length > 0 && (
            <p className="text-sm text-gray-600 mt-4 text-center">
              {incompleteAccounts.length} branch{incompleteAccounts.length > 1 ? 'es' : ''} require{incompleteAccounts.length === 1 ? 's' : ''} onboarding
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show onboarding for specific branch
  const accountName = selectedAccountId && paymentAccounts?.[selectedAccountId]
    ? paymentAccounts[selectedAccountId].name
    : 'Main Account';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <AlertCircle size={32} className="text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Stripe Onboarding
        </h2>
        <p className="text-gray-700 mb-2">
          {hasMultipleBranches && selectedAccountId
            ? `Complete Stripe onboarding for ${accountName}`
            : 'Complete your Stripe account setup'}
        </p>
        <p className="text-gray-600 text-sm mb-6">
          This is required to securely receive payments.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={() => handleRefreshLink(selectedAccountId || undefined)}
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
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      admin_reviewed: "bg-yellow-100 text-yellow-800 border-yellow-300",
      restaurant_reviewed: "bg-blue-100 text-blue-800 border-blue-300",
      payment_link_sent: "bg-blue-100 text-blue-800 border-blue-300",
      paid: "bg-green-100 text-green-800 border-green-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      completed: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
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
        <div
          key={withdrawal.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  withdrawal.status
                )}`}
              >
                {withdrawal.status.toUpperCase()}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                ID: {withdrawal.id.substring(0, 8)}...
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-gray-900">
                {withdrawal.amount}
              </p>
              {withdrawal.feeCharged > 0 && (
                <p className="text-xs text-red-600">
                  Fee: -{withdrawal.feeCharged}
                </p>
              )}
              <p className="text-sm font-semibold text-green-600">
                {withdrawal.netAmount}
              </p>
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
              <p className="text-xs font-medium text-red-900">
                Rejection Reason:
              </p>
              <p className="text-sm text-red-800">
                {withdrawal.rejectionReason}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Payment Account Selector Component
const PaymentAccountSelector = ({
  paymentAccounts,
  selectedAccountId,
  onSelectAccount,
}: {
  paymentAccounts: {
    [accountId: string]: { name: string; stripeAccountId: string };
  } | null;
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string | null) => void;
}) => {
  // Only hide if paymentAccounts is null (not defined)
  // Show even if there's just 1 branch
  if (!paymentAccounts) {
    return null;
  }

  const accounts = Object.entries(paymentAccounts);

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Branch
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectAccount(null)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              selectedAccountId === null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Branches
          </button>
          {accounts.map(([accountId, account]) => (
            <button
              key={accountId}
              onClick={() => onSelectAccount(accountId)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedAccountId === accountId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {account.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add new component before WithdrawalDashboard
const CateringOrdersList = ({
  orders,
  restaurantId,
  restaurantUserId,
  token,
  onRefresh,
  hasMultipleBranches,
  selectedAccountId,
}: {
  orders: CateringOrder[];
  restaurantId: string;
  restaurantUserId: string;
  token: string;
  onRefresh: () => void;
  hasMultipleBranches: boolean;
  selectedAccountId: string | null;
}) => {
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<string>('admin_reviewed');
  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, string>>({}); // orderId -> accountId
  const [availableAccounts, setAvailableAccounts] = useState<Record<string, any>>({});
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const getPayoutAccountName = (order: CateringOrder): string | null => {
    if (!order.restaurantPayoutDetails) return null;

    const payoutDetail = order.restaurantPayoutDetails[restaurantId];
    return payoutDetail?.accountName || null;
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      const accounts = await api.getPaymentAccounts(restaurantUserId);
      setAvailableAccounts(accounts || {});

      // Set default account for each order
      if (accounts && Object.keys(accounts).length > 0) {
        const defaultAccountId = Object.keys(accounts)[0];
        const defaultSelections: Record<string, string> = {};
        orders.forEach(order => {
          defaultSelections[order.id] = defaultAccountId;
        });
        setSelectedAccounts(defaultSelections);
      }

      setLoadingAccounts(false);
    };

    fetchAccounts();
  }, [restaurantUserId, orders.length]);

  // Switch tab when viewing specific branch (can't show admin_reviewed on specific branches)
  useEffect(() => {
    if (hasMultipleBranches && selectedAccountId !== null && activeStatusTab === 'admin_reviewed') {
      setActiveStatusTab('restaurant_reviewed');
    }
  }, [hasMultipleBranches, selectedAccountId, activeStatusTab]);
  

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (amount: any) => `£${amount}`;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      admin_reviewed: "bg-yellow-100 text-yellow-800 border-yellow-300",
      restaurant_reviewed: "bg-blue-100 text-blue-800 border-blue-300",
      paid: "bg-green-100 text-green-800 border-green-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      completed: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      admin_reviewed: "REVIEW",
      restaurant_reviewed: "PENDING PAYMENT",
      paid: "CONFIRMED",
      confirmed: "CONFIRMED",
      completed: "COMPLETED",
    };
    return labels[status] || status.toUpperCase();
  };

  const formatEventTime = (eventTime: string) => {
    // Parse the time and subtract 1.5 hours
    const [hours, minutes] = eventTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes - 30;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
      2,
      "0"
    )}`;
  };

  const handleReview = async (orderId: string, accepted: boolean) => {
    setReviewing(orderId);
    setError("");

    try {
      const selectedAccountId = selectedAccounts[orderId];
      
      await api.reviewCateringOrder(
        orderId, 
        restaurantId, 
        accepted, 
        token,
        selectedAccountId // Pass selected account
      );
      await onRefresh()
    } catch (err: any) {
      setError(err.message || "Failed to review order");
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

  // Determine if we should show only pending review (All Branches view)
  const showOnlyPendingReview = hasMultipleBranches && selectedAccountId === null;

  // Determine if we should hide pending review (specific branch view)
  const hidePendingReview = hasMultipleBranches && selectedAccountId !== null;

  // Fix 2: Update statusTabs to prevent count inflation
  const allStatusTabs = [
    {
      key: "admin_reviewed",
      label: "Pending Review",
      count: ordersByStatus["admin_reviewed"]?.length || 0,
    },
    {
      key: "restaurant_reviewed",
      label: "Awaiting Payment",
      count:
        (ordersByStatus["restaurant_reviewed"]?.length || 0) +
        (ordersByStatus["payment_link_sent"]?.length || 0),
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count: [
        ...new Set([
          ...(ordersByStatus["paid"] || []),
          ...(ordersByStatus["confirmed"] || []),
        ]),
      ].length,
    },
    {
      key: "completed",
      label: "Completed",
      count: ordersByStatus["completed"]?.length || 0,
    },
  ];

  // Filter tabs based on context:
  // - All Branches view: show only Pending Review
  // - Specific branch view: show all EXCEPT Pending Review
  // - No branches (legacy): show all tabs
  const statusTabs = showOnlyPendingReview
    ? allStatusTabs.filter(tab => tab.key === "admin_reviewed")
    : hidePendingReview
    ? allStatusTabs.filter(tab => tab.key !== "admin_reviewed")
    : allStatusTabs;

  // Fix 1: Update getActiveOrders function to prevent duplicate orders
  const getActiveOrders = () => {
    if (activeStatusTab === "confirmed") {
      return [
        ...(ordersByStatus["paid"] || []),
        ...(ordersByStatus["confirmed"] || []),
      ];
    }
    if (activeStatusTab === "restaurant_reviewed") {
      // Include both restaurant_reviewed and payment_link_sent statuses
      return [
        ...(ordersByStatus["restaurant_reviewed"] || []),
        ...(ordersByStatus["payment_link_sent"] || []),
      ];
    }
    return ordersByStatus[activeStatusTab] || [];
  };

  const activeOrders = getActiveOrders();

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No Event orders yet</p>
        <p className="text-sm mt-2">
          Your confirmed Event orders will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Tabs */}

      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-4 sm:space-x-8 min-w-max px-4 sm:px-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveStatusTab(tab.key)}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                activeStatusTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-1 sm:ml-2 py-0.5 px-1.5 sm:px-2 rounded-full text-xs ${
                    activeStatusTab === tab.key
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders */}
      {activeOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No orders in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => (
            // Fix 3: Mobile optimization - Update the order card styling
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div>
                  <span
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border inline-block ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="sm:text-right">
                  <p className="font-bold text-xl sm:text-2xl text-gray-900">
                    {formatCurrency(order.restaurantTotalCost)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Reference: {order.id.slice(-4).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Event: {formatDate(order.eventDate)}
                  </p>
                </div>
              </div>

              {/* Event Details */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Event Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">
                    Date:{" "}
                    <span className="text-gray-900 font-medium">
                      {formatDate(order.eventDate)}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Collection Time:{" "}
                    <span className="text-gray-900 font-medium">
                      {formatEventTime(order.eventTime)}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Guests:{" "}
                    <span className="text-gray-900 font-medium">
                      {order.guestCount} people
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Account:{" "}
                    <span className="text-gray-900 font-medium">
                      {getPayoutAccountName(order)}
                    </span>
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Delivery:{" "}
                  <span className="text-gray-900 font-medium">
                    {order.deliveryAddress}
                  </span>
                </p>
              </div>

              {/* Order Items - Mobile optimized scrolling */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                  Order Items
                </h4>
                <div className="max-h-48 sm:max-h-64 overflow-y-auto pr-2">
                  {order.orderItems.map((restaurant, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="space-y-2">
                        {restaurant.menuItems.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex justify-between items-center bg-gray-50 p-2 sm:p-3 rounded"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Requirements - Mobile optimized */}
              {order.specialRequirements && (
                <div className="mt-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-900 mb-1">
                    Special Requirements:
                  </p>
                  <p className="text-xs sm:text-sm text-yellow-800 break-words">
                    {order.specialRequirements}
                  </p>
                </div>
              )}

              {/* Review Buttons - Mobile optimized */}
              {order.status === "admin_reviewed" && (
                <div className="mt-4 pt-4 border-t border-gray-200">

                  {/* Account Selector - Show if restaurant has branches */}
                  {!loadingAccounts && availableAccounts && Object.keys(availableAccounts).length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <label className="block text-sm font-semibold text-blue-900 mb-2">
                        💳 Select Branch/Payment Account:
                      </label>
                      <select
                        value={selectedAccounts[order.id] || ''}
                        onChange={(e) => setSelectedAccounts(prev => ({
                          ...prev,
                          [order.id]: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(availableAccounts).map(([id, account]: [string, any]) => (
                          <option key={id} value={id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-blue-700 mt-2">
                        💰 Payment will be sent to: <strong>{availableAccounts[selectedAccounts[order.id]]?.name || 'Selected Account'}</strong>
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mb-3">
                    Please review this order and confirm your availability
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleReview(order.id, true)}
                      disabled={reviewing === order.id || loadingAccounts}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
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
                      disabled={reviewing === order.id || loadingAccounts}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center text-sm"
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
      )}
    </div>
  );
};

// Main Withdrawal Dashboard
const WithdrawalDashboard = ({
  userId,
  restaurantUserId,
  restaurantId,
  restaurant,
  restaurantUser,
  token,
  onLogout,
}: {
  userId: string;
  restaurantUserId: string;
  restaurantId: string;
  restaurant: any;
  restaurantUser: any;
  token: string;
  onLogout: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [stripeStatus, setStripeStatus] =
    useState<StripeOnboardingStatus | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cateringOrders, setCateringOrders] = useState<CateringOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"withdrawals" | "catering">(
    "withdrawals"
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  // Update fetchData function to include catering orders
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statusData, balanceData, historyData, cateringData] =
        await Promise.all([
          api.checkStripeStatus(restaurantUserId, selectedAccountId),
          api.getBalance(restaurantUserId, token, selectedAccountId),
          api.getWithdrawalHistory(restaurantUserId, token, selectedAccountId),
          api.getCateringOrders(restaurantId, selectedAccountId),
        ]);

      if (statusData) setStripeStatus(statusData);
      if (balanceData) setBalance(balanceData);
      setHistory(historyData || []);

      // Filter catering orders based on selected account
      let filteredOrders = cateringData || [];
      if (selectedAccountId) {
        // When a specific branch is selected, filter orders that have the selectedAccountId in their payout details
        filteredOrders = filteredOrders.filter((order: CateringOrder) => {
          if (!order.restaurantPayoutDetails) return false;

          // Check if any of the payout details have the matching selectedAccountId
          return Object.values(order.restaurantPayoutDetails).some(
            (details: any) => details.selectedAccountId === selectedAccountId
          );
        });
      }

      setCateringOrders(filteredOrders);
      console.log("Catering data is", cateringData, "Filtered:", filteredOrders, "Selected Account:", selectedAccountId);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, token, selectedAccountId]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amount = parseFloat(withdrawalAmount);

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (balance && amount > balance.available) {
      setError(
        `Insufficient balance. Available: £${balance.available.toFixed(2)}`
      );
      return;
    }

    setSubmitting(true);

    try {
      await api.requestWithdrawal(
        {
          userId: restaurantUserId,
          userType: "restaurant",
          amount,
          notes: notes.trim() || undefined,
          isInstantPayout: false,
        },
        token
      );

      setSuccess(
        "Withdrawal request submitted successfully! Pending admin approval."
      );
      setWithdrawalAmount("");
      setNotes("");

      // Refresh data
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-blue-600 mx-auto mb-4"
          />
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
            <h1 className="text-3xl font-bold text-gray-900">
              {restaurant.restaurant_name} Dashboard
            </h1>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>

          {/* Payment Account Selector */}
          <PaymentAccountSelector
            paymentAccounts={restaurantUser?.paymentAccounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
          />

          <StripeOnboardingRequired
            userId={restaurantUserId}
            token={token}
            onRefresh={fetchData}
            paymentAccounts={restaurantUser?.paymentAccounts}
            selectedAccountId={selectedAccountId}
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
          <h1 className="text-3xl font-bold text-gray-900">
            {restaurant.restaurant_name} Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>

        {/* Payment Account Selector */}
        <PaymentAccountSelector
          paymentAccounts={restaurantUser?.paymentAccounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
        />

        {/* Determine if showing all branches */}
        {(() => {
          const hasMultipleBranches = !!restaurantUser?.paymentAccounts && Object.keys(restaurantUser.paymentAccounts).length > 0;
          const showAllBranches = hasMultipleBranches && selectedAccountId === null;

          // If showing all branches, only show Event Orders (pending review)
          if (showAllBranches) {
            return (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Event Orders - Pending Review
                </h2>
                <div className="max-h-[800px] overflow-y-auto">
                  <CateringOrdersList
                    orders={cateringOrders}
                    restaurantId={restaurantId}
                    restaurantUserId={restaurantUserId}
                    token={token}
                    onRefresh={fetchData}
                    hasMultipleBranches={hasMultipleBranches}
                    selectedAccountId={selectedAccountId}
                  />
                </div>
              </div>
            );
          }

          // Otherwise show normal dashboard with balance and tabs
          return (
            <>
              {/* Balance Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-2">
              <DollarSign size={24} />
              <span className="ml-2 text-sm font-medium">
                Available Balance
              </span>
            </div>
            <p className="text-4xl font-bold">
              £{balance?.available.toFixed(2) || "0.00"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center mb-2">
              <Clock size={24} />
              <span className="ml-2 text-sm font-medium">Pending Balance</span>
            </div>
            <p className="text-4xl font-bold">
              £{balance?.pending.toFixed(2) || "0.00"}
            </p>
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
                onClick={() => setActiveTab("withdrawals")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "withdrawals"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setActiveTab("catering")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "catering"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
            <AlertCircle
              size={20}
              className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="font-medium text-yellow-900">
                Early Withdrawal Fee
              </p>
              <p className="text-sm text-yellow-800">
                You withdrew within the last 7 days. A £0.50 fee will be charged
                for this withdrawal.
              </p>
            </div>
          </div>
        )}

        {activeTab === "withdrawals" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Withdrawal Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Request Withdrawal
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
                  <AlertCircle
                    size={18}
                    className="mr-2 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start text-green-700">
                  <CheckCircle
                    size={18}
                    className="mr-2 flex-shrink-0 mt-0.5"
                  />
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
                    Available: £{balance?.available.toFixed(2) || "0.00"}
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
                      <span className="font-medium">
                        £{parseFloat(withdrawalAmount).toFixed(2)}
                      </span>
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
                        £
                        {(
                          parseFloat(withdrawalAmount) -
                          (balance && !balance.canWithdrawWithoutFee ? 0.5 : 0)
                        ).toFixed(2)}
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
                    "Request Withdrawal"
                  )}
                </button>
              </form>
            </div>

            {/* Withdrawal History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Withdrawal History
              </h2>
              <div className="max-h-[600px] overflow-y-auto">
                <WithdrawalHistory history={history} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Event Orders
            </h2>
            <div className="max-h-[800px] overflow-y-auto">
              <CateringOrdersList
                orders={cateringOrders}
                restaurantId={restaurantId}
                restaurantUserId={restaurantUserId}
                token={token}
                onRefresh={fetchData}
                hasMultipleBranches={!!restaurantUser?.paymentAccounts && Object.keys(restaurantUser.paymentAccounts).length > 0}
                selectedAccountId={selectedAccountId}
              />
            </div>
          </div>
        )}
            </>
          );
        })()}
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
  console.log("user is", user);
  return (
    <WithdrawalDashboard
      userId={user.id}
      restaurantUserId={user.restaurantUser.id}
      restaurantId={user.restaurantUser.restaurant?.id}
      restaurant={user.restaurantUser?.restaurant}
      restaurantUser={user.restaurantUser}
      token={token}
      onLogout={logout}
    />
  );
};

export default RestaurantWithdrawalApp;
