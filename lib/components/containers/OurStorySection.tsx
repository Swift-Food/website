"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export default function OurStorySection() {
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
            className={`relative z-10 max-w-2xl w-full bg-white rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center transition-all duration-1000 ease-out delay-300 ${
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
          className={`max-w-2xl mx-auto bg-white rounded-[2.5rem] p-8 flex flex-col items-center transition-all duration-1000 ease-out delay-300 ${
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
