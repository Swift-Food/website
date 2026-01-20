"use client";

import HeroSectionNew from "./HeroSectionNew";
import HeroSectionLegacy from "./HeroSectionLegacy";

// Toggle this to switch between hero sections
// "new" = scroll-driven expanding module hero
// "legacy" = original mesh gradient centered hero
const ACTIVE_HERO: "new" | "legacy" = "new";

export default function HeroSection() {
  if (ACTIVE_HERO === "legacy") {
    return <HeroSectionLegacy />;
  }
  return <HeroSectionNew />;
}
