
"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { RestaurantDashboard } from "./RestaurantDashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


const RestaurantWithdrawalApp = () => {
  const router = useRouter();
  const { user, token, logout, loading } = useAuth();

  // Redirect to login if not authenticated after loading completes
  useEffect(() => {
    if (!loading && !token) {
      router.push('/restaurant/login');
    }
  }, [loading, token, router]);

  const handleLogout = () => {
    logout();
    router.push('/restaurant/login');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!token || !user) {
    return null;
  }

  return (
    <RestaurantDashboard
      userId={user.id}
      restaurantUserId={user.restaurantUser.id}
      restaurantId={user.restaurantUser.restaurant?.id}
      restaurant={user.restaurantUser?.restaurant}
      restaurantUser={user.restaurantUser}
      token={token}
      onLogout={handleLogout}
    />
  );
};

export default RestaurantWithdrawalApp;
