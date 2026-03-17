"use client";

import { useState } from "react";

interface Partner {
  name: string;
  type: string;
  location: string;
  description: string;
  link: string;
  bookingLink?: string;
  logo?: string; // Optional image path
}

const partners: Partner[] = [
  {
    name: "Halkin",
    type: "Coworking Space",
    location: "City of London",
    description:
      "Premium flexible workspace for founders, startups, and growing teams. A space that values great food as much as great work.",
    link: "https://www.halkin.com/",
    bookingLink: "https://events.halkin.com/coworking/halkin/",
    logo: "/logos/halkin.svg",
  },
];

export default function PartnersSection() {
  const [active, setActive] = useState(0);
  const partner = partners[active];

  return (
    <section className="py-16 bg-white border-b border-gray-100 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-12 md:gap-16">

          {/* Left: heading */}
          <div className="md:w-1/2">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#fa43ad] uppercase mb-4 block">
              Our Partners
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">
              Spaces We<br />Work With
            </h2>
            <p className="text-gray-400 font-light text-lg max-w-sm">
              We partner with premium venues to bring great food to great
              communities.
            </p>
            <a
              href="/contact"
              className="inline-block mt-6 font-mono text-[10px] font-bold tracking-[0.15em] uppercase px-5 py-3 bg-[#282828] text-white hover:bg-[#fa43ad] transition-colors"
            >
              Become a Partner →
            </a>
          </div>

          {/* Right: tabs + card */}
          <div className="md:w-1/2">
            {/* Partner tabs — only shown when more than one */}
            {partners.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {partners.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setActive(i)}
                    className={`font-mono text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-2 rounded-sm border transition-all ${
                      active === i
                        ? "bg-[#282828] text-white border-[#282828]"
                        : "text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {/* Partner card */}
            <div className="border border-dashed border-gray-300 rounded-sm p-7 flex flex-col gap-4">
              {/* Logo area */}
              {partner.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-10 object-contain object-left"
                />
              ) : (
                <span className="font-mono font-bold text-sm tracking-[0.1em] text-[#282828]">
                  {partner.name.toUpperCase()}
                </span>
              )}

              <p className="font-mono text-[9px] font-bold tracking-[0.15em] uppercase text-[#fa43ad]">
                {partner.type} · {partner.location}
              </p>

              <p className="text-gray-500 text-sm leading-relaxed">
                {partner.description}
              </p>

              <div className="flex flex-wrap gap-5">
                <a
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-[#282828] pb-0.5 w-fit hover:text-[#fa43ad] hover:border-[#fa43ad] transition-colors"
                >
                  Visit {partner.name} →
                </a>
                {partner.bookingLink && (
                  <a
                    href={partner.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-[#fa43ad] text-[#fa43ad] pb-0.5 w-fit hover:opacity-70 transition-opacity"
                  >
                    Book Space With Catering →
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
