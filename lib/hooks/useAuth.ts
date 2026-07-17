// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { restaurantApi } from "@/services/api/restaurant.api";
import { RESTAURANT_STORAGE_KEYS } from "@/lib/api-client/storage-keys";

const UserRole = {
  RESTAURANT: "restaurant_owner",
  CUSTOMER: "customer",
  DRIVER: "driver",
  ADMIN: "admin",
} as const;

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(RESTAURANT_STORAGE_KEYS.accessToken);
    const storedUser = localStorage.getItem(RESTAURANT_STORAGE_KEYS.user);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser).user);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const credentials = {
      email,
      password,
      role: UserRole.RESTAURANT,
    };
    const tokens = await restaurantApi.login(credentials);
    localStorage.setItem(RESTAURANT_STORAGE_KEYS.accessToken, tokens.access_token);
    localStorage.setItem(RESTAURANT_STORAGE_KEYS.refreshToken, tokens.refresh_token);

    const profile = await restaurantApi.getProfile();
    localStorage.setItem(RESTAURANT_STORAGE_KEYS.user, JSON.stringify(profile));

    setToken(tokens.access_token);
    setUser(profile.user);
  };

  const logout = () => {
    localStorage.removeItem(RESTAURANT_STORAGE_KEYS.accessToken);
    localStorage.removeItem(RESTAURANT_STORAGE_KEYS.refreshToken);
    localStorage.removeItem(RESTAURANT_STORAGE_KEYS.user);
    setToken(null);
    setUser(null);
  };

  return { user, token, login, logout, isAuthenticated: !!token, loading };
};