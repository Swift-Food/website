import { CUSTOMER_AUTH_PROMPT_KEY } from "@/lib/api-client/storage-keys";

export interface AuthPromptState {
  /** The customer session is still being restored. */
  loading: boolean;
  isAuthenticated: boolean;
  /** This device has been shown the prompt before, and has not signed in since. */
  seen: boolean;
}

/**
 * Whether to ask a customer to sign in before they start ordering.
 *
 * `loading` is the term that matters: the session restores asynchronously, so
 * deciding before it settles flashes the prompt at customers who are already
 * signed in.
 */
export const shouldShowAuthPrompt = ({
  loading,
  isAuthenticated,
  seen,
}: AuthPromptState): boolean => !loading && !isAuthenticated && !seen;

/**
 * Reads are wrapped because Safari's private mode throws on access rather
 * than returning null. A device we cannot read is treated as one that has not
 * seen the prompt: showing it twice is a smaller cost than a blank order page.
 */
export const hasSeenAuthPrompt = (): boolean => {
  try {
    return localStorage.getItem(CUSTOMER_AUTH_PROMPT_KEY) === "1";
  } catch {
    return false;
  }
};

export const markAuthPromptSeen = (): void => {
  try {
    localStorage.setItem(CUSTOMER_AUTH_PROMPT_KEY, "1");
  } catch {
    // Nothing to do — the customer sees the prompt again next visit.
  }
};

export const clearAuthPromptSeen = (): void => {
  try {
    localStorage.removeItem(CUSTOMER_AUTH_PROMPT_KEY);
  } catch {
    // Nothing to do — the flag stays set until the next writable visit.
  }
};
