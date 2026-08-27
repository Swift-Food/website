"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthAlert } from "@/lib/components/account/AuthAlert";
import { AuthCard } from "@/lib/components/account/AuthCard";
import { AuthField } from "@/lib/components/account/AuthField";
import { AuthLink } from "@/lib/components/account/AuthLink";
import { AuthSubmitButton } from "@/lib/components/account/AuthSubmitButton";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";
import { isNeedsVerification } from "@/types/api/customer-auth.api.types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const success = searchParams.get("success") ?? "";

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.replace("/account");
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (isNeedsVerification(result)) {
        // No consumer resend route we can call with just an email — a password
        // reset is the supported way to verify and claim the account.
        router.push(
          `/account/set-password?reset=1&email=${encodeURIComponent(email.trim())}`
        );
        return;
      }
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Your catering orders, the orders shared with you, and your reward codes."
      footer={
        <>
          Ordered with us before but never set a password?{" "}
          <AuthLink href="/account/claim">Claim your account</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {success && <AuthAlert tone="success" message={success} />}
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
    </AuthCard>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<AuthCard title="Sign in"><div className="h-64" /></AuthCard>}>
      <LoginForm />
    </Suspense>
  );
}
