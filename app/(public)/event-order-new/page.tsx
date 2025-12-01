"use client";

import { CateringProvider } from "@/context/CateringContext";
import { CateringFilterProvider } from "@/context/CateringFilterContext";
import CateringOrderBuilder from "@/lib/components/catering/CateringOrderBuilder";

export default function CateringPageNew() {
  return (
    <CateringProvider>
      <CateringFilterProvider>
        <CateringOrderBuilder />
      </CateringFilterProvider>
    </CateringProvider>
  );
}
