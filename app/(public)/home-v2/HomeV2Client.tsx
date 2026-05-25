"use client";

import { type CSSProperties, useRef, useState, useEffect, useCallback } from "react";
import FeatureDemosSection from "@/lib/components/containers/FeatureDemosSection";
import PartnersSection from "@/lib/components/containers/PartnersSection";
import Image from "next/image";
import "./home-v2.css";

const SOCIAL_LOGOS: { name: string; src: string; href: string }[] = [
  { name: "Cursor", src: "/SocialProof/Cursor_logo.svg.png", href: "https://cursor.com/" },
  { name: "Holistic AI", src: "/SocialProof/holistic_AI_logo.png", href: "https://www.holisticai.com/" },
  { name: "Cloudflare", src: "/SocialProof/Cloudflare_Logo.svg.png", href: "https://www.cloudflare.com/" },
  { name: "Cornetto", src: "/SocialProof/Cornetto-Logo.png", href: "#" },
  { name: "UCL", src: "/SocialProof/University_College_London_logo.svg.png", href: "https://www.ucl.ac.uk/" },
  { name: "Google Developer Group", src: "/SocialProof/Google_Developer_Group.svg", href: "#" },
];

// ── Reusable class strings ────────────────────────────────────────
const BTN_PRIMARY =
  "hv2-btn-arrow inline-flex items-center gap-1.5 rounded-full bg-[#fa43ad] px-6 py-[13px] text-[14.5px] font-semibold tracking-[-0.005em] text-white shadow-[0_4px_14px_rgba(250,67,173,0.32)] transition-all hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(250,67,173,0.42)] max-md:px-5 max-md:py-2.5 max-md:text-[13px]";

const BTN_GHOST =
  "inline-flex items-center gap-1.5 rounded-full border border-[#e8e2da] bg-transparent px-6 py-[13px] text-[14.5px] font-semibold text-[#1a1a1a] transition-all hover:border-[#8a8580] hover:bg-white max-md:px-5 max-md:py-2.5 max-md:text-[13px]";

const SECTION_EYEBROW =
  "mb-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c9277f]";

const STEP_CARD =
  "rounded-[22px] border border-[#e8e2da] bg-white px-8 pt-10 pb-9 transition-all hover:-translate-y-[3px] hover:shadow-[0_18px_40px_rgba(60,30,50,0.08)]";

// ── Component ─────────────────────────────────────────────────────
export default function HomeV2Client() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const dragging = useRef(false);
  const paused = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const didDrag = useRef(false);
  const rafId = useRef<number>(0);
  const lastTime = useRef(0);
  const speed = 80;
  const [closestIdx, setClosestIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMarqueeMouseMove = useCallback((e: React.MouseEvent) => {
    const el = marqueeRef.current;
    if (!el) return;
    const links = el.querySelectorAll<HTMLAnchorElement>("a");
    let best = -1;
    let bestDist = Infinity;
    links.forEach((link, i) => {
      const rect = link.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const dist = Math.abs(e.clientX - cx);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setClosestIdx(best >= 0 ? best : null);
  }, []);

  useEffect(() => {
    const tick = (time: number) => {
      if (lastTime.current) {
        if (!dragging.current && !paused.current) {
          const dt = (time - lastTime.current) / 1000;
          offset.current -= speed * dt;
          const el = marqueeRef.current;
          if (el) {
            const half = el.scrollWidth / 2;
            if (half > 0 && Math.abs(offset.current) >= half) {
              offset.current += half;
            }
            el.style.transform = `translateX(${offset.current}px)`;
          }
        }
      }
      lastTime.current = time;
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    dragging.current = true;
    didDrag.current = false;
    dragStartX.current = e.clientX;
    dragStartOffset.current = offset.current;
    lastTime.current = 0;

    const onMove = (ev: PointerEvent) => {
      if (!dragging.current) return;
      if (Math.abs(ev.clientX - dragStartX.current) > 5) didDrag.current = true;
      offset.current = dragStartOffset.current + (ev.clientX - dragStartX.current);
      if (marqueeRef.current) {
        marqueeRef.current.style.transform = `translateX(${offset.current}px)`;
      }
    };
    const onUp = () => {
      dragging.current = false;
      lastTime.current = 0;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, []);

  return (
    <div className="hv2-page-glow relative overflow-x-hidden bg-[#fbf7f4] text-[#1a1a1a]">
      {/* ────────────── HERO (B2C) ────────────── */}
      <section className="relative z-10 mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 content-center items-center gap-10 px-8 pt-[132px] pb-[100px] max-[1100px]:px-8 max-md:gap-4 max-md:pt-20 max-md:pb-16 lg:grid-cols-[1fr_auto] lg:gap-[72px]">
        <div className="max-md:text-center">
          <h1 className="mb-6 text-[clamp(40px,4.6vw,60px)] font-bold leading-[1.06] tracking-[-0.025em] max-md:mb-4 max-md:text-[34px] max-md:leading-[1.1]">
            Catering for big events,{" "}
            <span className="font-medium text-[#fa43ad]">zero&nbsp;effort.</span>
          </h1>
          <div className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c9277f] max-md:mb-4 max-md:text-[10px]">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M12 0 L13.4 9.6 L24 12 L13.4 14.4 L12 24 L10.6 14.4 L0 12 L10.6 9.6 Z" />
            </svg>
            AI-assisted from start to finish
          </div>
          <p className="mb-9 max-w-[490px] text-[19px] leading-[1.5] text-[#4a4845] max-md:mx-auto max-md:mb-4 max-md:text-[13.5px]">
            Tell us what you&apos;re hosting — we&apos;ll suggest the menu, price it, and
            deliver.
          </p>
          <div className="flex flex-wrap items-center gap-3 max-md:justify-center">
            <a className={BTN_PRIMARY} href="/event-order">
              Plan your event
            </a>
            <a className={BTN_GHOST} href="#business">
              AI catering for your venue
            </a>
          </div>
        </div>

        {/* ── Hero animation + floating decorations ── */}
        <div className="hv2-iframe-stage relative" aria-hidden="true">
          <iframe
            src="/animations/home-hero.html"
            title="Swift catering demo"
            loading="lazy"
          />

          {/* Truck — bottom-right */}
          <div
            className="hv2-deco pointer-events-none absolute -bottom-2.5 -right-[52px] z-[2] w-[124px] text-[#fa43ad] drop-shadow-[0_14px_28px_rgba(250,67,173,0.28)]"
            style={{ "--rot": "-10deg", "--bob-dur": "6.2s", "--bob-delay": "1.4s" } as CSSProperties}
          >
            <svg
              viewBox="0 0 96 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
              className="block h-auto w-full"
            >
              <ellipse cx="48" cy="53" rx="42" ry="2" fill="currentColor" opacity=".15" stroke="none" />
              <rect x="3" y="6" width="56" height="32" rx="3" strokeWidth="2.5" />
              <line x1="3" y1="22" x2="59" y2="22" strokeWidth="1" opacity=".4" />
              <path
                d="M59 16 L77 16 L87 28 L87 38 L59 38"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path d="M63 18 L77 18 L83 27 L63 27 Z" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="20" cy="44" r="6" fill="currentColor" stroke="none" />
              <circle cx="73" cy="44" r="6" fill="currentColor" stroke="none" />
              <circle cx="20" cy="44" r="2" fill="white" stroke="none" />
              <circle cx="73" cy="44" r="2" fill="white" stroke="none" />
            </svg>
          </div>
        </div>
      </section>

      {/* ────────────── SOCIAL PROOF ────────────── */}
      <section className="relative z-10 border-y border-[#e8e2da] py-10 overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-8 max-md:px-6">
          <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[#8a8580]">
            Trusted by
          </p>
          <div
            ref={containerRef}
            className="marquee-container cursor-grab active:cursor-grabbing select-none"
            onPointerDown={onPointerDown}
            onMouseMove={onMarqueeMouseMove}
            onMouseEnter={() => { paused.current = true; lastTime.current = 0; }}
            onMouseLeave={() => { paused.current = false; lastTime.current = 0; setClosestIdx(null); }}
          >
            <div ref={marqueeRef} className="flex items-center will-change-transform">
              {[...SOCIAL_LOGOS, ...SOCIAL_LOGOS, ...SOCIAL_LOGOS, ...SOCIAL_LOGOS].map(
                (logo, idx) => (
                  <a
                    key={idx}
                    href={logo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    draggable={false}
                    onClickCapture={(e) => { if (didDrag.current) e.preventDefault(); }}
                    className={`mx-10 flex shrink-0 items-center transition-opacity duration-200 ${closestIdx !== null ? (closestIdx === idx ? "opacity-100" : "opacity-30") : ""}`}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={120}
                      height={40}
                      draggable={false}
                      className="pointer-events-none h-8 w-auto object-contain max-md:h-6"
                    />
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────── HOW IT WORKS ────────────── */}
      <section
        id="how"
        className="relative z-10 mx-auto max-w-[1280px] px-8 py-24 max-md:px-6 max-md:py-16"
      >
        <div className={SECTION_EYEBROW}>How it works</div>
        <h2 className="mb-[72px] max-w-[720px] text-[clamp(36px,4.2vw,56px)] font-medium leading-[1.06] tracking-[-0.022em] max-md:mb-12 max-md:text-[26px]">
          From <em className="italic text-[#fa43ad]">&ldquo;I need lunch for 50&rdquo;</em>{" "}
          to a confirmed order — in a single conversation.
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[
            {
              num: "01",
              title: "Tell us what you need",
              body:
                "Headcount, dietary needs, budget, the vibe. A quick chat — no forms, no menus to scroll, no quote requests.",
            },
            {
              num: "02",
              title: "Get a tailored menu",
              body:
                "Swift suggests dishes from real local kitchens, sized and priced for your crowd. Swap, edit, or approve in one tap.",
            },
            {
              num: "03",
              title: "Confirm and we deliver",
              body:
                "One tap locks it in. We coordinate the kitchen and the driver — you get on with hosting.",
            },
          ].map(({ num, title, body }) => (
            <div key={num} className={STEP_CARD}>
              <div className="mb-6 text-[56px] font-medium italic leading-none tracking-[-0.03em] text-[#fa43ad] opacity-90">
                {num}
              </div>
              <h3 className="mb-3 text-[23px] font-semibold tracking-[-0.012em]">{title}</h3>
              <p className="text-[15px] leading-[1.6] text-[#4a4845]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────── FEATURE DEMOS (reused) ────────────── */}
      <div className="relative z-10">
        <FeatureDemosSection />
      </div>

      {/* ────────────── B2B BAND ────────────── */}
      <div className="relative z-10 border-y border-[#e8e2da] bg-white">
        <section
          id="business"
          className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-14 px-8 py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-[72px] max-md:py-18 max-md:px-6"
        >
          <div>
            <div className={SECTION_EYEBROW}>For workspaces, offices &amp; venues</div>
            <h2 className="mb-[22px] text-[clamp(36px,4.5vw,56px)] font-medium leading-[1.05] tracking-[-0.022em] max-md:text-[26px]">
              Add Nibble to <em className="italic text-[#fa43ad]">your</em> site. In one line.
            </h2>
            <p className="mb-8 max-w-[500px] text-[17px] leading-[1.55] text-[#4a4845]">
              Give members, teams, or guests a way to order catering right from your
              coworking space, office, or venue website.
            </p>
            <ul className="mb-9 flex flex-col gap-3.5">
              {[
                ["Easy to integrate.", "Install the package, drop in the component — minimal code, no complex setup."],
                ["Your brand, your colours.", "Customise the widget to match your site's look and feel."],
                [
                  "AI handles the hard parts.",
                  "Menu suggestions, sizing for headcount, and real-time pricing.",
                ],
                ["Free to get started.", "No setup fee, no monthly cost. Get up and running in minutes."],
              ].map(([lead, rest]) => (
                <li
                  key={lead}
                  className="hv2-check relative pl-8 text-[15px] leading-[1.5] text-[#4a4845]"
                >
                  <strong className="mr-1 font-semibold text-[#1a1a1a]">{lead}</strong>
                  {rest}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3 max-md:justify-center">
              <a className={BTN_PRIMARY} href="https://www.npmjs.com/package/@swift-food-services/catering-widget" target="_blank" rel="noopener noreferrer">
                Install Now
              </a>
              <a className={BTN_GHOST} href="/contact">
                Enquire Now
              </a>
            </div>
            <pre className="mt-7 max-w-[560px] overflow-x-auto rounded-xl bg-[#1a1a1a] px-[18px] py-3.5 font-mono text-[12.5px] leading-[1.55] tracking-[-0.005em] text-[#f4efe8]">
              <span className="text-[#8db4e8]">import</span>
              {" { "}CateringWidget{" } "}
              <span className="text-[#8db4e8]">from</span>{" "}
              <span className="text-[#aed68a]">
                &quot;@swift-food-services/catering-widget&quot;
              </span>
              ;{"\n\n"}
              <span className="text-[#8db4e8]">&lt;CateringWidget</span>
              {"\n  "}
              <span className="text-[#f8b1da]">publishableKey</span>=
              <span className="text-[#aed68a]">&quot;pk_…&quot;</span>
              {"\n  "}
              <span className="text-[#f8b1da]">theme</span>={"{{ "}
              <span className="text-[#f8b1da]">primary</span>:{" "}
              <span className="text-[#aed68a]">&quot;#fa43ad&quot;</span>
              {" }}\n"}
              <span className="text-[#8db4e8]">/&gt;</span>
            </pre>
          </div>

          {/* Browser mockup */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-[#e8e2da] bg-white shadow-[0_40px_90px_rgba(60,30,50,0.22),0_1px_3px_rgba(0,0,0,0.06)] max-md:hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-[#e8e2da] bg-gradient-to-b from-[#f4efe8] to-[#ece7df] px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c941]" />
                <span className="mx-auto -translate-x-3 rounded-md border border-[#e8e2da] bg-white px-[22px] py-[5px] text-[12px] tracking-[-0.005em] text-[#8a8580]">
                  atlas.work
                </span>
              </div>
              {/* Site content */}
              <div className="relative min-h-[520px] overflow-hidden bg-[#f9f4ee] max-md:min-h-[460px]">
                {/* Atlas header — always visible */}
                <div className="relative z-30 flex items-center justify-between border-b border-[#ece7df] bg-white px-6 py-3.5">
                  <span className="hv2-site-logo text-[20px] font-semibold tracking-[-0.015em] text-[#1f2937]">
                    Atlas
                  </span>
                  <span className="flex gap-[18px] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6b5946]">
                    <span>Spaces</span>
                    <span>Members</span>
                    <span>Lunch</span>
                  </span>
                </div>

                {/* Slider area: atlas hero ↔ catering widget */}
                <div className="relative h-[465px] overflow-hidden max-md:h-[405px]">
                  {/* Atlas hero page */}
                  <div className="hv2-atlas-page absolute inset-0">
                    <div className="hv2-site-hero relative flex h-full items-end overflow-hidden bg-[linear-gradient(160deg,rgba(15,25,35,0.55),rgba(15,25,35,0.15)),linear-gradient(135deg,#2d4a5e,#1a2e3e)] p-8 text-white">
                      <div className="relative z-10 max-w-[80%]">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-85">
                          MEMBERS-FIRST · 12 LOCATIONS
                        </div>
                        <div className="mb-1.5 text-[32px] font-medium italic leading-[1.05] tracking-[-0.015em] max-md:text-2xl">
                          Where work
                          <br />
                          feels like home.
                        </div>
                        <div className="mb-4 max-w-[280px] text-[13px] leading-[1.4] opacity-90">
                          Hot desks, meeting rooms, and now — team lunches on demand.
                        </div>
                        {/* Animated "Get catering now" CTA */}
                        <button className="hv2-atlas-cta cursor-default inline-flex items-center gap-2 rounded-full bg-[#fa43ad] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(250,67,173,0.4)]">
                          Get catering now →
                        </button>
                      </div>
                    </div>

                    {/* Animated cursor — scoped to the atlas page */}
                    <div className="hv2-atlas-cursor" aria-hidden="true">
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="block h-full w-full">
                        <path
                          d="M5 2 L19 14 L11.5 14.5 L8 22 Z"
                          fill="white"
                          stroke="#1a1a1a"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Catering widget page — slides in from the right after the click */}
                  <div
                    className="hv2-widget-page absolute inset-0 grid grid-cols-[1fr_220px] bg-white max-md:grid-cols-1"
                    aria-hidden="true"
                  >
                    {/* LEFT: catalogue */}
                    <div className="flex flex-col gap-2.5 overflow-hidden p-4 max-md:p-3">
                      {/* Day / session pill */}
                      <div className="flex items-center gap-2">
                        <div className="overflow-hidden rounded border border-[#e8e2da] text-[9px] leading-none">
                          <div className="bg-[#fa43ad] px-2 py-0.5 font-bold tracking-wider text-white">THU</div>
                          <div className="px-2 py-1 text-center text-[13px] font-semibold text-[#1a1a1a]">28</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[12px] font-semibold text-[#1a1a1a]">Lunch Day 1</div>
                          <div className="text-[10px] text-[#8a8580]">12:00 – 12:30 PM</div>
                        </div>
                      </div>

                      {/* Search */}
                      <div className="flex items-center gap-2 rounded-lg border border-[#e8e2da] bg-[#fafafa] px-3 py-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-[#8a8580]">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                        </svg>
                        <span className="text-[11px] text-[#8a8580]">Search restaurants and menu items…</span>
                      </div>

                      {/* "Don't know" banner */}
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-[#ffeaf4] px-3 py-2">
                        <div className="text-[10.5px] leading-tight">
                          <div className="font-semibold text-[#1a1a1a]">Don&apos;t know what to get?</div>
                          <div className="text-[#8a8580]">Look at our bundles.</div>
                        </div>
                        <button className="shrink-0 rounded-full bg-[#fa43ad] px-3 py-1 text-[9.5px] font-semibold text-white">
                          Browse
                        </button>
                      </div>

                      {/* Category icons */}
                      <div className="flex gap-2 overflow-hidden">
                        {[
                          ["🍳", "Breakfast"],
                          ["🥪", "Sandwiches"],
                          ["🍕", "Pizzas"],
                          ["🥡", "Wraps"],
                          ["🥤", "Drinks"],
                          ["🥗", "Healthy"],
                        ].map(([emoji, label]) => (
                          <div key={label} className="flex flex-col items-center gap-1">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4efe8] text-[14px]">
                              {emoji}
                            </div>
                            <span className="text-[8px] text-[#4a4845]">{label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Diet chips */}
                      <div className="flex flex-wrap gap-1">
                        {["Halal", "Vegetarian", "Vegan", "Pescatarian"].map((d) => (
                          <span
                            key={d}
                            className="rounded-full border border-[#e8e2da] px-2 py-0.5 text-[9px] text-[#4a4845]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>

                      {/* Restaurant cards (2x2) */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Asian Delights", rating: "4.0", from: "from-[#fa43ad]", to: "to-[#ff80c7]" },
                          { name: "B Bagel", rating: "4.9", from: "from-[#d4a574]", to: "to-[#e8c89d]" },
                          { name: "Baked Bird", rating: "4.8", from: "from-[#4a6fa5]", to: "to-[#82a6d0]" },
                          { name: "Pho Time", rating: "4.7", from: "from-[#6b7a4c]", to: "to-[#a3b07e]" },
                        ].map((r) => (
                          <div
                            key={r.name}
                            className="overflow-hidden rounded-lg border border-[#e8e2da] bg-white"
                          >
                            <div className={`h-14 bg-gradient-to-br ${r.from} ${r.to}`} />
                            <div className="px-2 py-1.5">
                              <div className="truncate text-[10px] font-semibold text-[#1a1a1a]">
                                {r.name}
                              </div>
                              <div className="text-[9px] text-[#8a8580]">★ {r.rating}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RIGHT: AI chat panel */}
                    <div className="flex flex-col gap-2 border-l border-[#f4efe8] bg-[#fafafa] p-3 max-md:hidden">
                      {/* tabs */}
                      <div className="flex gap-1 rounded-md bg-[#f4efe8] p-0.5 text-[9.5px] font-semibold">
                        <button className="flex-1 rounded-md py-1 text-[#8a8580]">Cart</button>
                        <button className="flex-1 rounded-md bg-white py-1 text-[#1a1a1a] shadow-sm">
                          ✨ AI Chat
                        </button>
                      </div>

                      {/* AI header */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fa43ad] text-[11px] text-white">
                          ✨
                        </span>
                        <div className="leading-tight">
                          <div className="text-[10px] font-semibold text-[#1a1a1a]">AI Assistant</div>
                          <div className="text-[8.5px] text-[#8a8580]">Get menu suggestions</div>
                        </div>
                      </div>

                      {/* User message — fades in after the "send" */}
                      <div className="hv2-user-bubble ml-auto rounded-lg bg-[#fa43ad] px-2.5 py-1 text-[9.5px] text-white">
                        suggest some pizza
                      </div>

                      {/* "AI is typing…" dots — brief */}
                      <div className="hv2-typing-dots flex w-fit items-center gap-1 rounded-lg bg-white px-2.5 py-2 shadow-sm">
                        <span className="block h-1 w-1 rounded-full bg-[#8a8580]" />
                        <span className="block h-1 w-1 rounded-full bg-[#8a8580]" />
                        <span className="block h-1 w-1 rounded-full bg-[#8a8580]" />
                      </div>

                      {/* AI reply — fades in after the dots */}
                      <div className="hv2-ai-bubble rounded-lg bg-white px-2.5 py-1.5 text-[9.5px] leading-snug text-[#1a1a1a] shadow-sm">
                        Here are some pizza options. Do any of these look good?
                      </div>

                      {/* Menu preview — horizontal scrollable card row */}
                      <div className="hv2-menu-preview rounded-lg border border-[#e8e2da] bg-white px-2.5 py-2">
                        <div className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-[#8a8580]">
                          Menu Preview
                        </div>
                        <div className="mb-2 text-[11px] font-semibold text-[#1a1a1a]">Pizza</div>
                        <div className="-mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5">
                          {[
                            ["🍕", "Margherita"],
                            ["🌶️", "Diavola"],
                            ["🧀", "4-Cheese"],
                            ["🍅", "Marinara"],
                          ].map(([emoji, name]) => (
                            <div
                              key={name}
                              className="flex w-[52px] shrink-0 flex-col items-center justify-center rounded-md bg-[#fafafa] px-1 py-1.5"
                            >
                              <span className="text-[18px] leading-none">{emoji}</span>
                              <span className="mt-1 w-full truncate text-center text-[8px] text-[#4a4845]">
                                {name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chat input — pinned just above Checkout */}
                      <div className="hv2-chat-input mt-auto flex items-center gap-1.5 rounded-full border border-[#e8e2da] bg-white px-2.5 py-1.5">
                        <span className="overflow-hidden text-[10px] leading-none text-[#1a1a1a]">
                          <span className="hv2-typewriter">suggest some pizza</span>
                          <span className="hv2-caret" />
                        </span>
                        <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-[#fa43ad] text-[9px] leading-none text-white">
                          ▸
                        </span>
                      </div>

                      {/* Checkout — pinned to the bottom */}
                      <button className="rounded-full bg-[#fa43ad] py-1.5 text-[10px] font-semibold text-white">
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile: Phone mockup (3-page animation) ── */}
            <div className="mx-auto md:hidden" style={{ width: 280 }}>
              <div className="overflow-hidden rounded-[40px] border-[6px] border-[#1a1a1a] bg-[#1a1a1a] shadow-[0_40px_90px_rgba(60,30,50,0.22),0_1px_3px_rgba(0,0,0,0.06)]">
                {/* Dynamic island */}
                <div className="flex items-center justify-center bg-white px-6 pt-2 pb-1">
                  <div className="h-[7px] w-[80px] rounded-full bg-[#1a1a1a]" />
                </div>

                {/* Atlas header */}
                <div className="flex items-center justify-between border-b border-[#ece7df] bg-white px-4 py-2.5">
                  <span className="hv2-site-logo text-[16px] font-semibold tracking-[-0.015em] text-[#1f2937]">
                    Atlas
                  </span>
                  <span className="flex gap-3 text-[9px] font-medium uppercase tracking-[0.12em] text-[#6b5946]">
                    <span>Spaces</span>
                    <span>Members</span>
                    <span>Lunch</span>
                  </span>
                </div>

                {/* Slider area — 3 pages */}
                <div className="relative h-[440px] overflow-hidden bg-[#f9f4ee]">
                  {/* Page 1: Atlas hero */}
                  <div className="hv2-m-atlas absolute inset-0">
                    <div className="hv2-site-hero relative flex h-full items-end overflow-hidden bg-[linear-gradient(160deg,rgba(15,25,35,0.55),rgba(15,25,35,0.15)),linear-gradient(135deg,#2d4a5e,#1a2e3e)] p-6 text-white">
                      <div className="relative z-10">
                        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] opacity-85">
                          MEMBERS-FIRST · 12 LOCATIONS
                        </div>
                        <div className="mb-1 text-[24px] font-medium italic leading-[1.05] tracking-[-0.015em]">
                          Where work
                          <br />
                          feels like home.
                        </div>
                        <div className="mb-3 max-w-[200px] text-[11px] leading-[1.4] opacity-90">
                          Hot desks, meeting rooms, and now — team lunches on demand.
                        </div>
                        <button className="hv2-m-atlas-cta cursor-default inline-flex items-center gap-1.5 rounded-full bg-[#fa43ad] px-4 py-2 text-[11px] font-semibold text-white shadow-[0_4px_14px_rgba(250,67,173,0.4)]">
                          Get catering now →
                        </button>
                      </div>
                    </div>
                    <div className="hv2-m-atlas-cursor" aria-hidden="true">
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="block h-full w-full">
                        <path
                          d="M5 2 L19 14 L11.5 14.5 L8 22 Z"
                          fill="white"
                          stroke="#1a1a1a"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Page 2: Order page with Ask AI bar */}
                  <div className="hv2-m-order absolute inset-0 flex flex-col bg-white">
                    <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3">
                      {/* Day / session pill */}
                      <div className="flex items-center gap-2">
                        <div className="overflow-hidden rounded border border-[#e8e2da] text-[8px] leading-none">
                          <div className="bg-[#fa43ad] px-1.5 py-0.5 font-bold tracking-wider text-white">THU</div>
                          <div className="px-1.5 py-0.5 text-center text-[12px] font-semibold text-[#1a1a1a]">28</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] font-semibold text-[#1a1a1a]">Lunch Day 1</div>
                          <div className="text-[9px] text-[#8a8580]">12:00 – 12:30 PM</div>
                        </div>
                      </div>

                      {/* Search */}
                      <div className="flex items-center gap-2 rounded-lg border border-[#e8e2da] bg-[#fafafa] px-2.5 py-1.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-[#8a8580]">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                        </svg>
                        <span className="text-[10px] text-[#8a8580]">Search restaurants and menu items…</span>
                      </div>

                      {/* "Don't know" banner */}
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-[#ffeaf4] px-2.5 py-1.5">
                        <div className="text-[9.5px] leading-tight">
                          <div className="font-semibold text-[#1a1a1a]">Don&apos;t know what to get?</div>
                          <div className="text-[#8a8580]">Look at our bundles.</div>
                        </div>
                        <button className="shrink-0 rounded-full bg-[#fa43ad] px-2.5 py-0.5 text-[8.5px] font-semibold text-white">
                          Browse
                        </button>
                      </div>

                      {/* Category icons */}
                      <div className="flex gap-1.5 overflow-hidden">
                        {[
                          ["🍳", "Breakfast"],
                          ["🥪", "Sandwiches"],
                          ["🍕", "Pizzas"],
                          ["🥡", "Wraps"],
                          ["🥤", "Drinks"],
                          ["🥗", "Healthy"],
                        ].map(([emoji, label]) => (
                          <div key={label} className="flex flex-col items-center gap-0.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4efe8] text-[12px]">
                              {emoji}
                            </div>
                            <span className="text-[7px] text-[#4a4845]">{label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Diet chips */}
                      <div className="flex flex-wrap gap-1">
                        {["Halal", "Vegetarian", "Vegan", "Pescatarian"].map((d) => (
                          <span
                            key={d}
                            className="rounded-full border border-[#e8e2da] px-1.5 py-0.5 text-[8px] text-[#4a4845]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>

                      {/* Restaurant cards (2×2) */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { name: "Asian Delights", rating: "4.0", from: "from-[#fa43ad]", to: "to-[#ff80c7]" },
                          { name: "B Bagel", rating: "4.9", from: "from-[#d4a574]", to: "to-[#e8c89d]" },
                          { name: "Baked Bird", rating: "4.8", from: "from-[#4a6fa5]", to: "to-[#82a6d0]" },
                          { name: "Pho Time", rating: "4.7", from: "from-[#6b7a4c]", to: "to-[#a3b07e]" },
                        ].map((r) => (
                          <div
                            key={r.name}
                            className="overflow-hidden rounded-lg border border-[#e8e2da] bg-white"
                          >
                            <div className={`h-12 bg-gradient-to-br ${r.from} ${r.to}`} />
                            <div className="px-1.5 py-1">
                              <div className="truncate text-[9px] font-semibold text-[#1a1a1a]">
                                {r.name}
                              </div>
                              <div className="text-[8px] text-[#8a8580]">★ {r.rating}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ask AI bar */}
                    <div className="flex items-center gap-2 border-t border-[#e8e2da] bg-white px-3 py-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e8e2da] text-[12px] text-[#8a8580]">
                        ⋯
                      </span>
                      <button className="hv2-m-ask-ai-btn flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e8e2da] py-1.5 text-[11px] font-semibold text-[#1a1a1a]">
                        <span className="text-[#fa43ad]">✨</span>
                        Ask AI
                        <span className="rounded-full bg-[#fa43ad] px-1.5 py-px text-[8px] font-bold text-white">
                          BETA
                        </span>
                      </button>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e8e2da]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-[#8a8580]">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                        </svg>
                      </span>
                    </div>

                    {/* Cursor */}
                    <div className="hv2-m-order-cursor" aria-hidden="true">
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="block h-full w-full">
                        <path
                          d="M5 2 L19 14 L11.5 14.5 L8 22 Z"
                          fill="white"
                          stroke="#1a1a1a"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Page 3: AI Chat */}
                  <div className="hv2-m-chat absolute inset-0 flex flex-col gap-2.5 bg-[#fafafa] p-3">
                    {/* Back + header */}
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-[#8a8580]">←</span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fa43ad] text-[13px] text-white">
                        ✨
                      </span>
                      <div className="leading-tight">
                        <div className="text-[11px] font-semibold text-[#1a1a1a]">AI Assistant</div>
                        <div className="text-[9px] text-[#8a8580]">Get menu suggestions</div>
                      </div>
                    </div>

                    {/* User message */}
                    <div className="hv2-m-user-bubble ml-auto rounded-lg bg-[#fa43ad] px-3 py-1.5 text-[11px] text-white">
                      suggest some pizza
                    </div>

                    {/* Typing dots */}
                    <div className="hv2-m-typing-dots flex w-fit items-center gap-1 rounded-lg bg-white px-3 py-2.5 shadow-sm">
                      <span className="block h-1.5 w-1.5 rounded-full bg-[#8a8580]" />
                      <span className="block h-1.5 w-1.5 rounded-full bg-[#8a8580]" />
                      <span className="block h-1.5 w-1.5 rounded-full bg-[#8a8580]" />
                    </div>

                    {/* AI reply */}
                    <div className="hv2-m-ai-bubble rounded-lg bg-white px-3 py-2 text-[11px] leading-snug text-[#1a1a1a] shadow-sm">
                      Here are some pizza options. Do any of these look good?
                    </div>

                    {/* Menu preview */}
                    <div className="hv2-m-menu-preview rounded-lg border border-[#e8e2da] bg-white px-3 py-2.5">
                      <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-[#8a8580]">
                        Menu Preview
                      </div>
                      <div className="mb-2 text-[12px] font-semibold text-[#1a1a1a]">Pizza</div>
                      <div className="flex gap-2 overflow-x-auto pb-0.5">
                        {[
                          ["🍕", "Margherita"],
                          ["🌶️", "Diavola"],
                          ["🧀", "4-Cheese"],
                          ["🍅", "Marinara"],
                        ].map(([emoji, name]) => (
                          <div
                            key={name}
                            className="flex w-[52px] shrink-0 flex-col items-center justify-center rounded-md bg-[#f4efe8] px-1.5 py-2"
                          >
                            <span className="text-[20px] leading-none">{emoji}</span>
                            <span className="mt-1 w-full truncate text-center text-[9px] text-[#4a4845]">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat input */}
                    <div className="hv2-m-chat-input mt-auto flex items-center gap-2 rounded-full border border-[#e8e2da] bg-white px-3 py-2">
                      <span className="overflow-hidden text-[11px] leading-none text-[#1a1a1a]">
                        <span className="hv2-m-typewriter">suggest some pizza</span>
                        <span className="hv2-m-caret" />
                      </span>
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#fa43ad] text-[10px] leading-none text-white">
                        ▸
                      </span>
                    </div>

                    {/* Checkout */}
                    <button className="rounded-full bg-[#fa43ad] py-2 text-[11px] font-semibold text-white">
                      Checkout
                    </button>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex items-center justify-center bg-white py-2">
                  <div className="h-[4px] w-[100px] rounded-full bg-[#1a1a1a] opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ────────────── PARTNERS (reused — real-partner proof) ────────────── */}
      <div className="relative z-10">
        <PartnersSection />
      </div>

    </div>
  );
}
