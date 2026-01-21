"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function EventGallerySection() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: isMobile ? 0.1 : 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const events = [
    {
      id: 1,
      title: "Epiminds Hackathon",
      count: "310+ portions",
      category: "Hackathon",
      img: "/HomeSection/Epiminds.jpg",
    },
    {
      id: 2,
      title: "Iterate - RL London Hackathon",
      count: "620+ portions",
      category: "Hackathon",
      img: "/HomeSection/RL_Hackathon.JPG",
    },
    {
      id: 3,
      title: "Great Agent Hack",
      count: "1000+ portions",
      category: "Hackathon",
      img: "/HomeSection/Great_Agent_Hack.jpg",
    },
    {
      id: 4,
      title: "AgentVerse Hackathon",
      count: "940+ portions",
      category: "Hackathon",
      img: "/HomeSection/Agent Verse.JPG",
    },
  ];

  return (
    <section ref={sectionRef} className="py-32 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-20 reveal ${isRevealed ? "active" : ""}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#fa43ad] uppercase mb-4 block">
                Our Portfolio
              </span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">
                Events we've catered for
                {/* Scaled to your ambition */}
              </h2>
              <p className="text-gray-400 font-light text-lg">
                From intimate 50-portion workshops to massive 3,000-portion multi-day
                hackathons.
              </p>
            </div>
            {/* <button className="hidden md:block text-xs font-bold tracking-widest border-b border-gray-300 pb-1 hover:text-[#fa43ad] hover:border-[#fa43ad] transition-all uppercase">
              View Our Events
            </button> */}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {/* Stat card */}
          <div
            className={`relative overflow-hidden bg-primary aspect-[4/3] flex flex-col items-center justify-center reveal w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] ${
              isRevealed ? "active" : ""
            }`}
          >
            <span className="text-7xl md:text-8xl font-black text-white">60+</span>
            <span className="text-sm font-bold tracking-[0.3em] uppercase text-white/70 mt-2">
              Events catered
            </span>
          </div>
          {events.map((event, index) => {
            const isActive = activeCard === event.id;
            return (
              <div
                key={event.id}
                className={`group relative overflow-hidden bg-black aspect-[4/3] reveal w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] cursor-pointer ${
                  isRevealed ? "active" : ""
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => setActiveCard(isActive ? null : event.id)}
              >
                <Image
                  src={event.img}
                  alt={event.title}
                  fill
                  className={`object-cover opacity-80 group-hover:scale-105 group-hover:opacity-30 transition-all duration-1000 ease-out ${
                    isActive ? "scale-105 opacity-30" : ""
                  }`}
                />
                <div className={`absolute inset-0 p-10 flex flex-col justify-end transition-all duration-500 ${
                  isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                }`}>
                  <span className="text-[10px] font-bold text-[#fa43ad] tracking-widest uppercase mb-3">
                    {event.category}
                  </span>
                  <h3 className="text-3xl font-black text-white uppercase mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-[#fa43ad] rounded-full"></div>
                    <p className="text-gray-300 text-xs font-bold tracking-widest uppercase">
                      {event.count}
                    </p>
                  </div>
                </div>
{/*                <div className={`absolute top-8 right-8 w-12 h-12 border border-white/10 rounded-full flex items-center justify-center text-white transition-all duration-500 hover:bg-[#fa43ad] hover:border-[#fa43ad] ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div> */}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
