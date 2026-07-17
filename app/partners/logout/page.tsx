"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PARTNER_STORAGE_KEYS } from "@/lib/api-client/storage-keys";

export default function CoworkingLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem(PARTNER_STORAGE_KEYS.accessToken);
    localStorage.removeItem(PARTNER_STORAGE_KEYS.refreshToken);
    localStorage.removeItem(PARTNER_STORAGE_KEYS.user);
    router.replace("/partners/login");
  }, [router]);

  return null;
}
