"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const steps = [
  { label: "SUBMITTED", status: "Received", pending: "Waiting" },
  { label: "REVIEWING", status: "Approved", pending: "Processing" },
  { label: "PAYMENT", status: "Processed", pending: "Waiting" },
  { label: "CONFIRMED", status: "Preparing", pending: "Waiting" },
  { label: "DELIVERED", status: "Complete", pending: "Waiting" },
];

function ProgressBarDemo() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev >= steps.length ? 0 : prev + 0.03));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const activeStep = Math.floor(currentStep);

  return (
    <div className="w-full h-full flex flex-col justify-center p-8 bg-[#0a0a0a] text-white font-mono">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="text-[10px] text-white/40 tracking-[0.2em] mb-1">ORDER</div>
          <div className="text-2xl font-bold tracking-tight">#4920</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#fa43ad] animate-pulse shadow-[0_0_10px_rgba(250,67,173,0.6)]" />
          <span className="text-[10px] text-white/40 tracking-widest">LIVE</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-10">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#fa43ad] to-[#fb6fbb] transition-all duration-300 ease-out shadow-[0_0_20px_rgba(250,67,173,0.5)]"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isComplete = index < activeStep;
          const isCurrent = index === activeStep;
          const isPending = index > activeStep;

          return (
            <div
              key={step.label}
              className={`flex items-center justify-between transition-all duration-500 ${
                isPending ? "opacity-30" : "opacity-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isComplete
                      ? "border-[#fa43ad] bg-[#fa43ad]"
                      : isCurrent
                      ? "border-[#fa43ad] bg-transparent"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {isComplete && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-[#fa43ad] animate-pulse" />
                  )}
                </div>
                <span className={`text-[11px] tracking-wider ${isCurrent ? "text-white" : "text-white/60"}`}>
                  {step.label}
                </span>
              </div>
              <span
                className={`text-[10px] tracking-wide ${
                  isComplete ? "text-[#fa43ad]" : isCurrent ? "text-white/80" : "text-white/30"
                }`}
              >
                {isComplete ? step.status : step.pending}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FeatureDemosSection() {
  const [isRevealed, setIsRevealed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-32 bg-[#fafafa] px-6 border-y border-gray-100 overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Demo 1: Easy Selection */}
          <div
            className={`flex flex-col reveal ${isRevealed ? "active" : ""}`}
            style={{ transitionDelay: "0ms" }}
          >
            <div className="aspect-square bg-white border border-gray-100 mb-10 overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700 relative">
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
                alt="UI Selection"
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-[#fa43ad]/5 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase">
              Easy Selection
            </h3>
            <p className="text-gray-400 font-light leading-relaxed">
              Multi-session ordering in one intuitive flow. Categorize by day,
              session, or dietary needs with a single click. No complex spreadsheets
              required.
            </p>
          </div>

          {/* Demo 2: PDF Menu Export */}
          <div
            className={`flex flex-col reveal ${isRevealed ? "active" : ""}`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="aspect-square bg-white border border-gray-100 mb-10 relative p-12 flex items-center justify-center group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden">
              <div className="w-full aspect-[1/1.4] bg-white shadow-2xl border border-gray-100 transform -rotate-3 p-8 flex flex-col space-y-5 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-105">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-[#fa43ad] rounded-sm"></div>
                  <div className="w-12 h-4 bg-gray-50 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-100 w-full rounded-sm"></div>
                <div className="h-4 bg-gray-100 w-4/5 rounded-sm"></div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="h-12 bg-gray-50 border border-gray-100 rounded-sm"></div>
                  <div className="h-12 bg-gray-50 border border-gray-100 rounded-sm"></div>
                </div>
                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-[#fa43ad]"></div>
                    <div className="w-16 h-2 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="w-10 h-2 bg-gray-100 rounded-full"></div>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#fa43ad]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-white text-black p-4 rounded-full shadow-xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase">
              Automated PDF Export
            </h3>
            <p className="text-gray-400 font-light leading-relaxed">
              Shareable menus with dietary info baked-in. One-click export for your
              sponsors, attendees, and internal venue teams. Professional by default.
            </p>
          </div>

          {/* Demo 3: Live Tracking */}
          <div
            className={`flex flex-col reveal ${isRevealed ? "active" : ""}`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="aspect-square bg-[#0a0a0a] mb-10 border border-white/5 overflow-hidden relative shadow-2xl group transition-all duration-700">
              <ProgressBarDemo />
            </div>
            <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase">
              Mission Control
            </h3>
            <p className="text-gray-400 font-light leading-relaxed">
              Receive live updates through your dashboard. Real-time driver
              positioning and delivery estimates down to the minute. Never guess
              arrival times again.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
