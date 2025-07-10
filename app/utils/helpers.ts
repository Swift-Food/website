import { twMerge } from "tailwind-merge";

export function cn(...values: Array<any>) {
  return twMerge(...values);
}
