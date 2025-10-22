"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

// OUR STORY SECTION
function OurStorySection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="aboutus"
      className="relative w-full flex flex-col"
    >
      <div className="relative w-full aspect-[16/9]">
        <Image
          src="/pink-blurred-market-with-bird2.png"
          alt="Pink blurred market background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-pink-500/30" />
        <div className="absolute inset-0 max-lg:hidden flex items-center justify-end py-8 px-4 sm:px-8">
          <div
            className={`relative z-10 max-w-2xl w-full bg-white rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center shadow-lg transition-all duration-1000 ease-out delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-12"
            }`}
          >
            <h2
              className="text-pink-500 text-4xl sm:text-5xl font-bold mb-6 tracking-widest text-center"
              style={{ letterSpacing: "0.1em" }}
            >
              OUR STORY
            </h2>
            <p
              className="text-pink-500 text-lg sm:text-xl font-mono text-center whitespace-pre-line"
              style={{ letterSpacing: "0.05em" }}
            >
              Swift Food was created by students for students in London. We
              wanted a faster way to get great local food delivered — without
              the high prices or long waits. <br />
              <br /> We work with independent local businesses, helping support
              the community while giving students more variety and better meals.{" "}
              <br /> <br />
              Our goal is simple: fast delivery, affordable food, and a platform
              that puts local first.
            </p>
          </div>
        </div>
      </div>
      <div className="lg:hidden w-full px-4 py-8 bg-base-100">
        <div
          className={`max-w-2xl mx-auto bg-white rounded-[2.5rem] p-8 flex flex-col items-center shadow-lg transition-all duration-1000 ease-out delay-300 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <h2
            className="text-pink-500 text-3xl font-bold mb-6 tracking-widest text-center"
            style={{ letterSpacing: "0.1em" }}
          >
            OUR STORY
          </h2>
          <p
            className="text-pink-500 text-base font-mono text-center whitespace-pre-line"
            style={{ letterSpacing: "0.05em" }}
          >
            Swift Food was created by students for students in London. We wanted
            a faster way to get great local food delivered — without the high
            prices or long waits. <br /> <br />
            We work with independent local businesses, helping support the
            community while giving students more variety and better meals.{" "}
            <br /> <br />
            Our goal is simple: fast delivery, affordable food, and a platform
            that puts local first.
          </p>
        </div>
      </div>
    </section>
  );
}
// import ImageTextSection from "./components/containers/ImageTextSection";
// import SectionDivider from "./components/sectionDivider";
import HomeHeroSection from "./components/containers/HomeHeroSection";

// WHO WE WORK WITH SECTION
function WhoWeWorkWithSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-base-100 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2
          className={`text-center text-hot-pink text-4xl sm:text-5xl font-bold tracking-widest mb-12 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.1em",
          }}
        >
          WHO WE WORK WITH
        </h2>
        <div className="flex flex-row gap-8 sm:gap-16 justify-center items-center">
          <div
            className={`text-center transition-all duration-1000 ease-out delay-200 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <p
              className="text-primary text-xl sm:text-4xl font-bold mb-2"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              10+ Restaurants
            </p>
          </div>
          <div
            className={`text-center transition-all duration-1000 ease-out delay-400 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <p
              className="text-primary text-xl sm:text-4xl font-bold mb-2"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              15+ Stalls
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// WHAT WE'VE CREATED TOGETHER SECTION
function WhatWeCreatedSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [offset, setOffset] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const images = [
    { src: "/problem-solve.jpg", alt: "Student event" },
    { src: "/restaurant-delivery.jpg", alt: "Student event" },
    { src: "/problem-solve.jpg", alt: "Student event" },
    { src: "/restaurant-delivery.jpg", alt: "Student event" },
  ];

  // Duplicate images for infinite scroll effect
  const allImages = [...images, ...images, ...images];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Auto-scroll carousel smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev - 1;
        // Reset when we've scrolled through one full set of images
        const imageWidth = 400; // approximate width + gap
        const resetPoint = -(images.length * imageWidth);
        if (newOffset <= resetPoint) {
          return 0;
        }
        return newOffset;
      });
    }, 30); // Smooth animation, 30ms per frame

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section ref={sectionRef} className="w-full bg-base-100 py-16 px-4">
      <div className=" mx-auto">
        <h2
          className={`text-center text-hot-pink text-4xl sm:text-5xl font-bold tracking-widest mb-12 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          }`}
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            letterSpacing: "0.1em",
          }}
        >
          WHAT WE&apos;VE CREATED TOGETHER
        </h2>
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 justify-center items-center mb-12">
          <div
            className={`text-center transition-all duration-1000 ease-out delay-200 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <h3
              className="text-primary text-xl sm:text-4xl font-bold"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              30+ Societies
            </h3>
          </div>
          <div
            className={`text-center transition-all duration-1000 ease-out delay-300 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <h3
              className="text-primary text-xl sm:text-4xl font-bold"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              80+ Universities
            </h3>
          </div>
          <div
            className={`text-center transition-all duration-1000 ease-out delay-400 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <h3
              className="text-primary text-xl sm:text-4xl font-bold"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              80+ Events
            </h3>
          </div>
        </div>

        {/* Image Carousel - Horizontal Scrolling */}
        <div
          className={`relative w-full transition-all duration-1000 ease-out delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Carousel Container with blur edges */}
          <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
            {/* Blur edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-base-100 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-base-100 to-transparent z-10 pointer-events-none" />

            {/* Scrolling Images */}
            <div
              className="flex gap-4 h-full"
              style={{
                transform: `translateX(${offset}px)`,
                willChange: "transform",
              }}
            >
              {allImages.map((image, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-64 sm:w-80 md:w-96 h-full rounded-2xl overflow-hidden"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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
      <WhoWeWorkWithSection />
      <WhatWeCreatedSection />
      <div className="bg-secondary h-10 w-full" />
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
              className={`w-full md:w-80 bg-hot-pink rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-1000 ease-out delay-200 ${
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
