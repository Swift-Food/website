"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MoveUpRight } from "lucide-react";

const HeroSectionNew: React.FC = () => {
  const router = useRouter();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const handleOrderClick = () => {
    router.push("/event-order");
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const mobile = window.innerWidth < 768;

      // Mobile: 250vh container = 150vh scrollable (1.5x)
      // Desktop: 400vh container = 300vh scrollable (3x)
      const scrollableDistance = windowHeight * (mobile ? 1.5 : 3);
      const progress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
      targetProgressRef.current = progress;
    };

    // Smooth interpolation loop
    const animate = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      // Lerp factor: higher = snappier, lower = smoother
      // Mobile uses slightly higher factor for responsiveness
      const lerpFactor = window.innerWidth < 768 ? 0.15 : 0.12;
      const diff = target - current;

      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current = current + diff * lerpFactor;
        setScrollProgress(currentProgressRef.current);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /**
   * PHASES (normalized 0-1):
   * 0.0 -> 0.7: Module Expansion & Image Scaling
   * 0.55 -> 0.8: Cross-fade transition to CTA
   * 0.8 -> 1.0: PLATEAU (Hold the CTA screen so it doesn't overshoot)
   */

  // Expansion reaches max at 70% of the total scroll
  const expansionProgress = Math.min(scrollProgress / 0.7, 1);

  // MOBILE VS DESKTOP ADJUSTMENTS
  // Mobile: Start full-bleed (100/100/0)
  // Desktop: Start as a floating card (85/75/40)
  const baseWidth = isMobile ? 100 : 85;
  const baseHeight = isMobile ? 100 : 75;
  const baseRadius = isMobile ? 0 : 40;

  const moduleWidth = baseWidth + expansionProgress * (100 - baseWidth);
  const moduleHeight = baseHeight + expansionProgress * (100 - baseHeight);
  const moduleRadius = baseRadius - expansionProgress * baseRadius;
  const textScale = 1 + expansionProgress * 0.05;

  // Reveal starts at 55% and finishes at 80%, then holds for the last 20%
  const revealOpacity = Math.min(
    Math.max((scrollProgress - 0.55) / 0.25, 0),
    1
  );

  // Subtle parallax for the final CTA text during the 'hold' phase (0.8 -> 1.0)
  const holdProgress = Math.max(0, (scrollProgress - 0.8) / 0.2);
  const revealTranslateY = (1 - revealOpacity) * 60 - holdProgress * 20;

  return (
    <div ref={sectionRef} className="relative h-[250vh] md:h-[400vh] bg-white">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Expansion Module: The main visual container */}
        <div
          className="relative z-20 flex items-center justify-center overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.2)]"
          style={{
            width: `${moduleWidth}vw`,
            height: `${moduleHeight}vh`,
            borderRadius: `${moduleRadius}px`,
            backgroundColor: "black",
            willChange: "width, height, border-radius",
          }}
        >
          {/* Background Image: Fades out as we approach the 'Ready to order' reveal */}
          <div
            className="absolute inset-0 z-0"
            style={{ opacity: 1 - revealOpacity * 0.9, willChange: "opacity" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/HomeSection/WhatsApp Image 2026-01-21 at 15.12.23.jpeg"
              alt="Premium Event Catering"
              className="w-full h-full object-cover"
              style={{
                transform: `scale(${1.1 + expansionProgress * 0.15})`,
                willChange: "transform, filter",
                filter: `brightness(${0.8 - expansionProgress * (isMobile ? 0.4 : 0.3)}) contrast(1.1) saturate(0.8)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80"></div>
          </div>

          {/* THE CORE TEXT: Fades away during the reveal phase */}
          <div
            className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl"
            style={{
              transform: `scale(${textScale})`,
              opacity: 1 - revealOpacity * 1.8,
              willChange: "transform, opacity",
            }}
          >
            {/* <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="h-px w-6 bg-[#ff4fa5]"></div>
              <span className="text-[12px] font-black tracking-[0.8em] uppercase text-white/60">
                Event Catering
              </span>
              <div className="h-px w-6 bg-[#ff4fa5]"></div>
            </div> */}

            <div className="flex flex-col items-center">
              <h1 className="text-3xl md:text-[3.5vw] font-bold tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl">
                The default
              </h1>
              <h1 className="text-4xl md:text-[5vw] text-[#ff4fa5] leading-[0.85] my-4 drop-shadow-xl font-black">
                CATERER
              </h1>
              <h1 className="text-3xl md:text-[3.5vw] font-bold tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl">
                for tech events
              </h1>
            </div>

            <div
              className="mt-8 md:mt-10"
              style={{
                opacity: 1 - expansionProgress * 1.5,
                transform: `translateY(${expansionProgress * 40}px)`,
                willChange: "transform, opacity",
              }}
            >
              <p className="text-white/80 text-sm md:text-lg font-light leading-relaxed max-w-xl mb-10">
                Plan, order, and deliver world-class catering for{" "}
                <br className="hidden md:block" /> 3,000 people in
                under a minute.
              </p>

              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={handleOrderClick}
                  className="group bg-[#ff4fa5] rounded-xl text-white px-10 py-4 text-[14px] font-black uppercase tracking-[0.4em] flex items-center gap-4 hover:bg-white hover:text-black transition-all shadow-2xl"
                >
                  Order Now{" "}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
                {/* <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/30 pointer-events-none">
                  SIMPLE • LOCAL • RELIABLE
                </p> */}
              </div>
            </div>
          </div>

          {/* Corner HUD UI Indicators */}
          {/* <div
            className="absolute top-12 left-12 flex items-center gap-3 transition-opacity duration-300"
            style={{
              opacity:
                (1 - (isMobile ? revealOpacity : expansionProgress)) *
                (1 - revealOpacity),
            }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
              SYSTEM_ACTIVE
            </span>
          </div> */}

          {/* <div
            className="absolute bottom-12 right-12 flex items-center gap-4 transition-opacity duration-300"
            style={{
              opacity:
                (1 - (isMobile ? revealOpacity : expansionProgress)) *
                (1 - revealOpacity),
            }}
          >
            <div className="text-right">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
                SLA_STATUS
              </p>
              <p className="text-xs font-black text-[#ff4fa5] tracking-tighter">
                99.9% RELIABLE
              </p>
            </div>
          </div> */}
        </div>

        {/* Scroll Metric Indicator (Hidden on Mobile) */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex-col items-center gap-6 z-30 hidden lg:flex">
          <span className="text-[8px] font-black text-gray-300 uppercase [writing-mode:vertical-lr] tracking-[0.6em] mb-4">
            EXPANSION_INDEX
          </span>
          <div className="h-40 w-px bg-gray-100 relative">
            <div
              className="absolute top-0 w-full bg-[#ff4fa5] transition-all duration-150"
              style={{ height: `${scrollProgress * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-black text-[#ff4fa5]">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>

        {/* REVEAL LAYER: The stable final CTA screen */}
        <div
          className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center pointer-events-none"
          style={{
            opacity: revealOpacity,
            backgroundColor: `rgba(0, 0, 0, ${revealOpacity})`,
            willChange: "opacity",
          }}
        >
          <div
            className="text-center px-8 flex flex-col items-center"
            style={{
              transform: `translateY(${revealTranslateY}px)`,
              willChange: "transform",
            }}
          >
            <p className="text-[#ff4fa5] text-[10px] font-black uppercase tracking-[0.6em] mb-4 md:mb-6">
              Ready to order?
            </p>
            <h2 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 md:mb-12 drop-shadow-2xl">
              Ready to <span className="text-[#ff4fa5]">order?</span>
            </h2>
            <button
              onClick={handleOrderClick}
              className="group pointer-events-auto rounded-xl bg-white text-black px-12 py-6 md:px-16 md:py-8 text-[10px] md:text-xs font-black uppercase tracking-[0.5em] flex items-center gap-6 hover:bg-[#ff4fa5] hover:text-white transition-all shadow-[0_0_80px_rgba(255,79,165,0.4)]"
            >
              Order now <MoveUpRight size={18} />
            </button>
            <div className="mt-8 md:mt-12 flex flex-col items-center gap-6">
              <div className="flex items-center gap-8 opacity-40">
                <div className="h-px w-8 md:w-12 bg-white/20"></div>
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] text-white">
                  Secure Transaction
                </span>
                <div className="h-px w-8 md:w-12 bg-white/20"></div>
              </div>
              {/* <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/20">
                SIMPLE • LOCAL • RELIABLE
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionNew;
