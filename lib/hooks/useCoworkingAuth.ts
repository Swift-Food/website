import { useState, useEffect } from 'react';
import { coworkingApi } from '@/services/api/coworking.api';
import { PARTNER_STORAGE_KEYS } from '@/lib/api-client/storage-keys';

export interface CoworkingSpaceUser {
  id: string;
  partnerSpaceId: string;
  role: string;
}

export const useCoworkingAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(PARTNER_STORAGE_KEYS.accessToken);
    const storedUser = localStorage.getItem(PARTNER_STORAGE_KEYS.user);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(PARTNER_STORAGE_KEYS.user);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const tokens = await coworkingApi.login(email, password);
    localStorage.setItem(PARTNER_STORAGE_KEYS.accessToken, tokens.access_token);
    localStorage.setItem(PARTNER_STORAGE_KEYS.refreshToken, tokens.refresh_token);

    const profile = await coworkingApi.getProfile();
    const userObj = profile.user ?? profile;
    localStorage.setItem(PARTNER_STORAGE_KEYS.user, JSON.stringify(userObj));

    setToken(tokens.access_token);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem(PARTNER_STORAGE_KEYS.accessToken);
    localStorage.removeItem(PARTNER_STORAGE_KEYS.refreshToken);
    localStorage.removeItem(PARTNER_STORAGE_KEYS.user);
    setToken(null);
    setUser(null);
  };

  // Profile shape: user.partnerSpaceUsers[].partnerSpaceId
  const spaceUsers: CoworkingSpaceUser[] = user?.partnerSpaceUsers ?? [];
  const spaceIds = spaceUsers.map((s) => s.partnerSpaceId);
  const spaceId: string | null = spaceIds[0] ?? null;

  return { user, token, login, logout, isAuthenticated: !!token, loading, spaceId, spaceIds };
};
