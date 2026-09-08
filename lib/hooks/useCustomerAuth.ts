"use client";

import { useCallback, useEffect, useState } from "react";
import { CUSTOMER_STORAGE_KEYS } from "@/lib/api-client/storage-keys";
import { customerAuthApi } from "@/services/api/customer-auth.api";
import {
  CustomerLoginResult,
  CustomerTokenPair,
  CustomerUser,
  isNeedsVerification,
} from "@/types/api/customer-auth.api.types";

// Fired after a sign-in or sign-out so surfaces mounted in the same tab
// (the navbar, mainly) pick up the new state without a reload.
const AUTH_CHANGE_EVENT = "swift:customer-auth-change";

export const notifyCustomerAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

const readStoredUser = (): CustomerUser | null => {
  if (!localStorage.getItem(CUSTOMER_STORAGE_KEYS.accessToken)) return null;
  const stored = localStorage.getItem(CUSTOMER_STORAGE_KEYS.user);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as CustomerUser;
  } catch {
    localStorage.removeItem(CUSTOMER_STORAGE_KEYS.user);
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem(CUSTOMER_STORAGE_KEYS.accessToken);
  localStorage.removeItem(CUSTOMER_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(CUSTOMER_STORAGE_KEYS.user);
};

export const useCustomerAuth = () => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem(CUSTOMER_STORAGE_KEYS.accessToken));
      setUser(readStoredUser());
      setLoading(false);
    };

    sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  /**
   * Stores a fresh token pair and caches the profile behind it. Used by both
   * sign-in and the claim link, which hands back tokens directly.
   */
  const startSession = useCallback(async (tokens: CustomerTokenPair) => {
    localStorage.setItem(CUSTOMER_STORAGE_KEYS.accessToken, tokens.access_token);
    localStorage.setItem(CUSTOMER_STORAGE_KEYS.refreshToken, tokens.refresh_token);

    // A profile we cannot read is not worth failing a good sign-in over.
    const profile = await customerAuthApi.getProfile().catch(() => null);
    if (profile) {
      localStorage.setItem(CUSTOMER_STORAGE_KEYS.user, JSON.stringify(profile));
    }

    notifyCustomerAuthChange();
  }, []);

  /**
   * Resolves to the unverified-account payload when the customer signed up in
   * the app and never confirmed their email; otherwise it signs them in.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<CustomerLoginResult> => {
      const result = await customerAuthApi.login(email, password);
      if (isNeedsVerification(result)) return result;
      await startSession(result);
      return result;
    },
    [startSession]
  );

  const logout = useCallback(async () => {
    await customerAuthApi.logout();
    clearSession();
    notifyCustomerAuthChange();
  }, []);

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    startSession,
    logout,
  };
};
