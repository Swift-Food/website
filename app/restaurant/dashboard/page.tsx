// app/restaurant/withdrawal/page.tsx or wherever your main component is
"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { LoginPage } from "./LoginPage";
import { RestaurantDashboard } from "./RestaurantDashboard";
import { useRouter } from "next/navigation";

const RestaurantWithdrawalApp = () => {
  const router = useRouter();
  const { user, token, login, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    // Clear URL parameters by navigating to clean path
    router.push('/restaurant/dashboard');
  };

  if (!isAuthenticated || !user || !token) {
    return <LoginPage onLogin={login} />;
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