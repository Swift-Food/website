import { fetchWithAuthCustomer, API_BASE_URL } from "@/lib/api-client/auth-client";
import {
  AuthMessageResponse,
  CustomerLoginResult,
  CustomerTokenPair,
  CustomerUser,
} from "@/types/api/customer-auth.api.types";

/** Consumer profiles are the `consumer` password context on every /auth route. */
const CONTEXT = "consumer";

/**
 * Carries the status through, so a caller can tell "this email is already
 * taken" (409) from any other failure without matching on message text.
 */
export class AuthRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AuthRequestError";
  }
}

export const isEmailTaken = (err: unknown): boolean =>
  err instanceof AuthRequestError && err.status === 409;

const parseError = async (response: Response, fallback: string): Promise<never> => {
  const body = await response.json().catch(() => ({}));
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
  throw new AuthRequestError(message || fallback, response.status);
};

const postPublic = async <T>(path: string, body: unknown, fallback: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) await parseError(response, fallback);
  return response.json();
};

export const customerAuthApi = {
  // POST /auth/login-consumer
  login: (email: string, password: string): Promise<CustomerLoginResult> =>
    postPublic<CustomerLoginResult>(
      "/auth/login-consumer",
      { email, password },
      "Sign in failed. Please check your email and password."
    ),

  // POST /auth/register-consumer — creates the account. Issues no tokens:
  // the account is unverified until the emailed code is entered.
  registerConsumer: (
    email: string,
    username: string,
    password: string
  ): Promise<AuthMessageResponse> =>
    postPublic<AuthMessageResponse>(
      "/auth/register-consumer",
      { email, username, password },
      "Could not create your account. Please try again."
    ),

  // POST /auth/register-consumer/resend — same answer for every email.
  resendVerification: (email: string): Promise<AuthMessageResponse> =>
    postPublic<AuthMessageResponse>(
      "/auth/register-consumer/resend",
      { email },
      "Could not send a new code. Please try again."
    ),

  // POST /auth/verify-email — verifying is also signing in; this returns tokens.
  verifyEmail: (email: string, code: string): Promise<CustomerTokenPair> =>
    postPublic<CustomerTokenPair>(
      "/auth/verify-email",
      { email, code },
      "That code is invalid or has expired."
    ),

  // POST /auth/claim-account — deliberately the same answer for every email.
  claimAccount: (email: string): Promise<AuthMessageResponse> =>
    postPublic<AuthMessageResponse>(
      "/auth/claim-account",
      { email },
      "Could not send the email. Please try again."
    ),

  // POST /auth/set-password — redeeming a claim link signs the customer in.
  setPasswordWithToken: (
    email: string,
    token: string,
    password: string
  ): Promise<CustomerTokenPair> =>
    postPublic<CustomerTokenPair>(
      "/auth/set-password",
      { email, token, password },
      "This link is invalid or has expired."
    ),

  // POST /auth/forgot-password — emails a 6-digit code, valid 10 minutes.
  forgotPassword: (email: string): Promise<AuthMessageResponse> =>
    postPublic<AuthMessageResponse>(
      "/auth/forgot-password",
      { email, context: CONTEXT },
      "Could not send a reset code. Please try again."
    ),

  // POST /auth/reset-password
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ): Promise<AuthMessageResponse> =>
    postPublic<AuthMessageResponse>(
      "/auth/reset-password",
      { email, code, newPassword, context: CONTEXT },
      "Could not reset your password. Please try again."
    ),

  // GET /auth/profile
  getProfile: async (): Promise<CustomerUser> => {
    const response = await fetchWithAuthCustomer(`${API_BASE_URL}/auth/profile`);
    if (!response.ok) await parseError(response, "Could not load your profile.");
    const body = await response.json();
    return (body?.user ?? body) as CustomerUser;
  },

  // POST /auth/change-password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const response = await fetchWithAuthCustomer(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) await parseError(response, "Could not change your password.");
  },

  // POST /auth/logout — revokes refresh tokens server-side.
  logout: async (): Promise<void> => {
    await fetchWithAuthCustomer(`${API_BASE_URL}/auth/logout`, { method: "POST" }).catch(
      () => undefined
    );
  },
};
