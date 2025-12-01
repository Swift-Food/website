// app/restaurant/login/page.tsx
"use client";

import { LoginPage } from "./LoginPage";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Validate redirect path to prevent open redirect attacks
function isValidRedirectPath(path: string): boolean {
  // Must start with / and not contain protocol or external domains
  if (!path.startsWith('/')) return false;
  // Block protocol-relative URLs (//example.com)
  if (path.startsWith('//')) return false;
  // Block any URL with : before the first / (e.g., javascript:, http:)
  const colonIndex = path.indexOf(':');
  const slashIndex = path.indexOf('/', 1);
  if (colonIndex !== -1 && (slashIndex === -1 || colonIndex < slashIndex)) return false;
  // Only allow paths under /restaurant
  return path.startsWith('/restaurant');
}

export default function RestaurantLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const storedPath = localStorage.getItem('redirect_after_login');
      localStorage.removeItem('redirect_after_login');
      const redirectPath = storedPath && isValidRedirectPath(storedPath)
        ? storedPath
        : '/restaurant/dashboard';
      router.push(redirectPath);
    }
  }, [isAuthenticated, router]);

  return <LoginPage onLogin={login} />;
}