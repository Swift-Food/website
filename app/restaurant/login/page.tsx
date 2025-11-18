// app/restaurant/login/page.tsx
"use client";

import { LoginPage } from "./LoginPage";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RestaurantLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = localStorage.getItem('redirect_after_login') || '/restaurant/dashboard';
      localStorage.removeItem('redirect_after_login');
      router.push(redirectPath);
    }
  }, [isAuthenticated, router]);

  return <LoginPage onLogin={login} />;
}