import { cn } from "@/app/utils/helpers";
import React, { ReactNode } from "react";

type InfoContainerProps = {
  heading: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function InfoContainer({
  heading,
  children,
  className,
  onClick,
}: InfoContainerProps) {
  return (
    <div
      className={cn(
        "w-full h-fit p-4 border-primary border-2 rounded-2xl",
        className
      )}
      onClick={onClick}
    >
      <h4 className="text-center text-primary font-bold">{heading}</h4>
      {children}
    </div>
  );
}
