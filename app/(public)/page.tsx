"use client";
import { useEffect, useState, useRef } from "react";
import HomeHeroSection from "@/lib/components/containers/HomeHeroSection";
import OurStorySection from "@/lib/components/containers/OurStorySection";

export default function Home() {
  const [isDifferentVisible, setIsDifferentVisible] = useState(false);
  const differentSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDifferentVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (differentSectionRef.current) {
      observer.observe(differentSectionRef.current);
    }

    return () => {
      if (differentSectionRef.current) {
        observer.unobserve(differentSectionRef.current);
      }
    };
  }, []);

  return (
    <div>
      <HomeHeroSection />
      <div className="bg-primary h-10 w-full" />
      <OurStorySection />
      <section
        ref={differentSectionRef}
        className="w-full bg-base-100 py-10 px-4"
      >
        <div>
          <h2
            className={`text-center text-primary text-4xl font-bold tracking-wide mb-10 transition-all duration-1000 ease-out ${
              isDifferentVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-8"
            }`}
            style={{ fontFamily: "IBM Plex Mono, monospace" }}
          >
            WHAT MAKES US DIFFERENT?
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch">
            <div
              className={`w-full md:w-80 bg-secondary rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-1000 ease-out delay-200 ${
                isDifferentVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <h3
                className="text-primary font-extrabold text-2xl text-center mb-4"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                MUTIPLE STORES,
                <br />
                ONE DELIVERY
              </h3>
              <p
                className="text-primary text-center font-mono font-bold"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                EVERYTHING YOU
                <br />
                CRAVE, DELIVERED TOGETHER
                <br />
                IN ONE GO.
              </p>
            </div>
            <div
              className={`w-full md:w-80 bg-accent rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-1000 ease-out delay-400 ${
                isDifferentVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <h3
                className="text-primary font-extrabold text-2xl text-center mb-4"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                £5 FLAT DELIVERY RATE
              </h3>
              <p
                className="text-primary text-center font-mono font-bold"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                ALL EVENT ORDERS HAVE A
                <br />
                £5 DELIVERY FEE.
                <br />
                NO HIDDEN COSTS.
              </p>
            </div>
            <div
              className={`w-full md:w-80 bg-beige rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-1000 ease-out delay-600 ${
                isDifferentVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <h3
                className="text-primary font-extrabold text-2xl text-center mb-4"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                SUPPORT LOCAL
                <br />
                FOOD MARKETS
              </h3>
              <p
                className="text-primary text-center font-mono font-bold"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                HELP STREET FOOD VENDORS
                <br />
                AND LOCAL RESTAURANTS
                <br />
                THRIVE IN EVERY ORDER.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
