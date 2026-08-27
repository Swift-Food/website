"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthAlert } from "@/lib/components/account/AuthAlert";
import { AuthCard } from "@/lib/components/account/AuthCard";
import { AuthField } from "@/lib/components/account/AuthField";
import { AuthLink } from "@/lib/components/account/AuthLink";
import { AuthSubmitButton } from "@/lib/components/account/AuthSubmitButton";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";
import { customerAuthApi } from "@/services/api/customer-auth.api";

/**
 * Two ways in, one page — the shape the account emails link to:
 *  - `?email=&token=`      the 72h claim link; redeeming it signs the customer in
 *  - `?reset=1&email=`     a password reset, proved by a 6-digit code we send here
 */
function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startSession } = useCustomerAuth();

  const token = searchParams.get("token") ?? "";
  const hasToken = !!token;

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const codeBad = code.length > 0 && !/^\d{6}$/.test(code);
  const passwordShort = password.length > 0 && password.length < 6;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    !!email.trim() &&
    (hasToken || /^\d{6}$/.test(code)) &&
    password.length >= 6 &&
    password === confirmPassword;

  const sendResetCode = useCallback(async () => {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setError("");
    setNotice("");
    setSendingCode(true);
    try {
      await customerAuthApi.forgotPassword(email.trim());
      setNotice("We have sent a 6-digit code to your email. It expires in 10 minutes.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a reset code.");
    } finally {
      setSendingCode(false);
    }
  }, [email]);

  // A reset link arrives with the email already filled in, so send the code
  // straight away rather than making the customer ask for it.
  const autoSentRef = useRef(false);
  const shouldAutoSend =
    searchParams.get("reset") === "1" && !!(searchParams.get("email") ?? "").trim() && !hasToken;

  useEffect(() => {
    if (autoSentRef.current || !shouldAutoSend) return;
    autoSentRef.current = true;
    sendResetCode();
  }, [shouldAutoSend, sendResetCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      if (hasToken) {
        const tokens = await customerAuthApi.setPasswordWithToken(
          email.trim(),
          token,
          password
        );
        await startSession(tokens);
        router.push("/account");
        return;
      }

      await customerAuthApi.resetPassword(email.trim(), code, password);
      router.push(
        `/account/login?success=${encodeURIComponent(
          "Password updated. Sign in with your new password."
        )}&email=${encodeURIComponent(email.trim())}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set your password.");
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={hasToken ? "Create your account" : "New password"}
      subtitle={
        hasToken
          ? "Choose a password and your Swift Food account is yours — we will sign you in straight away."
          : "Enter the 6-digit code we emailed you, then choose a new password."
      }
      footer={
        <>
          Already have a password? <AuthLink href="/account/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <AuthAlert tone="error" message={error} />}
        {notice && <AuthAlert tone="success" message={notice} />}

        <AuthField
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          readOnly={hasToken}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className={hasToken ? "text-gray-400" : ""}
        />

        {!hasToken && (
          <AuthField
            label="6-digit code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            error={codeBad ? "Must be exactly 6 digits." : undefined}
            className="tracking-[0.5em] font-mono text-lg"
            action={
              <button
                type="button"
                onClick={sendResetCode}
                disabled={sendingCode}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-black disabled:text-gray-300 transition-colors"
              >
                {sendingCode ? "Sending…" : "Send code"}
              </button>
            }
          />
        )}

        <AuthField
          label="New Password"
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
          label={hasToken ? "Create Account" : "Update Password"}
          pendingLabel="Saving…"
          pending={submitting}
          disabled={!canSubmit}
        />
      </form>
    </AuthCard>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<AuthCard title="Set password"><div className="h-96" /></AuthCard>}>
      <SetPasswordForm />
    </Suspense>
  );
}
