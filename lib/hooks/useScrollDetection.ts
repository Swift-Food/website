"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "@/context/ScrollContext";

// Module-level flag - immediately readable by scroll handler (no React state delay)
let skipNextScrollEvent = false;

export function skipScrollDetection() {
  skipNextScrollEvent = true;
}

export function useScrollDetection() {
  const { setHideNavbar } = useScroll();
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Skip this scroll event if flagged (programmatic scroll)
          if (skipNextScrollEvent) {
            skipNextScrollEvent = false;
            lastScrollY.current = currentScrollY;
            ticking.current = false;
            return;
          }

          // Hide when scrolling down past 100px, show when scrolling up
          if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
            setHideNavbar(true);
          } else if (currentScrollY < lastScrollY.current) {
            setHideNavbar(false);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setHideNavbar]);
}