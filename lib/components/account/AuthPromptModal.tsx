"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAlert } from "@/lib/components/account/AuthAlert";
import { AuthField } from "@/lib/components/account/AuthField";
import { AuthSubmitButton } from "@/lib/components/account/AuthSubmitButton";
import { Modal } from "@/lib/components/Modal";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";
import { customerAuthApi } from "@/services/api/customer-auth.api";
import { isNeedsVerification } from "@/types/api/customer-auth.api.types";

interface AuthPromptModalProps {
  isOpen: boolean;
  /** Dismissed, or signed in — either way the order goes ahead. */
  onResolved: () => void;
  /** Where to return after signing up on the dedicated page. */
  returnTo: string;
}

/**
 * Shown once, when a customer starts their first order.
 *
 * Signing in is inline because it is one step. Creating an account is not:
 * it needs an emailed code, and asking for that before they have seen a menu
 * would cost more orders than it wins accounts — so it routes to the signup
 * page instead. Dismissing carries on as a guest, which creates an account at
 * checkout anyway.
 */
export const AuthPromptModal = ({ isOpen, onResolved, returnTo }: AuthPromptModalProps) => {
  const router = useRouter();
  const { login } = useCustomerAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (isNeedsVerification(result)) {
        // The account exists but was never verified. Send a fresh code and
        // hand off to the step that takes it.
        await customerAuthApi.resendVerification(email.trim()).catch(() => undefined);
        router.push(
          `/account/signup?verify=1&email=${encodeURIComponent(
            email.trim(),
          )}&next=${encodeURIComponent(returnTo)}`,
        );
        return;
      }
      onResolved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onResolved} labelledBy="auth-prompt-title" className="max-w-md">
      <div className="p-6 md:p-8">
        <h2
          id="auth-prompt-title"
          className="text-3xl font-black tracking-tighter uppercase text-black leading-none mb-3"
        >
          Sign in to order
        </h2>
        <p className="text-gray-400 font-light leading-relaxed mb-8 text-sm">
          Your details fill themselves in, and the order lands in your account. You can also
          carry on as a guest.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <AuthAlert tone="error" message={error} />}

          <AuthField
            label="Email Address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />

          <AuthField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            action={
              <a
                href={`/account/set-password?reset=1${
                  email.trim() ? `&email=${encodeURIComponent(email.trim())}` : ""
                }`}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-black transition-colors"
              >
                Forgot?
              </a>
            }
          />

          <AuthSubmitButton
            label="Sign In"
            pendingLabel="Signing in…"
            pending={submitting}
            disabled={!email.trim() || !password}
          />
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              router.push(`/account/signup?next=${encodeURIComponent(returnTo)}`)
            }
            className="text-[10px] font-black uppercase tracking-widest text-black hover:text-primary transition-colors"
          >
            Create account
          </button>
          <button
            type="button"
            onClick={onResolved}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </Modal>
  );
};
