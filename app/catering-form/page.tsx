"use client";

import React, { useRef, useState } from "react";
import StepperButtonGroup from "../components/buttons/StepperButtonGroup";
import { DayPicker } from "react-day-picker";
import dayjs from "dayjs";

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
  const [date, setDate] = useState<Date | undefined>();

  function handleNextClick(event: React.MouseEvent<HTMLButtonElement>): void {
    setActiveSteps((prevStep) => [
      ...prevStep,
      prevStep[prevStep.length - 1] + 1,
    ]);
  }

  function handleBackPress(event: React.MouseEvent<HTMLButtonElement>): void {
    setActiveSteps((prevSteps) => {
      const result = prevSteps.slice(0, prevSteps.length - 1);
      return result;
    });
  }
  return (
    <div className="flex flex-col justify-between items-center">
      <StepperButtonGroup steps={stepperConfig} activeItemIds={activeSteps} />
      <div className="bg-base-100 w-96 shadow-sm mt-8 rounded-xl">
        <div className="flex flex-col justify-center items-center gap-2 p-6">
          <h2 className="text-xl font-bold">What do you want for delivery</h2>
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
              <DayPicker
                className="react-day-picker"
                mode="single"
                selected={date}
                onSelect={setDate}
                hidden={{
                  before: dayjs().toDate(),
                  after: dayjs().add(7, "day").toDate(),
                }}
              />
            </div>
          </div>

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
