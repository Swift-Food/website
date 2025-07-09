'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import InfoContainer from './containers/InfoContainer';

// Types for form data
interface PersonalInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
}

interface VehicleInfo {
  vehicleType: string;
  vehicleBrand: string;
  registrationNumber: string;
}

interface IdentityVerification {
  idType: string;
  idNumber: string;
  backgroundCheckConsent: boolean;
}

interface PaymentDetails {
  accountHolderName: string;
  accountNumber: string;
  bankCode: string;
}

interface FormData {
  personalInfo: PersonalInfo;
  vehicleInfo: VehicleInfo;
  identityVerification: IdentityVerification;
  paymentDetails: PaymentDetails;
}

interface MultiStepFormProps {
  onSubmit: (data: FormData) => void;
  className?: string;
}

const MultiStepDriverForm: React.FC<MultiStepFormProps> = ({ onSubmit, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      fullName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: ''
    },
    vehicleInfo: {
      vehicleType: '',
      vehicleBrand: '',
      registrationNumber: ''
    },
    identityVerification: {
      idType: '',
      idNumber: '',
      backgroundCheckConsent: false
    },
    paymentDetails: {
      accountHolderName: '',
      accountNumber: '',
      bankCode: ''
    }
  });

  const vehicleTypes = ['Bike', 'Scooter', 'Car', 'Bicycle', 'On Foot'];
  const idTypes = ['Passport', 'Driver License', 'National ID', 'Voter ID'];

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              currentStep >= step
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-12 h-1 ${
                currentStep > step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">🧍 Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.personalInfo.fullName}
            onChange={(e) => updateFormData('personalInfo', { fullName: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primarym text-gray-700"
            placeholder="Enter your full name"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.personalInfo.email}
            onChange={(e) => updateFormData('personalInfo', { email: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter your email"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.personalInfo.phoneNumber}
            onChange={(e) => updateFormData('personalInfo', { phoneNumber: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Date of Birth *
          </label>
          <input
            type="date"
            required
            value={formData.personalInfo.dateOfBirth}
            onChange={(e) => updateFormData('personalInfo', { dateOfBirth: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">🚗 Vehicle Information</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Vehicle Type *
          </label>
          <select
            required
            value={formData.vehicleInfo.vehicleType}
            onChange={(e) => updateFormData('vehicleInfo', { vehicleType: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
          >
            <option value="">Select vehicle type</option>
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {formData.vehicleInfo.vehicleType && formData.vehicleInfo.vehicleType !== 'On Foot' && (
          <>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
                Vehicle Brand / Model *
              </label>
              <input
                type="text"
                required
                value={formData.vehicleInfo.vehicleBrand}
                onChange={(e) => updateFormData('vehicleInfo', { vehicleBrand: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
                placeholder="e.g., Honda Civic, Yamaha R15"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
                Vehicle Registration Number *
              </label>
              <input
                type="text"
                required
                value={formData.vehicleInfo.registrationNumber}
                onChange={(e) => updateFormData('vehicleInfo', { registrationNumber: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
                placeholder="Enter registration number"
              />
            </div>
          </>
        )}

        {formData.vehicleInfo.vehicleType === 'On Foot' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ✅ Great! No vehicle information needed for on-foot delivery.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">📸 Identity Verification</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Government ID Type *
          </label>
          <select
            required
            value={formData.identityVerification.idType}
            onChange={(e) => updateFormData('identityVerification', { idType: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select ID type</option>
            {idTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            ID Number *
          </label>
          <input
            type="text"
            required
            value={formData.identityVerification.idNumber}
            onChange={(e) => updateFormData('identityVerification', { idNumber: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter your ID number"
          />
        </div>

        <div className="flex flex-col">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.identityVerification.backgroundCheckConsent}
                onChange={(e) => updateFormData('identityVerification', { backgroundCheckConsent: e.target.checked })}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-700">
                  Background Check Consent *
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  I consent to a background check being performed to verify my identity and ensure the safety of the platform. This may include criminal history and driving record checks.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">💳 Payment Details</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Account Holder Name *
          </label>
          <input
            type="text"
            required
            value={formData.paymentDetails.accountHolderName}
            onChange={(e) => updateFormData('paymentDetails', { accountHolderName: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter account holder name"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Bank Account Number / IBAN *
          </label>
          <input
            type="text"
            required
            value={formData.paymentDetails.accountNumber}
            onChange={(e) => updateFormData('paymentDetails', { accountNumber: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter account number or IBAN"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            IFSC / SWIFT Code *
          </label>
          <input
            type="text"
            required
            value={formData.paymentDetails.bankCode}
            onChange={(e) => updateFormData('paymentDetails', { bankCode: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter IFSC or SWIFT code"
          />
        </div>

        
      </div>
    </div>
  );

  return (
    <div className={`h-full ${className}`}>
      <section className="flex w-full h-full gap-4 max-lg:flex-col ">
        <section className="flex-4 relative aspect-video rounded-xl overflow-hidden">
        <Image
            fill
            src="/store.jpg"
            className="object-cover w-full h-auto"
            alt="swift food store"
          />
        </section>
        
        <aside className="flex-1 flex flex-col gap-4">
          <InfoContainer heading="Driver Registration" className="relative flex-1">
            <div className="p-6 h-full overflow-y-auto bg-transparent">
              {renderStepIndicator()}
              
              <div className="min-h-[400px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </div>
              
              <div className="flex justify-between mt-8 pt-4 border-t">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`btn btn-sm rounded-full px-6 ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Previous
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    className="btn btn-primary btn-sm rounded-full px-6 text-white"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary btn-sm rounded-full px-6 text-white"
                  >
                    Submit Application
                  </button>
                )}
              </div>
            </div>
          </InfoContainer>
        </aside>
      </section>
    </div>
  );
};

export default MultiStepDriverForm;