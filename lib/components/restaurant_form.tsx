"use client";

import React, {useState } from "react";
import Image from "next/image";
import InfoContainer from "./containers/InfoContainer";
import { mailService } from '@/services/utilities/mail.service';
import {
  Control,
  Controller,
  FieldErrors,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import { TRestaurantForm } from "../types/restaurant";

// steps
type RestaurantBasicDetailsFormProps = {
  register: UseFormRegister<TRestaurantForm>;
  errors: FieldErrors<TRestaurantForm>;
};
const resturantBasicFormConfig = [
  {
    label: "Restaurant Name",
    required: true,
    type: "text",
    key: "restaurantName",
    placeholder: "Enter restaurant name",
  },
  {
    label: "Username",
    required: true,
    type: "text",
    key: "ownerName",
    placeholder: "Enter owner/manager name",
  },
  {
    label: "Business Email",
    required: true,
    type: "email",
    key: "businessEmail",
    placeholder: "Enter business email",
  },
  {
    label: "Business Phone",
    required: true,
    type: "tel",
    key: "businessPhone",
    placeholder: "Enter phone number",
  },
];
function RestaurantBasicDetailsForm({
  register,
}: RestaurantBasicDetailsFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">
        Basic Business Info
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resturantBasicFormConfig.map((field, index) => (
          <div key={index} className="grid grid-rows-[40px_auto] gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-end">
              {field.label} {field.required && "*"}
            </label>
            <input
              type={field.type}
              {...register(field.key as keyof TRestaurantForm, {
                required: field.required
                  ? `Field ${field.label} is required`
                  : false,
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type RestaurantLocationDetailsFormProps = {
  register: UseFormRegister<TRestaurantForm>;
  control: Control<TRestaurantForm, any, TRestaurantForm>;
  errors: FieldErrors<TRestaurantForm>;
};
function ResturantLocationDetailsForm({
  register,
  control,
}: RestaurantLocationDetailsFormProps) {
  return (
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
            {...register("streetAddress", {
              required: "Street Address is required",
            })}
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
            {...register("city", { required: "City is required" })}
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
            {...register("postalCode", { required: "Postal Code is required" })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter postal code"
          />
        </div>

        <div className="grid grid-rows-[40px_auto] gap-1">
          <label className="text-sm font-medium text-gray-700 flex items-end">
            Market *
          </label>
          <Controller
            control={control}
            name="market"
            rules={{
              required: "Select one market",
            }}
            render={({ field }) => (
              <select
                value={field.value}
                onChange={field.onChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
              >
                <option value="">Select market</option>
                <option value="goodge">Goodge Street Market</option>
                <option value="tcr">Tottenham Court Road Market</option>
              </select>
            )}
          />
        </div>
      </div>
    </div>
  );
}

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
type RestaurantProfileProps = {
  register: UseFormRegister<TRestaurantForm>;
  control: Control<TRestaurantForm, any, TRestaurantForm>;
  errors: FieldErrors<TRestaurantForm>;
};
function RestaurantProfile({ control, register }: RestaurantProfileProps) {
  return (
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
            <Controller
              key={cuisine}
              control={control}
              name="cuisineTypes"
              rules={{
                validate: (value) =>
                  value.length > 0 || "At Least one cuisine is required",
              }}
              render={({ field }) => (
                <label
                  key={cuisine}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={field.value.includes(cuisine)}
                    onChange={() => {
                      if (field.value.includes(cuisine)) {
                        const updatedCuisine = field.value.filter(
                          (item) => item !== cuisine
                        );
                        field.onChange(updatedCuisine);
                      } else {
                        const updatedCuisine = [...field.value, cuisine];
                        field.onChange(updatedCuisine);
                      }
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm">{cuisine}</span>
                </label>
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Types *
        </label>
        <div className="flex flex-wrap gap-4">
          {serviceOptions.map((service) => (
            <Controller
              key={service}
              control={control}
              name="serviceTypes"
              rules={{
                validate: (value) =>
                  value.length > 0 || "At Least one service is required",
              }}
              render={({ field }) => (
                <label
                  key={service}
                  className="flex items-center space-x-2 cursor-pointer text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={field.value.includes(service)}
                    onChange={() => {
                      if (field.value.includes(service)) {
                        const updatedCuisine = field.value.filter(
                          (item) => item !== service
                        );
                        field.onChange(updatedCuisine);
                      } else {
                        const updatedCuisine = [...field.value, service];
                        field.onChange(updatedCuisine);
                      }
                    }}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium">{service}</span>
                </label>
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restaurant Description *
        </label>
        <textarea
          rows={4}
          {...register("restaurantDescription", {
            required: "Description is required",
          })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
          placeholder="Describe your restaurant, specialties, ambiance, etc."
        />
      </div>
    </div>
  );
}

// Types for form data
// interface BasicBusinessInfo {
//   restaurantName: string;
//   ownerName: string;
//   businessEmail: string;
//   businessPhone: string;
// }

// interface LocationInfo {
//   streetAddress: string;
//   city: string;
//   postalCode: string;
//   market: string;
// }

interface RestaurantProfile {
  cuisineTypes: string[];
  serviceTypes: string[];
  description: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  daysOpen: string[];
}

// interface FormData {
//   basicInfo: BasicBusinessInfo;
//   location: LocationInfo;
//   profile: RestaurantProfile;
// }

interface MultiStepFormProps {
  onSubmit?: (data: TRestaurantForm) => void;
  className?: string;
}

const MultiStepRestaurantForm: React.FC<MultiStepFormProps> = ({
  onSubmit,
  className = "",
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    watch,
    control,
    formState: { errors },
    reset,
    trigger,
    getValues,
  } = useForm<TRestaurantForm>({
    defaultValues: {
      restaurantName: "",
      ownerName: "",
      businessEmail: "",
      businessPhone: "",

      streetAddress: "",
      city: "",
      postalCode: "",
      market: "",

      cuisineTypes: [],
      serviceTypes: [],
      restaurantDescription: "",
    },
  });
  const businessEmail = watch("businessEmail");

  async function handleNextStep(

  ) {
    let fieldsToBeValidated: (keyof TRestaurantForm)[] = [];
    if (currentStep === 1)
      fieldsToBeValidated = [
        "restaurantName",
        "ownerName",
        "businessEmail",
        "businessPhone",
      ];
    else if (currentStep === 2)
      fieldsToBeValidated = ["streetAddress", "city", "postalCode", "market"];
    else if (currentStep === 3)
      fieldsToBeValidated = [
        "cuisineTypes",
        "serviceTypes",
        "restaurantDescription",
      ];

    const isValid = await trigger(fieldsToBeValidated);
    if (!isValid) {
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else handleSubmit();
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const values = getValues();
      // Send email via mail service

      await mailService.sendFormResponse({
        ...values,
        cuisineTypes: values.cuisineTypes.join(","),
        serviceTypes: values.serviceTypes.join(","),
      });

      // Call original onSubmit if provided
      if (onSubmit) {
        onSubmit(values);
      }

      // Show success page
      setIsSuccess(true);
    } catch (error) {
      console.error("Error sending form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setCurrentStep(1);
    reset();
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
            We'll contact you at <strong>{businessEmail}</strong> with next
            steps
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
            Home
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
  console.log(errors);
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
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {
                    errors[Object.keys(errors)[0] as keyof TRestaurantForm]
                      ?.message
                  }
                </div>
              )}

              {isSuccess ? (
                renderSuccessPage()
              ) : (
                <>
                  {renderStepIndicator()}

                  <div className="min-h-[400px]">
                    {currentStep === 1 && (
                      <RestaurantBasicDetailsForm
                        register={register}
                        errors={errors}
                      />
                    )}
                    {currentStep === 2 && (
                      <ResturantLocationDetailsForm
                        register={register}
                        control={control}
                        errors={errors}
                      />
                    )}
                    {currentStep === 3 && (
                      <RestaurantProfile
                        register={register}
                        control={control}
                        errors={errors}
                      />
                    )}
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
                        onClick={handleNextStep}
                        className="btn btn-primary btn-sm rounded-full px-6 text-white"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleNextStep}
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
