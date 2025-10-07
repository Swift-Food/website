'use client';

import { CateringProvider, useCatering } from '@/context/CateringContext';
import Step1EventDetails from '../components/catering/Step1EventDetails';
import Step2MenuItems from '@/app/components/catering/Step2MenuItems';
import Step3ContactInfo from '@/app/components/catering/Step3ContactDetails';

function CateringSteps() {
  const { currentStep } = useCatering();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w mx-auto">

        {/* Progress Indicator (Linear Bar Design) */}
        <div className="mb-10 mr-10 ml-10 max-w mx-auto">
          <div className="text-sm text-gray-500 mb-2">Step {currentStep} of 3</div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-dark-pink rounded-full transition-all duration-500" 
              // Calculate the width: (currentStep / totalSteps) * 100
              // I'm using 'currentStep' from the context, which would be 1 here for Step1EventDetails.
              style={{ width: `${(currentStep / 3) * 100}%` }} 
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 font-medium">
            <span className="text-dark-pink">Event Details</span> {'->'} Menu Selection {'->'} Contact & Confirmation
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-none">
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