import { cn } from "@/lib/utils/helpers";
import React, { ReactNode } from "react";

type InfoContainerProps = {
  heading: string;
  children?: ReactNode;
  className?: string;
};

export default function InfoContainer({
  heading,
  children,
  className,
}: InfoContainerProps) {
  return (
    <div
      className={cn(
        "w-full h-fit p-4 bg-base-200 rounded-2xl item-center",
        className
      )}
    >
      <h4 className="text-center text-primary text-xl font-bold">{heading}</h4>
      {children}
    </div>
  );
}
