"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Building2, Loader } from "lucide-react";
import { useCoworkingAuth } from "@/lib/hooks/useCoworkingAuth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useCoworkingAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const successMessage = searchParams.get("success");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/partners/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/partners/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <Building2 size={32} className="text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Partner Portal</h1>
        <p className="text-gray-500 mt-1 text-sm">Sign in to manage your space</p>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
          <CheckCircle size={16} className="mr-2 flex-shrink-0" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader size={16} className="mr-2 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        <a
          href="/partners/set-password"
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Forgot password?
        </a>
      </p>
    </div>
  );
}

export default function CoworkingLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="w-full max-w-md h-96 bg-white rounded-xl border border-gray-200 animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
