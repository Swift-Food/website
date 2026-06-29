import { useState, useEffect } from 'react';
import { coworkingApi } from '@/services/api/coworking.api';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'cw_access_token',
  REFRESH_TOKEN: 'cw_refresh_token',
  USER: 'cw_user',
} as const;

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
    const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const tokens = await coworkingApi.login(email, password);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);

    // Set main access_token so fetchWithAuth picks it up for getProfile
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    const profile = await coworkingApi.getProfile();
    const userObj = profile.user ?? profile;
    console.log("Fetched user profile:", JSON.stringify(userObj));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userObj));

    setToken(tokens.access_token);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  };

  // Profile shape: user.partnerSpaceUsers[].partnerSpaceId
  const spaceUsers: CoworkingSpaceUser[] = user?.partnerSpaceUsers ?? [];
  const spaceIds = spaceUsers.map((s) => s.partnerSpaceId);
  const spaceId: string | null = spaceIds[0] ?? null;

  return { user, token, login, logout, isAuthenticated: !!token, loading, spaceId, spaceIds };
};
