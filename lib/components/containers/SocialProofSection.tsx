"use client";

interface Logo {
  name: string;
  image?: string; // Optional path to SVG, PNG, or JPEG in /public
}

export default function SocialProofSection() {
  const logos: Logo[] = [
    { name: "Epiminds" },
    { name: "Iterate" },
    { name: "Unicorn Mafia", image: "/logos/unicorn-mafia.svg" },
  ];

  return (
    <section
      id="social-proof"
      className="relative z-10 py-20 bg-white border-y border-gray-100 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">
          Trusted by
        </p>
      </div>

      <div className="marquee-container">
        <div className="marquee-content flex items-center">
          {[...logos, ...logos].map((logo, idx) => (
            <div
              key={idx}
              className="mx-12 flex items-center gap-3 transition-all cursor-default"
            >
              <span className="text-3xl md:text-4xl font-black text-zinc-500 hover:text-[#fa43ad] transition-colors">
                {logo.name.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
