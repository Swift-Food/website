"use client";

import { CateringProvider } from "@/context/CateringContext";
import { CateringFilterProvider } from "@/context/CateringFilterContext";
import Step2MenuItemsNew from "@/lib/components/catering/Step2MenuItemsNew";

export default function CateringPageNew() {
  return (
    <CateringProvider>
      <CateringFilterProvider>
        <Step2MenuItemsNew />
      </CateringFilterProvider>
    </CateringProvider>
  );
}
