'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import InfoContainer from './containers/InfoContainer';
import { mailService } from '../service/mail';

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
  className?: string;
}

const MultiStepDriverForm: React.FC<MultiStepFormProps> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await mailService.sendFormResponse(formData);
      console.log('Email sent successfully:', result);
      
      // Show success page
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Error sending form:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setCurrentStep(1);
    setError(null);
    setFormData({
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
  };

  const renderSuccessPage = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">Application Submitted! 🚗</h2>
        <p className="text-gray-600 text-lg">
          Thank you for applying to become a SwiftFood driver
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Our team will review your application within 3-5 business days
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            We'll verify your documents and run background checks
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            You'll receive an email at <strong>{formData.personalInfo.email}</strong> with updates
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Once approved, we'll send you onboarding details and driver kit
          </li>
        </ul>
      </div>
      
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          Questions? Contact us at <span className="text-primary font-medium">no-reply@swiftfood.uk</span>
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetForm}
            className="btn btn-outline btn-sm rounded-full px-6"
          >
            Submit Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="btn btn-primary btn-sm rounded-full px-6 text-white"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );

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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
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
      <section className="flex w-full h-full gap-4 max-lg:flex-col">
        <section className="flex-4 relative aspect-video rounded-xl overflow-hidden">
          <Image
            fill
            src="/store.jpg"
            className="object-cover w-full h-auto"
            alt="swift food store"
          />
        </section>
        
        <aside className="flex-1 flex flex-col gap-4">
          <InfoContainer heading={isSuccess ? "Application Complete" : "Driver Registration"} className="relative flex-1">
            <div className="p-6 h-full overflow-y-auto bg-transparent">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {isSuccess ? (
                renderSuccessPage()
              ) : (
                <>
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
                        disabled={isSubmitting}
                        className="btn btn-primary btn-sm rounded-full px-6 text-white disabled:bg-gray-400"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </InfoContainer>
        </aside>
      </section>
    </div>
  );
};

export default MultiStepDriverForm;