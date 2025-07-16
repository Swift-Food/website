import React from "react";
import StepperButtons from "./StepperButtons";
import { cn } from "@/app/utils/helpers";

export type TStepperButtonGroupItem = {
  id: string | number;
  step: number | string;
  title: string;
};

type StepperButtonGroupProps = {
  steps: TStepperButtonGroupItem[];
  activeItemIds: (string | number)[];
};

export default function StepperButtonGroup({
  steps,
  activeItemIds,
}: StepperButtonGroupProps) {
  return (
    <div className="flex">
      {steps.map((step, index) => (
        <StepperButtons
          key={step.id}
          step={step.step}
          title={step.title}
          slotCSS={{
            container: { right: index * 15 },
          }}
          slotStyles={{
            container: cn(
              "pr-10",
              index !== steps.length - 1 && `rounded-r-none`,
              !activeItemIds.includes(step.id) && "bg-base-100 text-black",
              !activeItemIds.includes(step.id) &&
                index !== steps.length - 1 &&
                "border-r-0"
            ),
          }}
        />
      ))}
    </div>
  );
}
