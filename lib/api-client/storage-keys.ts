export interface AuthStorageKeys {
  accessToken: string;
  refreshToken: string;
  user: string;
}

export const RESTAURANT_STORAGE_KEYS: AuthStorageKeys = {
  accessToken: "rest_access_token",
  refreshToken: "rest_refresh_token",
  user: "rest_user",
};

export const PARTNER_STORAGE_KEYS: AuthStorageKeys = {
  accessToken: "cw_access_token",
  refreshToken: "cw_refresh_token",
  user: "cw_user",
};
