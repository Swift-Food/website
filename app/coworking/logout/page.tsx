"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CoworkingLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const keys = [
      "cw_access_token",
      "cw_refresh_token",
      "cw_user",
      "access_token",
      "refresh_token",
    ];
    keys.forEach((k) => localStorage.removeItem(k));
    router.replace("/coworking/login");
  }, [router]);

  return null;
}
