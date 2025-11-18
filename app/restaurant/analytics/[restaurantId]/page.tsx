// app/restaurant/analytics/[restaurantId]/page.tsx
"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { LoginPage } from "../../login/LoginPage";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut, Loader } from "lucide-react";
import { restaurantApi } from "@/services/api/restaurant.api";
import { StripeOnboardingStatus } from "@/types/restaurant.types";
import { StripeOnboardingRequired } from "../../dashboard/shared/StripeOnboardingRequired";
import { AnalyticsDashboard } from "../../dashboard/analytics/AnalyticsDashboard";

const RestaurantAnalyticsPage = () => {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const { user, token, login, logout, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stripeStatus, setStripeStatus] =
    useState<StripeOnboardingStatus | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // TODO: This does not actually do anything, just to fix linting problem
    setSelectedAccountId(null);
  });

  const handleLogout = () => {
    logout();
    router.push("/restaurant/dashboard");
  };

  const fetchData = async () => {
    if (!user || !token) return;

    setLoading(true);
    try {
      const statusData = await restaurantApi.checkStripeStatus(
        user.restaurantUser.id,
        selectedAccountId
      );
      if (statusData) setStripeStatus(statusData);
    } catch (err: any) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchData();
    }
  }, [user, token, selectedAccountId]);

  if (!isAuthenticated || !user || !token) {
    return <LoginPage onLogin={login} />;
  }

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
              {user.restaurantUser?.restaurant?.restaurant_name} Analytics
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>

          <StripeOnboardingRequired
            userId={user.restaurantUser.id}
            token={token}
            onRefresh={fetchData}
            paymentAccounts={user.restaurantUser?.paymentAccounts}
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
          <div>
            <button
              onClick={() => router.push("/restaurant/dashboard")}
              className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.restaurantUser?.restaurant?.restaurant_name} Analytics
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-white rounded-lg p-6">
          <AnalyticsDashboard
            restaurantId={restaurantId}
            token={token}
            // selectedAccountId={selectedAccountId}
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantAnalyticsPage;
