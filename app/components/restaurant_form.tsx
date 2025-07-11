"use client";

import React, { useState } from "react";
import Image from "next/image";
import InfoContainer from "./containers/InfoContainer";
import { mailService } from "../service/mail";

// Types for form data
interface BasicBusinessInfo {
  restaurantName: string;
  ownerName: string;
  businessEmail: string;
  businessPhone: string;
}

interface LocationInfo {
  streetAddress: string;
  city: string;
  postalCode: string;
  market: string;
}

interface RestaurantProfile {
  cuisineTypes: string[];
  serviceTypes: string[];
  description: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  daysOpen: string[];
}

interface FormData {
  basicInfo: BasicBusinessInfo;
  location: LocationInfo;
  profile: RestaurantProfile;
}

interface MultiStepFormProps {
  onSubmit?: (data: FormData) => void;
  className?: string;
}

const MultiStepRestaurantForm: React.FC<MultiStepFormProps> = ({
  onSubmit,
  className = "",
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    basicInfo: {
      restaurantName: "",
      ownerName: "",
      businessEmail: "",
      businessPhone: "",
    },
    location: {
      streetAddress: "",
      city: "",
      postalCode: "",
      market: "",
    },
    profile: {
      cuisineTypes: [],
      serviceTypes: [],
      description: "",
      openingHours: {
        monday: { open: "09:00", close: "22:00", closed: false },
        tuesday: { open: "09:00", close: "22:00", closed: false },
        wednesday: { open: "09:00", close: "22:00", closed: false },
        thursday: { open: "09:00", close: "22:00", closed: false },
        friday: { open: "09:00", close: "22:00", closed: false },
        saturday: { open: "09:00", close: "22:00", closed: false },
        sunday: { open: "09:00", close: "22:00", closed: true },
      },
      daysOpen: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
    },
  });

  const cuisineOptions = [
    "Indian",
    "Chinese",
    "Italian",
    "Mexican",
    "Thai",
    "Japanese",
    "French",
    "Korean",
    "Greek",
    "Vegan",
    "Vegetarian",
  ];

  const serviceOptions = ["Delivery", "Takeaway"];

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
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
      // Send email via mail service
      console.log("sending form", formData);
      await mailService.sendFormResponse(formData);

      // Call original onSubmit if provided
      if (onSubmit) {
        onSubmit(formData);
      }

      // Show success page
      setIsSuccess(true);
    } catch (error) {
      console.error("Error sending form:", error);
      setError("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setCurrentStep(1);
    setError(null);
    setFormData({
      basicInfo: {
        restaurantName: "",
        ownerName: "",
        businessEmail: "",
        businessPhone: "",
      },
      location: {
        streetAddress: "",
        city: "",
        postalCode: "",
        market: "",
      },
      profile: {
        cuisineTypes: [],
        serviceTypes: [],
        description: "",
        openingHours: {
          monday: { open: "09:00", close: "22:00", closed: false },
          tuesday: { open: "09:00", close: "22:00", closed: false },
          wednesday: { open: "09:00", close: "22:00", closed: false },
          thursday: { open: "09:00", close: "22:00", closed: false },
          friday: { open: "09:00", close: "22:00", closed: false },
          saturday: { open: "09:00", close: "22:00", closed: false },
          sunday: { open: "09:00", close: "22:00", closed: true },
        },
        daysOpen: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
      },
    });
  };

  const renderSuccessPage = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg
          className="w-10 h-10 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">
          Registration Submitted!
        </h2>
        <p className="text-gray-600 text-lg">
          Thank you for your interest in joining SwiftFood
        </p>
      </div>

      <div className="rounded-lg p-6 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Our team will review your application within 2-3 business days
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            We'll contact you at{" "}
            <strong>{formData.basicInfo.businessEmail}</strong> with next steps
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Our onboarding specialist will schedule a call to discuss your setup
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          Questions? Contact us at{" "}
          <span className="text-primary font-medium">
            no-reply@swiftfood.uk
          </span>
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetForm}
            className="btn btn-outline btn-sm rounded-full px-6"
          >
            Submit Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="btn btn-primary btn-sm rounded-full px-6 text-white"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              currentStep >= step
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 ${
                currentStep > step ? "bg-primary" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">
        Basic Business Info
      </h2>
   
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Restaurant Name *", type: "text", key: "restaurantName", placeholder: "Enter restaurant name" },
          { label: "Username *", type: "text", key: "ownerName", placeholder: "Enter owner/manager name" },
          { label: "Business Email *", type: "email", key: "businessEmail", placeholder: "Enter business email" },
          { label: "Business Phone *", type: "tel", key: "businessPhone", placeholder: "Enter phone number" }
        ].map((field, index) => (
          <div key={index} className="grid grid-rows-[40px_auto] gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-end">
              {field.label}
            </label>
            <input
              type={field.type}
              required
              value={formData.basicInfo[field.key as keyof BasicBusinessInfo]}
              onChange={(e) =>
                updateFormData("basicInfo", { [field.key]: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
   );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">
        Location & Address
      </h2>
   
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 grid grid-rows-[40px_auto] gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-end">
            Street Address *
          </label>
          <input
            type="text"
            required
            value={formData.location.streetAddress}
            onChange={(e) =>
              updateFormData("location", { streetAddress: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter street address"
          />
        </div>
   
        <div className="grid grid-rows-[40px_auto] gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-end">
            City *
          </label>
          <input
            type="text"
            required
            value={formData.location.city}
            onChange={(e) =>
              updateFormData("location", { city: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter city"
          />
        </div>
   
        <div className="grid grid-rows-[40px_auto] gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-end">
            Postal Code *
          </label>
          <input
            type="text"
            required
            value={formData.location.postalCode}
            onChange={(e) =>
              updateFormData("location", { postalCode: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter postal code"
          />
        </div>
   
        <div className="grid grid-rows-[40px_auto] gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-end">
            Market *
          </label>
          <select
            required
            value={formData.location.market}
            onChange={(e) =>
              updateFormData("location", { market: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
          >
            <option value="">Select market</option>
            <option value="goodge">Goodge Street Market</option>
            <option value="tcr">Tottenham Court Road Market</option>
          </select>
        </div>
      </div>
    </div>
   );
   
   const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">
        Restaurant Profile
      </h2>
   
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cuisine Types *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700">
          {cuisineOptions.map((cuisine) => (
            <label
              key={cuisine}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.profile.cuisineTypes.includes(cuisine)}
                onChange={(e) => {
                  const updatedCuisines = e.target.checked
                    ? [...formData.profile.cuisineTypes, cuisine]
                    : formData.profile.cuisineTypes.filter(
                        (c) => c !== cuisine
                      );
                  updateFormData("profile", { cuisineTypes: updatedCuisines });
                }}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm">{cuisine}</span>
            </label>
          ))}
        </div>
      </div>
   
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Types *
        </label>
        <div className="flex flex-wrap gap-4">
          {serviceOptions.map((service) => (
            <label
              key={service}
              className="flex items-center space-x-2 cursor-pointer text-gray-700"
            >
              <input
                type="checkbox"
                checked={formData.profile.serviceTypes.includes(service)}
                onChange={(e) => {
                  const updatedServices = e.target.checked
                    ? [...formData.profile.serviceTypes, service]
                    : formData.profile.serviceTypes.filter(
                        (s) => s !== service
                      );
                  updateFormData("profile", { serviceTypes: updatedServices });
                }}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium">{service}</span>
            </label>
          ))}
        </div>
      </div>
   
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restaurant Description *
        </label>
        <textarea
          required
          rows={4}
          value={formData.profile.description}
          onChange={(e) =>
            updateFormData("profile", { description: e.target.value })
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
          placeholder="Describe your restaurant, specialties, ambiance, etc."
        />
      </div>
    </div>
   );

  return (
    <div className={`h-full ${className}`}>
      <section className="flex w-full h-full gap-4 max-lg:flex-col">
        <section className="flex-[2] relative aspect-video rounded-xl overflow-hidden">
          <Image
            fill
            src="/store.jpg"
            className="object-cover"
            alt="swift food store"
          />
        </section>

        <aside className="flex-1 flex flex-col gap-4">
          <InfoContainer
            heading={
              isSuccess ? "Registration Complete" : "Restaurant Registration"
            }
            className="relative flex-1"
          >
            <div className="p-6 h-full overflow-y-auto">
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
                  </div>

                  <div className="flex justify-between mt-8 pt-4 border-t">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className={`btn btn-sm rounded-full px-6 ${
                        currentStep === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Previous
                    </button>

                    {currentStep < 3 ? (
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
                        {isSubmitting ? "Submitting..." : "Submit Registration"}
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

export default MultiStepRestaurantForm;