"use client";

import React, { useState } from "react";
import StepperButtonGroup from "../components/buttons/StepperButtonGroup";
import { DayPicker} from "react-day-picker";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { cn } from "../utils/helpers";

type TCateringForm = {
  deliveryDate: Date;
  capacity: string;
  eventType: string;
  dietaryRequirement: string;
  market: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactUs: string;
};

const stepperConfig = [
  {
    id: 1,
    step: "1",
    title: "Delivery Date",
  },
  {
    id: 2,
    step: "2",
    title: "Capacity",
  },
  {
    id: 3,
    step: "3",
    title: "Event",
  },
  {
    id: 4,
    step: "4",
    title: "Restaurant",
  },
  {
    id: 5,
    step: "5",
    title: "Contact Info",
  },
  {
    id: 6,
    step: "6",
    title: "Special Requests",
  },
];

const capacityOptions = [
  { value: "", label: "Select capacity" },
  { value: "10-20", label: "10-20 people" },
  { value: "21-50", label: "21-50 people" },
  { value: "51-100", label: "51-100 people" },
  { value: "101-200", label: "101-200 people" },
  { value: "200+", label: "200+ people" },
];

export default function CateringForm() {
  const [activeSteps, setActiveSteps] = useState<number[]>([1]);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const {
    register,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors },
  } = useForm<TCateringForm>({
    defaultValues: {
      deliveryDate: undefined,
      capacity: "",
      eventType: "",
      dietaryRequirement: "",
      market: "",
      contactEmail: "",
      contactName: "",
      contactPhone: "",
      contactUs: "",
    },
  });
  const eventType = watch("eventType");
  const dietaryRequirement = watch("dietaryRequirement");
  const capacity = watch("capacity");
  const date = watch("deliveryDate");

  async function handleNextClick() {
    let fields: (keyof TCateringForm)[] = [];
    if (currentStep === 1) fields = ["deliveryDate"];
    else if (currentStep === 2) fields = ["capacity"];
    else if (currentStep === 3) fields = ["eventType", "dietaryRequirement"];
    else if (currentStep === 4) fields = ["market"];
    else if (currentStep === 5)
      fields = ["contactName", "contactEmail", "contactPhone"];
    else if (currentStep === 6) fields = ["contactUs"];
    const isValid = await trigger(fields);
    if (!isValid) {
      return;
    }
    setActiveSteps((prevStep) => [
      ...prevStep,
      prevStep[prevStep.length - 1] + 1,
    ]);
    setCurrentStep((prevStep) => prevStep + 1);
  }

  function handleBackPress(): void {
    setActiveSteps((prevSteps) => {
      const result = prevSteps.slice(0, prevSteps.length - 1);
      return result;
    });
    setCurrentStep((prevStep) => prevStep - 1);
  }

  function handleEventTypeClick(item: string): void {
    if (eventType === item) setValue("eventType", "");
    else setValue("eventType", item);
  }
  function handleDietClick(item: string): void {
    if (dietaryRequirement === item) setValue("dietaryRequirement", "");
    else setValue("dietaryRequirement", item);
  }
  console.log(errors);
  return (
    <div className="flex flex-col justify-between items-center">
      <StepperButtonGroup steps={stepperConfig} activeItemIds={activeSteps} />
      <div className="bg-base-100 min-w-96 shadow-sm mt-8 rounded-xl max-w-[600px]">
        <div className="flex flex-col justify-center items-center gap-2 p-6">
          {Object.keys(errors).length > 0 && (
            <div role="alert" className="alert alert-error">
              <span>{errors[Object.keys(errors)[0] as keyof typeof errors]?.message as string}</span>
            </div>
          )}
          {currentStep === 1 && (
            <>
              <h2 className="text-xl font-bold">
                When do you want the delivery
              </h2>
              <h6 className="text-sm font-semibold">Delivery Date</h6>
              <label className="text-xs text-gray-400">
                Up to 7 days in advance
              </label>

              <div className="m-4">
                <button
                  popoverTarget="rdp-popover"
                  className="input input-border btn-sm"
                  style={{ anchorName: "--rdp" } as React.CSSProperties}
                >
                  {date ? date.toLocaleDateString() : "Pick a date"}
                </button>
                <div
                  popover="auto"
                  id="rdp-popover"
                  className="dropdown"
                  style={{ positionAnchor: "--rdp" } as React.CSSProperties}
                >
                  <Controller
                    name="deliveryDate"
                    control={control}
                    rules={{
                      required: "Delivery Date is required",
                    }}
                    render={({ field }) => (
                      <DayPicker
                        className="react-day-picker"
                        mode="single"
                        selected={field.value}
                        onSelect={(selectedDate) => {
                          if (selectedDate) field.onChange(selectedDate);
                        }}
                        hidden={{
                          before: dayjs().toDate(),
                          after: dayjs().add(7, "day").toDate(),
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </>
          )}
          {currentStep === 2 && (
            <>
              <h2 className="text-xl font-bold">
                How many guests do you have ?
              </h2>
              <h6 className="text-sm font-semibold">Capacity</h6>
              <label className="text-xs text-gray-400">Approx</label>
              <Controller
                name="capacity"
                control={control}
                rules={{
                  required: "Please Select Capacity",
                }}
                render={({ field }) => (
                  <select
                    id="capacity"
                    value={capacity}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors text-base bg-white"
                    required
                  >
                    {capacityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </>
          )}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4 w-full items-center">
              <h4 className="text-sm font-bold">
                What type of event are you planning？
              </h4>
              <Controller
                name="eventType"
                control={control}
                rules={{
                  validate: (value) =>
                    value !== "" || "Select one event type to proceed",
                }}
                render={() => (
                  <div className="flex gap-3 flex-wrap justify-center">
                    {[
                      "Birthday Party",
                      "Anniversary",
                      "Family Party",
                      `Children’s
                Party`,
                      "Festival",
                      "Charity Event",
                    ].map((item) => (
                      <button
                         key={item}
                        className={cn(
                          "btn btn-sm btn-primary rounded-full",
                          eventType === item ? "" : "btn-outline"
                        )}
                        onClick={() => handleEventTypeClick(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              />
              <h4 className="text-sm font-bold">
                Do your guests with any of the following dietary requirement?
              </h4>
              <Controller
                control={control}
                name="dietaryRequirement"
                render={() => (
                  <div className="flex gap-3 flex-wrap justify-center">
                    {[
                      "None",
                      "Vegan",
                      "Halal",
                      `Family Party`,
                      "Children’s Party",
                      "Kosher",
                      "Nut Allergy",
                    ].map((item) => (
                      <button
                        key={item}
                        className={cn(
                          "btn btn-sm btn-primary rounded-full",
                          dietaryRequirement === item ? "" : "btn-outline"
                        )}
                        onClick={() => handleDietClick(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          )}
          {currentStep === 4 && (
            <>
              <h4 className="text-sm font-bold">Choose Market</h4>
              <Controller
                control={control}
                name="market"
                render={({ field }) => (
                  <select
                    defaultValue={field.value}
                    className="select border-2 border-primary"
                    onChange={field.onChange}
                  >
                    <option>Tottenham Court Road</option>
                    <option>Goodge Street</option>
                  </select>
                )}
              />
            </>
          )}
          {currentStep === 5 && (
            <>
              <h4 className="text-sm font-bold">Contact Information</h4>
              <div className="w-full">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  className="input"
                  {...register("contactName", {
                    required: "Name is required",
                  })}
                />
              </div>
              <div className="w-full">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="input"
                  {...register("contactEmail", {
                    required: "Email is required",
                  })}
                />
              </div>
              <div className="w-full">
                <label>Phone Number</label>
                <input
                  type="number"
                  placeholder="Enter Phone"
                  className="input"
                  {...register("contactPhone", {
                    required: "Phone is required",
                  })}
                />
              </div>
            </>
          )}
          {currentStep === 6 && (
            <>
              <h4 className="text-sm font-bold">Contact Us</h4>
              <textarea
                rows={10}
                className="ring-1 rounded-md w-full ring-primary"
                {...register("contactUs")}
              ></textarea>
            </>
          )}

          <div className="flex gap-4">
            {activeSteps.length !== 1 && (
              <button
                className="btn btn-sm btn-primary btn-outline w-28 rounded-full"
                onClick={handleBackPress}
              >
                Back
              </button>
            )}
            {currentStep === stepperConfig.length ? (
              <button
                className="btn btn-sm btn-primary w-28 rounded-full"
                onClick={handleNextClick}
              >
                Submit
              </button>
            ) : (
              <button
                className="btn btn-sm btn-primary w-28 rounded-full"
                onClick={handleNextClick}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
