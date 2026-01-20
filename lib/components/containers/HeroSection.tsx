"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-white">
      {/* Abstract Background Accents */}
      <div className="absolute inset-0 grid-pattern opacity-40 z-0"></div>
      <div className="absolute top-1/4 -right-24 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-pink-50 rounded-full blur-[80px] md:blur-[120px] z-0 opacity-70 animate-float"></div>
      <div className="absolute bottom-1/4 -left-24 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-gray-50 rounded-full blur-[60px] md:blur-[100px] z-0 opacity-70 animate-float-alt"></div>

      <div className="relative z-10 max-w-6xl px-4 md:px-6 text-center">
        <div className="flex flex-col items-center">
          <span
            className={`inline-block px-4 py-2 mb-6 md:mb-8 text-[9px] md:text-[10px] font-bold tracking-widest md:tracking-[0.25em] uppercase border border-gray-200 rounded-full bg-white text-gray-500 transition-all duration-1000 delay-100 leading-tight max-w-[280px] md:max-w-none ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            For Hackathons & Large-Scale Events
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-extrabold leading-[1.1] md:leading-[0.85] tracking-tighter mb-8 md:mb-10 overflow-hidden">
            <span
              className={`block transition-all duration-1000 delay-300 transform ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              }`}
            >
              The default <span className="text-[#fa43ad]">caterer</span>
            </span>
            <span
              className={`block transition-all duration-1000 delay-500 transform ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
              }`}
            >
              for tech events
            </span>
          </h1>

          <p
            className={`text-base md:text-xl text-gray-400 font-light max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed transition-all duration-1000 delay-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            Plan, scale, and deliver world-class catering for up to 3,000 attendees
            in under a minute. Simple. Reliable. Sharp.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-sm sm:max-w-none transition-all duration-1000 delay-[900ms] ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <Link href="/event-order" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-[#fa43ad] text-white px-8 md:px-12 py-5 md:py-6 font-bold tracking-widest text-[10px] md:text-xs uppercase group relative overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95">
                <span className="relative z-10">ORDER NOW</span>
                <div className="absolute inset-0 bg-[#e03a9a] translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>
            </Link>
            <Link href="/menu" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-transparent border border-black text-black px-8 md:px-12 py-5 md:py-6 font-bold tracking-widest text-[10px] md:text-xs uppercase hover:bg-black hover:text-white transition-all duration-300 active:scale-95">
                View Menus
              </button>
            </Link>
          </div>
        </div>
      </div>

      <a
        href="#social-proof"
        className={`hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center transition-all duration-1000 delay-[1200ms] ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-px h-16 bg-gradient-to-b from-[#fa43ad] to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-[#fa43ad]/60 animate-bounce"></div>
        </div>
        <svg
          className="w-4 h-4 mt-4 text-gray-300 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
}
