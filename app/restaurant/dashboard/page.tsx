// app/restaurant/withdrawal/page.tsx or wherever your main component is
"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { LoginPage } from "../login/LoginPage";
import { RestaurantDashboard } from "./RestaurantDashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RestaurantWithdrawalApp = () => {
  const router = useRouter();
  const { user, token, login, logout, isAuthenticated } = useAuth();



  const handleLogout = () => {
    logout();
    router.push('/restaurant/login');
  };
  if (token)
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
