"use client";

export default function SocialProofSection() {
  const logos = [
    "GOOGLE",
    "STRIPE",
    "NEXT.JS",
    "VERCEL",
    "PRISMA",
    "OPENAI",
    "CLAUDE",
    "FESTIVAL",
    "TECHCRUNCH",
    "GITHUB",
  ];

  return (
    <section
      id="social-proof"
      className="relative z-10 py-20 bg-white border-y border-gray-100 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">
          Trusted by event planners at
        </p>
      </div>

      <div className="marquee-container">
        <div className="marquee-content flex items-center">
          {[...logos, ...logos].map((logo, idx) => (
            <div
              key={idx}
              className="mx-12 text-3xl md:text-4xl font-black text-gray-200 grayscale hover:text-[#fa43ad] hover:grayscale-0 transition-all cursor-default"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
