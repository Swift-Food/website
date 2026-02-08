"use client";

import { CateringProvider } from "@/context/CateringContext";
import { CateringFilterProvider } from "@/context/CateringFilterContext";
import Menu from "@/lib/components/catering/Menu";

export default function MenuClient() {
  return (
    <CateringProvider>
      <CateringFilterProvider>
        <Menu />
      </CateringFilterProvider>
    </CateringProvider>
  );
}
