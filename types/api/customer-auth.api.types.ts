/** Catering customer accounts — /auth/* contract for the website. */

export interface CustomerTokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/** The `users` row behind a catering customer. Consumers have no split name. */
export interface CustomerUser {
  id: string;
  email: string;
  username?: string;
  phoneNumber?: string;
  profilePicture?: string | null;
}

/**
 * A sign-up that never confirmed its email gets this instead of tokens. The
 * way out is to resend the code and enter it, which verifies the account and
 * signs them in.
 */
export interface CustomerNeedsVerification {
  success: boolean;
  needsVerification: true;
  message: string;
  userId: string;
  email: string;
}

export type CustomerLoginResult = CustomerTokenPair | CustomerNeedsVerification;

export const isNeedsVerification = (
  result: CustomerLoginResult
): result is CustomerNeedsVerification =>
  (result as CustomerNeedsVerification).needsVerification === true;

export interface AuthMessageResponse {
  success: boolean;
  message: string;
}
