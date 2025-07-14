"use client";

import React, { useRef, useState } from "react";
import StepperButtonGroup from "../components/buttons/StepperButtonGroup";
import { DayPicker, Modifiers } from "react-day-picker";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { cn } from "../utils/helpers";

type TCateringForm = {
  deliveryDate: Date;
  capacity: number;
  eventType: string;
  dietaryRequirement: string;
  market: string;
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
    title: "Contact Us",
  },
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
      capacity: 0,
      eventType: "",
      dietaryRequirement: "",
      market: "",
      contactUs: "",
    },
  });
  const eventType = watch("eventType");
  const dietaryRequirement = watch("dietaryRequirement");
  const capacity = watch("capacity");
  const date = watch("deliveryDate");

  async function handleNextClick(event: React.MouseEvent<HTMLButtonElement>) {
    let fields: (keyof TCateringForm)[] = [];
    if (currentStep === 1) fields = ["deliveryDate"];
    else if (currentStep === 2) fields = ["capacity"];
    else if (currentStep === 3) fields = ["eventType", "dietaryRequirement"];
    else if (currentStep === 4) fields = ["market"];
    else if (currentStep === 5) fields = ["contactUs"];
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

  function handleBackPress(event: React.MouseEvent<HTMLButtonElement>): void {
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

  return (
    <div className="flex flex-col justify-between items-center">
      <StepperButtonGroup steps={stepperConfig} activeItemIds={activeSteps} />
      <div className="bg-base-100 min-w-96 shadow-sm mt-8 rounded-xl max-w-[600px]">
        <div className="flex flex-col justify-center items-center gap-2 p-6">
          {Object.keys(errors).length > 0 && (
            <div role="alert" className="alert alert-error">
              <span>{errors[Object.keys(errors)[0]].message}</span>
            </div>
          )}
          {currentStep === 1 && (
            <>
              <h2 className="text-xl font-bold">
                What do you want for delivery
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
                  validate: (value) =>
                    value > 0 || "Capacity must be greater than 0",
                }}
                render={({ field }) => (
                  <div className="flex gap-4 items-center py-4">
                    <button
                      className="btn btn-square rounded-full btn-primary btn-sm"
                      onClick={() =>
                        field.onChange(
                          field.value > 0 ? field.value - 1 : field.value
                        )
                      }
                    >
                      -
                    </button>
                    <label className="">{field.value}</label>
                    <button
                      className="btn btn-square rounded-full btn-primary btn-sm"
                      onClick={() => field.onChange(field.value + 1)}
                    >
                      +
                    </button>
                  </div>
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
                      "Fesitival",
                      "Charity Event",
                    ].map((item) => (
                      <button
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
            <button
              className="btn btn-sm btn-primary w-28 rounded-full"
              onClick={handleNextClick}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
