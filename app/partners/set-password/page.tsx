"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Building2, Loader } from "lucide-react";
import { coworkingApi } from "@/services/api/coworking.api";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");

  // Inline validation errors
  const codeBad = code.length > 0 && !/^\d{6}$/.test(code);
  const passwordShort = password.length > 0 && password.length < 6;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    email.trim() &&
    /^\d{6}$/.test(code) &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      await coworkingApi.resetPassword(email.trim(), code, password);
      router.push("/partners/login?success=Password+set+successfully");
    } catch (err: any) {
      setError(err.message || "Failed to set password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setResendSuccess("");
    setError("");
    setResending(true);
    try {
      await coworkingApi.forgotPassword(email.trim());
      setResendSuccess("A new code has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Building2 size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set your password</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Enter the 6-digit code from your email and choose a new password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <CheckCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{resendSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              placeholder="admin@yourspace.com"
            />
          </div>

          {/* Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                6-digit code
              </label>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs text-indigo-600 hover:text-indigo-800 disabled:text-indigo-300 font-medium transition-colors flex items-center gap-1"
              >
                {resending && <Loader size={11} className="animate-spin" />}
                {resending ? "Sending…" : "Resend code"}
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 tracking-widest text-center text-lg font-mono ${
                codeBad ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
              placeholder="000000"
            />
            {codeBad && (
              <p className="mt-1 text-xs text-red-600">Must be exactly 6 digits.</p>
            )}
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 ${
                passwordShort ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            {passwordShort && (
              <p className="mt-1 text-xs text-red-600">Minimum 6 characters.</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 ${
                passwordMismatch ? "border-red-400 bg-red-50" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            {passwordMismatch && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {submitting ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Setting password…
              </>
            ) : (
              "Set Password"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have a password?{" "}
          <a href="/partners/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
