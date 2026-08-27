"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AuthAlert } from "@/lib/components/account/AuthAlert";
import { AuthCard } from "@/lib/components/account/AuthCard";
import { AuthField } from "@/lib/components/account/AuthField";
import { AuthLink } from "@/lib/components/account/AuthLink";
import { AuthSubmitButton } from "@/lib/components/account/AuthSubmitButton";
import { customerAuthApi } from "@/services/api/customer-auth.api";

/**
 * Ordering as a guest already created an account behind the scenes. This asks
 * the backend to email the link that turns it into one the customer owns.
 * The answer is the same for every address, so nothing here reveals who has
 * an account.
 */
export default function ClaimAccountPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await customerAuthApi.claimAccount(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the email.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthCard
        title="Check your inbox"
        footer={
          <>
            Wrong address?{" "}
            <button
              onClick={() => setSent(false)}
              className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
            >
              Try another
            </button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-pink-50 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>
          <p className="text-gray-400 font-light leading-relaxed">
            If an account exists for <span className="text-black font-medium">{email.trim()}</span>,
            we have sent instructions to it. The link is valid for 72 hours.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Claim your account"
      subtitle="Order with us as a guest and we already hold an account for you. Tell us your email and we will send you a link to set a password."
      footer={
        <>
          Already have a password? <AuthLink href="/account/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8">
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

        <AuthSubmitButton
          label="Send Link"
          pendingLabel="Sending…"
          pending={submitting}
          disabled={!email.trim()}
        />
      </form>
    </AuthCard>
  );
}
