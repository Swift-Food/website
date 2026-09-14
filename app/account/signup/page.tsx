"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthAlert } from "@/lib/components/account/AuthAlert";
import { AuthCard } from "@/lib/components/account/AuthCard";
import { AuthField } from "@/lib/components/account/AuthField";
import { AuthLink } from "@/lib/components/account/AuthLink";
import { AuthSubmitButton } from "@/lib/components/account/AuthSubmitButton";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";
import { customerAuthApi, isEmailTaken } from "@/services/api/customer-auth.api";
import { safeNextPath } from "@/lib/utils/safe-next-path";

/**
 * Signing up, in two steps on one page:
 *  - `details`  name, email and a password the customer chooses
 *  - `code`     the 6-digit code we email; entering it also signs them in
 *
 * `?verify=1&email=` drops straight into the second step, which is where an
 * unverified sign-in is sent.
 */
function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startSession } = useCustomerAuth();

  const next = safeNextPath(searchParams.get("next"));

  const [step, setStep] = useState<"details" | "code">(
    searchParams.get("verify") === "1" ? "code" : "details",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [taken, setTaken] = useState(false);

  const passwordShort = password.length > 0 && password.length < 6;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const codeBad = code.length > 0 && !/^\d{6}$/.test(code);

  const canSubmitDetails =
    !!name.trim() &&
    !!email.trim() &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitDetails) return;
    setError("");
    setNotice("");
    setTaken(false);
    setSubmitting(true);
    try {
      await customerAuthApi.registerConsumer(email.trim(), name.trim(), password);
      setStep("code");
      setNotice("We have sent a 6-digit code to your email. It expires in 5 minutes.");
    } catch (err) {
      if (isEmailTaken(err)) setTaken(true);
      else setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return;
    setError("");
    setSubmitting(true);
    try {
      const tokens = await customerAuthApi.verifyEmail(email.trim(), code);
      await startSession(tokens);
      router.push(next ?? "/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is invalid or has expired.");
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError("");
    setNotice("");
    setResending(true);
    try {
      await customerAuthApi.resendVerification(email.trim());
      setNotice("We have sent a new code. The previous one no longer works.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a new code.");
    } finally {
      setResending(false);
    }
  };

  if (step === "code") {
    return (
      <AuthCard
        title="Check your email"
        subtitle={`Enter the 6-digit code we sent to ${email.trim() || "your inbox"}.`}
        footer={
          <>
            Wrong email?{" "}
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setError("");
                setNotice("");
              }}
              className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
            >
              Start again
            </button>
          </>
        }
      >
        <form onSubmit={handleCode} className="space-y-8">
          {error && <AuthAlert tone="error" message={error} />}
          {notice && <AuthAlert tone="success" message={notice} />}

          <AuthField
            label="6-digit code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            error={codeBad ? "Must be exactly 6 digits." : undefined}
            className="tracking-[0.5em] font-mono text-lg"
            action={
              <button
                type="button"
                onClick={resend}
                disabled={resending || !email.trim()}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-black disabled:text-gray-300 transition-colors"
              >
                {resending ? "Sending…" : "Resend"}
              </button>
            }
          />

          <AuthSubmitButton
            label="Verify & Continue"
            pendingLabel="Verifying…"
            pending={submitting}
            disabled={!/^\d{6}$/.test(code)}
          />
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Save your details, track your catering orders, and reorder in a couple of taps."
      footer={
        <>
          Already have an account? <AuthLink href="/account/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleDetails} className="space-y-8">
        {error && <AuthAlert tone="error" message={error} />}

        {taken && (
          <div
            role="alert"
            className="p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600 space-y-3"
          >
            <p className="font-light leading-relaxed">
              This email already has an account — if you have ordered with us before, one
              was made for you at checkout.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <AuthLink href={`/account/login?email=${encodeURIComponent(email.trim())}`}>
                Sign in
              </AuthLink>
              <AuthLink href="/account/claim">Set a password</AuthLink>
            </div>
          </div>
        )}

        <AuthField
          label="Your Name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
        />

        <AuthField
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setTaken(false);
          }}
          placeholder="name@company.com"
        />

        <AuthField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={passwordShort ? "Minimum 6 characters." : undefined}
        />

        <AuthField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          error={passwordMismatch ? "Passwords do not match." : undefined}
        />

        <AuthSubmitButton
          label="Create Account"
          pendingLabel="Creating…"
          pending={submitting}
          disabled={!canSubmitDetails}
        />
      </form>
    </AuthCard>
  );
}

export default function CustomerSignupPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Create account">
          <div className="h-64" />
        </AuthCard>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
