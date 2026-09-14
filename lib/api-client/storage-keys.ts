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

export const CUSTOMER_STORAGE_KEYS: AuthStorageKeys = {
  accessToken: "cust_access_token",
  refreshToken: "cust_refresh_token",
  user: "cust_user",
};

/**
 * Not part of AuthStorageKeys: that shape is the token trio handed to
 * createAuthClient. This sits beside it so every customer-scoped key stays in
 * one file.
 *
 * Set once the customer has been shown the sign-in prompt on their first
 * order, whether they signed in or dismissed it.
 */
export const CUSTOMER_AUTH_PROMPT_KEY = "cust_auth_prompt_seen";
