
"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { RestaurantDashboard } from "./RestaurantDashboard";
import { useRouter } from "next/navigation";


const RestaurantWithdrawalApp = () => {
  const router = useRouter();
  const { user, token, logout} = useAuth();



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
