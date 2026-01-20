"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function ProgressBarDemo() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-center p-10 bg-[#0a0a0a] text-white font-mono text-[10px] overflow-hidden">
      <div className="flex justify-between mb-3">
        <span className="tracking-widest">ORDER #4920 STATUS</span>
        <span className="text-[#fa43ad] font-bold">{progress}%</span>
      </div>
      <div className="w-full h-8 border border-white/5 p-1 relative">
        <div
          className="h-full bg-[#fa43ad] transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(250,67,173,0.4)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-10 space-y-4">
        <div
          className={`flex justify-between items-center transition-opacity duration-300 ${
            progress > 10 ? "opacity-100" : "opacity-20"
          }`}
        >
          <span className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                progress > 25 ? "bg-[#fa43ad]" : "bg-white"
              }`}
            ></div>
            PENDING REVIEW
          </span>
          <span className="text-[9px]">{progress > 25 ? "APPROVED" : "REVIEWING"}</span>
        </div>
        <div
          className={`flex justify-between items-center transition-opacity duration-300 ${
            progress > 30 ? "opacity-100" : "opacity-20"
          }`}
        >
          <span className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                progress > 50 ? "bg-[#fa43ad]" : "bg-white"
              }`}
            ></div>
            PAYMENT
          </span>
          <span className="text-[9px]">{progress > 50 ? "COMPLETE" : "PROCESSING"}</span>
        </div>
        <div
          className={`flex justify-between items-center transition-opacity duration-300 ${
            progress > 55 ? "opacity-100" : "opacity-20"
          }`}
        >
          <span className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                progress > 75 ? "bg-[#fa43ad]" : "bg-white"
              }`}
            ></div>
            OUT FOR DELIVERY
          </span>
          <span className="text-[9px]">{progress > 75 ? "ON THE WAY" : "QUEUED"}</span>
        </div>
        <div
          className={`flex justify-between items-center transition-opacity duration-300 ${
            progress > 80 ? "opacity-100" : "opacity-20"
          }`}
        >
          <span className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                progress >= 100 ? "bg-[#fa43ad]" : "bg-white"
              }`}
            ></div>
            ARRIVAL
          </span>
          <span className="text-[9px]">{progress >= 100 ? "ARRIVED" : "ETA 12:45"}</span>
        </div>
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
            <div className="aspect-square bg-black mb-10 border border-black overflow-hidden relative shadow-2xl group transition-all duration-700">
              <ProgressBarDemo />
              <div className="absolute top-4 right-4 text-[8px] text-[#fa43ad]/50 uppercase tracking-widest font-mono group-hover:text-[#fa43ad] transition-colors">
                Live Feed Active
              </div>
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
