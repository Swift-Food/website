'use client';

import { CateringProvider, useCatering } from '@/context/CateringContext';
import Step1EventDetails from '../components/catering/Step1EventDetails';
import Step2MenuItems from '@/app/components/catering/Step2MenuItems';
import Step3ContactInfo from '@/app/components/catering/Step3ContactDetails';

function CateringSteps() {
  const { currentStep } = useCatering();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 gap-24">
            <span className={`text-sm ${currentStep >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              Event Details
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              Menu Items
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
              Contact Info
            </span>
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