"use client";

import { useState, type CSSProperties } from "react";
import FeatureDemosSection from "@/lib/components/containers/FeatureDemosSection";
import PartnersSection from "@/lib/components/containers/PartnersSection";
import "./home-v2.css";

type Audience = "b2c" | "b2b";

// ── Reusable class strings ────────────────────────────────────────
const BTN_PRIMARY =
  "hv2-btn-arrow inline-flex items-center gap-1.5 rounded-full bg-[#fa43ad] px-6 py-[13px] text-[14.5px] font-semibold tracking-[-0.005em] text-white shadow-[0_4px_14px_rgba(250,67,173,0.32)] transition-all hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(250,67,173,0.42)]";

const BTN_GHOST =
  "inline-flex items-center gap-1.5 rounded-full border border-[#e8e2da] bg-transparent px-6 py-[13px] text-[14.5px] font-semibold text-[#1a1a1a] transition-all hover:border-[#8a8580] hover:bg-white";

const TAB_BASE =
  "whitespace-nowrap rounded-full px-[18px] py-[9px] text-[13.5px] font-semibold tracking-[-0.005em] transition-all cursor-pointer";

const TAB_ACTIVE = "bg-[#fa43ad] text-white shadow-[0_2px_10px_rgba(250,67,173,0.28)]";
const TAB_IDLE = "text-[#4a4845] hover:text-[#1a1a1a]";

const META_NUM =
  "mb-0.5 block text-[22px] font-semibold tracking-[-0.015em] text-[#1a1a1a]";

const SECTION_EYEBROW =
  "mb-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c9277f]";

const STEP_CARD =
  "rounded-[22px] border border-[#e8e2da] bg-white px-8 pt-10 pb-9 transition-all hover:-translate-y-[3px] hover:shadow-[0_18px_40px_rgba(60,30,50,0.08)]";

// ── Component ─────────────────────────────────────────────────────
export default function HomeV2Client() {
  const [audience, setAudience] = useState<Audience>("b2c");

  return (
    <div className="hv2-page-glow relative overflow-x-hidden bg-[#fbf7f4] text-[#1a1a1a]">
      {/* ────────────── HERO ────────────── */}
      <section className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-14 px-8 pt-[132px] pb-[100px] max-[1100px]:px-8 max-md:pt-[120px] max-md:pb-20 lg:grid-cols-[1fr_auto] lg:gap-[72px]">
        <div>
          {/* Audience switcher */}
          <div
            role="tablist"
            aria-label="Choose audience"
            className="mb-8 inline-flex rounded-full border border-[#e8e2da] bg-white p-1 shadow-[0_2px_6px_rgba(60,30,50,0.04)]"
          >
            <button
              role="tab"
              aria-selected={audience === "b2c"}
              onClick={() => setAudience("b2c")}
              className={`${TAB_BASE} ${audience === "b2c" ? TAB_ACTIVE : TAB_IDLE}`}
            >
              I&apos;m hosting an event
            </button>
            <button
              role="tab"
              aria-selected={audience === "b2b"}
              onClick={() => setAudience("b2b")}
              className={`${TAB_BASE} ${audience === "b2b" ? TAB_ACTIVE : TAB_IDLE}`}
            >
              Add catering to your site
            </button>
          </div>

          {audience === "b2c" ? (
            <div key="b2c" role="tabpanel" className="hv2-tab-fade">
              <h1 className="mb-6 text-[clamp(40px,4.6vw,60px)] font-bold leading-[1.06] tracking-[-0.025em] max-md:text-[44px]">
                Catering for big events,{" "}
                <span className="font-medium text-[#fa43ad]">zero&nbsp;effort.</span>
              </h1>
              <div className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c9277f]">
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
              <p className="mb-9 max-w-[490px] text-[19px] leading-[1.5] text-[#4a4845] max-md:text-[17px]">
                Tell us what you&apos;re hosting — we&apos;ll suggest the menu, price it, and
                deliver.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a className={BTN_PRIMARY} href="/event-order">
                  Plan your event
                </a>
              </div>
              {/* Hero meta stats — commented out
              <div className="mt-9 flex flex-wrap gap-7 text-[13.5px] text-[#8a8580]">
                <div>
                  <strong className={META_NUM}>~5 min</strong>
                  chat to confirmed
                </div>
                <div>
                  <strong className={META_NUM}>500+</strong>
                  local kitchens
                </div>
                <div>
                  <strong className={META_NUM}>4.9★</strong>
                  avg host rating
                </div>
              </div>
              */}
            </div>
          ) : (
            <div key="b2b" role="tabpanel" className="hv2-tab-fade">
              <h1 className="mb-6 text-[clamp(40px,4.6vw,60px)] font-bold leading-[1.06] tracking-[-0.025em] max-md:text-[44px]">
                Add AI catering to{" "}
                <span className="font-medium text-[#fa43ad]">your&nbsp;site.</span>
              </h1>
              <p className="mb-9 max-w-[490px] text-[19px] leading-[1.5] text-[#4a4845] max-md:text-[17px]">
                Drop our widget into your site — members order team lunches in a chat,
                fulfilled by local kitchens.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a className={BTN_PRIMARY} href="#book-demo">
                  Install Now
                </a>
                <a className={BTN_GHOST} href="#docs">
                  Read the docs
                </a>
              </div>
              <div className="mt-9 flex flex-wrap gap-7 text-[13.5px] text-[#8a8580]">
                <div>
                  <strong className={META_NUM}>1-line</strong>
                  install
                </div>
                <div>
                  <strong className={META_NUM}>50+</strong>
                  partner sites
                </div>
                <div>
                  <strong className={META_NUM}>No</strong>
                  setup fee
                </div>
              </div>
            </div>
          )}
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

      {/* ────────────── HOW IT WORKS ────────────── */}
      <section
        id="how"
        className="relative z-10 mx-auto max-w-[1280px] px-8 py-24 max-md:px-6 max-md:py-16"
      >
        <div className={SECTION_EYEBROW}>How it works</div>
        <h2 className="mb-[72px] max-w-[720px] text-[clamp(36px,4.2vw,56px)] font-medium leading-[1.06] tracking-[-0.022em]">
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
            <h2 className="mb-[22px] text-[clamp(36px,4.5vw,56px)] font-medium leading-[1.05] tracking-[-0.022em]">
              Add AI catering to <em className="italic text-[#fa43ad]">your</em> site. In one line.
            </h2>
            <p className="mb-8 max-w-[500px] text-[17px] leading-[1.55] text-[#4a4845]">
              Give members, teams, or guests a way to order catering right from your
              coworking space, office, or venue website. Chat, suggest, confirm — branded
              to match, powered by our network of local kitchens.
            </p>
            <ul className="mb-9 flex flex-col gap-3.5">
              {[
                ["One-line install.", "A single script tag — no code, no integrations to write."],
                ["Your menu, your brand.", "Match colours, fonts, dietary tags, even the AI's tone."],
                [
                  "AI handles the hard parts.",
                  "Menu suggestions, sizing for headcount, dietary swaps, pricing.",
                ],
                ["Pay only when you sell.", "No setup fee. A small cut on each confirmed order."],
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
            <div className="flex flex-wrap items-center gap-3">
              <a className={BTN_PRIMARY} href="#book-demo">
                Install Now
              </a>
              <a className={BTN_GHOST} href="#docs">
                Read the docs
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
            <div className="overflow-hidden rounded-2xl border border-[#e8e2da] bg-white shadow-[0_40px_90px_rgba(60,30,50,0.22),0_1px_3px_rgba(0,0,0,0.06)]">
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
              <div className="relative min-h-[520px] bg-[#f9f4ee] max-md:min-h-[460px]">
                <div className="flex items-center justify-between border-b border-[#ece7df] bg-white px-6 py-3.5">
                  <span className="hv2-site-logo text-[20px] font-semibold tracking-[-0.015em] text-[#1f2937]">
                    Atlas
                  </span>
                  <span className="flex gap-[18px] text-[11px] font-medium uppercase tracking-[0.12em] text-[#6b5946]">
                    <span>Spaces</span>
                    <span>Members</span>
                    <span>Lunch</span>
                  </span>
                </div>
                <div className="hv2-site-hero relative flex h-80 items-end overflow-hidden bg-[linear-gradient(160deg,rgba(15,25,35,0.55),rgba(15,25,35,0.15)),linear-gradient(135deg,#2d4a5e,#1a2e3e)] p-8 text-white max-md:h-[260px]">
                  <div className="relative z-10 max-w-[80%]">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-85">
                      MEMBERS-FIRST · 12 LOCATIONS
                    </div>
                    <div className="mb-1.5 text-[32px] font-medium italic leading-[1.05] tracking-[-0.015em] max-md:text-2xl">
                      Where work
                      <br />
                      feels like home.
                    </div>
                    <div className="max-w-[280px] text-[13px] leading-[1.4] opacity-90">
                      Hot desks, meeting rooms, and now — team lunches on demand. Chat with
                      our catering AI below.
                    </div>
                  </div>
                </div>
                {/* Floating embedded widget */}
                <div
                  className="hv2-widget-stage absolute right-5 bottom-5 overflow-hidden rounded-[18px] bg-white shadow-[0_24px_50px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.15)] max-md:right-3.5 max-md:bottom-3.5"
                  aria-hidden="true"
                >
                  <div className="absolute -top-2.5 -left-2.5 z-[2] rounded-full bg-[#1a1a1a] px-2.5 py-[5px] text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#fa43ad] align-middle" />
                    Swift inside
                  </div>
                  <iframe
                    src="/animations/home-hero.html"
                    title="Embedded Swift widget on atlas.work"
                    loading="lazy"
                  />
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

      {/* ────────────── STATS ────────────── */}
      <section className="relative z-10 mx-auto max-w-[1280px] px-8 pt-24">
        <div className="hv2-stats-glow relative grid grid-cols-2 gap-8 overflow-hidden rounded-[28px] bg-[#1a1a1a] p-14 text-white lg:grid-cols-4 max-md:p-8">
          {[
            ["~5", "m", "avg chat-to-confirmed time"],
            ["500", "+", "independent kitchens, 14 cities"],
            ["4.9", "★", "avg event rating from hosts"],
            ["1", "-line", "to embed on your own site"],
          ].map(([num, accent, label]) => (
            <div key={label} className="relative z-10">
              <div className="mb-2.5 text-[56px] font-medium leading-none tracking-[-0.025em] max-md:text-[42px]">
                {num}
                <span className="italic text-[#fa43ad]">{accent}</span>
              </div>
              <div className="text-[13.5px] leading-[1.4] text-white/65">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────── FINAL CTA ────────────── */}
      <section className="relative z-10 mx-auto max-w-[880px] px-8 pt-[140px] pb-24 text-center max-md:px-6 max-md:pt-20 max-md:pb-16">
        <h2 className="mb-[22px] text-[clamp(40px,5.2vw,68px)] font-medium leading-[1.04] tracking-[-0.025em]">
          Catering, <em className="italic text-[#fa43ad]">handled.</em>
        </h2>
        <p className="mx-auto mb-10 max-w-[540px] text-[19px] leading-[1.5] text-[#4a4845]">
          Whether you&apos;re ordering lunch for fifty or adding catering to your own
          workspace, office, or venue site — Swift makes it a conversation.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <a className={`${BTN_PRIMARY} !px-7 !py-4 !text-[15.5px]`} href="/event-order">
            Plan your event
          </a>
          <a className={`${BTN_GHOST} !px-7 !py-4 !text-[15.5px]`} href="#business">
            Embed the widget
          </a>
        </div>
        <div className="mt-6.5 text-[13.5px] text-[#8a8580]">
          Run a workspace, office, or venue?{" "}
          <a
            href="#book-demo"
            className="border-b border-dashed border-[#c9277f] font-semibold text-[#c9277f]"
          >
            Book a 15-min demo →
          </a>
        </div>
      </section>
    </div>
  );
}
