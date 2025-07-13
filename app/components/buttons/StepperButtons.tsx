import { cn } from "@/app/utils/helpers";
import React, { CSSProperties } from "react";

export type StepperButtonsProps = {
  step: number | string;
  title: string;
  slotCSS?: {
    container?: CSSProperties;
    stepContainer?: CSSProperties;
    stepTitle?: CSSProperties;
  };
  slotStyles?: {
    container?: string;
    stepContainer?: string;
    stepTitle?: string;
  };
};

export default function StepperButtons({
  step,
  title,
  slotStyles,
  slotCSS,
}: StepperButtonsProps) {
  return (
    <button
      className={cn(
        "relative btn btn-secondary rounded-full flex justify-center items-center pl-1 pr-6 text-white",
        slotStyles?.container
      )}
      style={slotCSS?.container}
    >
      <div
        className={cn(
          "h-[30px] w-[30px] flex justify-center items-center rounded-full bg-primary mr-3",
          slotStyles?.stepContainer
        )}
        style={slotCSS?.stepContainer}
      >
        <label
          className={cn("text-white", slotStyles?.stepTitle)}
          style={slotCSS?.stepTitle}
        >
          {step}
        </label>
      </div>
      {title}
    </button>
  );
}
