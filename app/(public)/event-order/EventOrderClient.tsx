"use client";

import { CateringProvider, useCatering } from "@/context/CateringContext";
import { CateringFilterProvider } from "@/context/CateringFilterContext";
import CateringOrderBuilder from "@/lib/components/catering/CateringOrderBuilder";
import Step3ContactInfo from "@/lib/components/catering/Step3ContactDetails";

function CateringSteps() {
  const {
    currentStep,
  } = useCatering();

  return (
    <div className="min-h-screen">
      <div className="py-2 max-w mx-auto bg-base-100">
        <div className="bg-base-100 rounded-lg max-w-none">
          {currentStep === 1 && <CateringOrderBuilder />}
          {currentStep === 2 && <Step3ContactInfo />}
        </div>
      </div>
    </div>
  );
}

export default function EventOrderClient() {
  return (
    <CateringProvider>
      <CateringFilterProvider>
        <CateringSteps />
      </CateringFilterProvider>
    </CateringProvider>
  );
}
