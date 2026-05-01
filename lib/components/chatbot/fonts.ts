import { Fraunces, Geist } from "next/font/google";

/**
 * Editorial display face. Variable axis on opsz so we can tune for
 * small UI labels vs large headlines. Italics carry visual weight in
 * "picked because" reasons and category small caps.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

/**
 * Refined body sans — Geist is distinctive enough to avoid the Inter
 * sameness without screaming for attention. Used for bot/user prose,
 * input fields, and metadata.
 */
export const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist",
  display: "swap",
});
