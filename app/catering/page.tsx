"use client";

import { CateringProvider, useCatering } from "@/context/CateringContext";
import Step1EventDetails from "../components/catering/Step1EventDetails";
import Step2MenuItems from "@/app/components/catering/Step2MenuItems";
import Step3ContactInfo from "@/app/components/catering/Step3ContactDetails";

function CateringSteps() {
  const { currentStep, setCurrentStep } = useCatering();

  const steps = [
    { label: "Event Details", step: 1 },
    { label: "Menu Selection", step: 2 },
    { label: "Contact & Confirmation", step: 3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w mx-auto">
        {/* Progress Indicator (Linear Bar Design) */}
        <div className="mb-10 mr-10 ml-10 max-w mx-auto">
          <div className="text-sm text-gray-500 mb-2">
            Step {currentStep} of 3
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-dark-pink rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 font-medium flex items-center gap-2">
            {steps.map((s, idx) => (
              <div key={s.step} className="flex items-center gap-2">
                <button
                  type="button"
                  className={`underline-offset-2 font-medium transition-colors ${
                    currentStep === s.step
                      ? "text-dark-pink cursor-default"
                      : "text-gray-600 hover:text-dark-pink hover:underline cursor-pointer"
                  }`}
                  onClick={() => setCurrentStep(s.step)}
                >
                  {s.label}
                </button>
                {idx < steps.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Back button (visible when not on first step) */}
        {/* {currentStep > 1 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className="inline-flex items-center gap-2 px-4 py-2 bg-base-200 hover:bg-base-300 text-base-content rounded-lg font-semibold"
            >
              ← Back
            </button>
          </div>
        )} */}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm sm:p-8 max-w-none">
          {currentStep === 1 && <Step1EventDetails />}
          {currentStep === 2 && <Step2MenuItems />}
          {currentStep === 3 && <Step3ContactInfo />}
        </div>
      </div>
    </div>
  );
}

export default function CateringPage() {
  return (
    <CateringProvider>
      <CateringSteps />
    </CateringProvider>
  );
}
