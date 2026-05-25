"use client";

import "../home-v2/home-v2.css";

const BTN_PRIMARY =
  "hv2-btn-arrow inline-flex items-center gap-1.5 rounded-full bg-[#fa43ad] px-6 py-[13px] text-[14.5px] font-semibold tracking-[-0.005em] text-white shadow-[0_4px_14px_rgba(250,67,173,0.32)] transition-all hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(250,67,173,0.42)] max-md:px-5 max-md:py-2.5 max-md:text-[13px]";

const BTN_GHOST =
  "inline-flex items-center gap-1.5 rounded-full border border-[#e8e2da] bg-transparent px-6 py-[13px] text-[14.5px] font-semibold text-[#1a1a1a] transition-all hover:border-[#8a8580] hover:bg-white max-md:px-5 max-md:py-2.5 max-md:text-[13px]";

const SECTION_EYEBROW =
  "mb-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c9277f]";

const STEP_CARD =
  "rounded-[22px] border border-[#e8e2da] bg-white px-8 pt-10 pb-9 transition-all hover:-translate-y-[3px] hover:shadow-[0_18px_40px_rgba(60,30,50,0.08)]";

export default function BusinessClient() {
  return (
    <div className="hv2-page-glow relative overflow-x-hidden bg-[#fbf7f4] text-[#1a1a1a]">
      {/* ────────────── HERO ────────────── */}
      <section className="relative z-10 mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 content-center items-center gap-10 px-8 pt-[132px] pb-[100px] max-[1100px]:px-8 max-md:gap-6 max-md:pt-20 max-md:pb-16 lg:grid-cols-[1fr_2fr] lg:gap-[72px]">
        <div className="max-md:text-center">
          <div className={SECTION_EYEBROW}>For workspaces, offices &amp; venues</div>
          <h1 className="mb-6 text-[clamp(40px,4.6vw,60px)] font-bold leading-[1.06] tracking-[-0.025em] max-md:mb-4 max-md:text-[30px] max-md:leading-[1.1]">
            Add AI catering to{" "}
            <em className="font-medium italic text-[#fa43ad]">your</em> site.
          </h1>
          <p className="mb-9 max-w-[490px] text-[19px] leading-[1.5] text-[#4a4845] max-md:mx-auto max-md:mb-6 max-md:text-[14px]">
            Give members, teams, or guests a way to order catering right from your
            website. One component, zero backend work.
          </p>
          <div className="flex flex-wrap items-center gap-3 max-md:justify-center">
            <a className={BTN_PRIMARY} href="https://www.npmjs.com/package/@swift-food-services/catering-widget" target="_blank" rel="noopener noreferrer">
              Install Now
            </a>
            <a className={BTN_GHOST} href="/contact">
              Enquire Now
            </a>
          </div>
        </div>

        {/* Browser mockup with animation */}
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
              {/* Atlas header */}
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

              {/* Slider area */}
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
                      <button className="hv2-atlas-cta cursor-default inline-flex items-center gap-2 rounded-full bg-[#fa43ad] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(250,67,173,0.4)]">
                        Get catering now →
                      </button>
                    </div>
                  </div>
                  <div className="hv2-atlas-cursor" aria-hidden="true">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="block h-full w-full">
                      <path d="M5 2 L19 14 L11.5 14.5 L8 22 Z" fill="white" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Catering widget page */}
                <div className="hv2-widget-page absolute inset-0 grid grid-cols-[1fr_220px] bg-white max-md:grid-cols-1" aria-hidden="true">
                  {/* LEFT: catalogue */}
                  <div className="flex flex-col gap-2.5 overflow-hidden p-4 max-md:p-3">
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
                    <div className="flex items-center gap-2 rounded-lg border border-[#e8e2da] bg-[#fafafa] px-3 py-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-[#8a8580]">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                      </svg>
                      <span className="text-[11px] text-[#8a8580]">Search restaurants and menu items…</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-[#ffeaf4] px-3 py-2">
                      <div className="text-[10.5px] leading-tight">
                        <div className="font-semibold text-[#1a1a1a]">Don&apos;t know what to get?</div>
                        <div className="text-[#8a8580]">Look at our bundles.</div>
                      </div>
                      <button className="shrink-0 rounded-full bg-[#fa43ad] px-3 py-1 text-[9.5px] font-semibold text-white">Browse</button>
                    </div>
                    <div className="flex gap-2 overflow-hidden">
                      {[["🍳","Breakfast"],["🥪","Sandwiches"],["🍕","Pizzas"],["🥡","Wraps"],["🥤","Drinks"],["🥗","Healthy"]].map(([emoji,label]) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f4efe8] text-[14px]">{emoji}</div>
                          <span className="text-[8px] text-[#4a4845]">{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["Halal","Vegetarian","Vegan","Pescatarian"].map((d) => (
                        <span key={d} className="rounded-full border border-[#e8e2da] px-2 py-0.5 text-[9px] text-[#4a4845]">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Asian Delights", rating: "4.0", from: "from-[#fa43ad]", to: "to-[#ff80c7]" },
                        { name: "B Bagel", rating: "4.9", from: "from-[#d4a574]", to: "to-[#e8c89d]" },
                        { name: "Baked Bird", rating: "4.8", from: "from-[#4a6fa5]", to: "to-[#82a6d0]" },
                        { name: "Pho Time", rating: "4.7", from: "from-[#6b7a4c]", to: "to-[#a3b07e]" },
                      ].map((r) => (
                        <div key={r.name} className="overflow-hidden rounded-lg border border-[#e8e2da] bg-white">
                          <div className={`h-14 bg-gradient-to-br ${r.from} ${r.to}`} />
                          <div className="px-2 py-1.5">
                            <div className="truncate text-[10px] font-semibold text-[#1a1a1a]">{r.name}</div>
                            <div className="text-[9px] text-[#8a8580]">★ {r.rating}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: AI chat panel */}
                  <div className="flex flex-col gap-2 border-l border-[#f4efe8] bg-[#fafafa] p-3 max-md:hidden">
                    <div className="flex gap-1 rounded-md bg-[#f4efe8] p-0.5 text-[9.5px] font-semibold">
                      <button className="flex-1 rounded-md py-1 text-[#8a8580]">Cart</button>
                      <button className="flex-1 rounded-md bg-white py-1 text-[#1a1a1a] shadow-sm">✨ AI Chat</button>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fa43ad] text-[11px] text-white">✨</span>
                      <div className="leading-tight">
                        <div className="text-[10px] font-semibold text-[#1a1a1a]">AI Assistant</div>
                        <div className="text-[8.5px] text-[#8a8580]">Get menu suggestions</div>
                      </div>
                    </div>
                    <div className="hv2-user-bubble ml-auto rounded-lg bg-[#fa43ad] px-2.5 py-1 text-[9.5px] text-white">suggest some pizza</div>
                    <div className="hv2-typing-dots flex w-fit items-center gap-1 rounded-lg bg-white px-2.5 py-2 shadow-sm">
                      <span className="block h-1 w-1 rounded-full bg-[#8a8580]" />
                      <span className="block h-1 w-1 rounded-full bg-[#8a8580]" />
                      <span className="block h-1 w-1 rounded-full bg-[#8a8580]" />
                    </div>
                    <div className="hv2-ai-bubble rounded-lg bg-white px-2.5 py-1.5 text-[9.5px] leading-snug text-[#1a1a1a] shadow-sm">Here are some pizza options. Do any of these look good?</div>
                    <div className="hv2-menu-preview rounded-lg border border-[#e8e2da] bg-white px-2.5 py-2">
                      <div className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-[#8a8580]">Menu Preview</div>
                      <div className="mb-2 text-[11px] font-semibold text-[#1a1a1a]">Pizza</div>
                      <div className="-mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5">
                        {[["🍕","Margherita"],["🌶️","Diavola"],["🧀","4-Cheese"],["🍅","Marinara"]].map(([emoji,name]) => (
                          <div key={name} className="flex w-[52px] shrink-0 flex-col items-center justify-center rounded-md bg-[#fafafa] px-1 py-1.5">
                            <span className="text-[18px] leading-none">{emoji}</span>
                            <span className="mt-1 w-full truncate text-center text-[8px] text-[#4a4845]">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="hv2-chat-input mt-auto flex items-center gap-1.5 rounded-full border border-[#e8e2da] bg-white px-2.5 py-1.5">
                      <span className="overflow-hidden text-[10px] leading-none text-[#1a1a1a]">
                        <span className="hv2-typewriter">suggest some pizza</span>
                        <span className="hv2-caret" />
                      </span>
                      <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-[#fa43ad] text-[9px] leading-none text-white">▸</span>
                    </div>
                    <button className="rounded-full bg-[#fa43ad] py-1.5 text-[10px] font-semibold text-white">Checkout</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Phone mockup */}
          <div className="mx-auto md:hidden" style={{ width: 280 }}>
            <div className="overflow-hidden rounded-[40px] border-[6px] border-[#1a1a1a] bg-[#1a1a1a] shadow-[0_40px_90px_rgba(60,30,50,0.22),0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-center bg-white px-6 pt-2 pb-1">
                <div className="h-[7px] w-[80px] rounded-full bg-[#1a1a1a]" />
              </div>
              <div className="flex items-center justify-between border-b border-[#ece7df] bg-white px-4 py-2.5">
                <span className="hv2-site-logo text-[16px] font-semibold tracking-[-0.015em] text-[#1f2937]">Atlas</span>
                <span className="flex gap-3 text-[9px] font-medium uppercase tracking-[0.12em] text-[#6b5946]">
                  <span>Spaces</span><span>Members</span><span>Lunch</span>
                </span>
              </div>
              <div className="relative h-[440px] overflow-hidden bg-[#f9f4ee]">
                {/* Page 1: Atlas hero */}
                <div className="hv2-m-atlas absolute inset-0">
                  <div className="hv2-site-hero relative flex h-full items-end overflow-hidden bg-[linear-gradient(160deg,rgba(15,25,35,0.55),rgba(15,25,35,0.15)),linear-gradient(135deg,#2d4a5e,#1a2e3e)] p-6 text-white">
                    <div className="relative z-10">
                      <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] opacity-85">MEMBERS-FIRST · 12 LOCATIONS</div>
                      <div className="mb-1 text-[24px] font-medium italic leading-[1.05] tracking-[-0.015em]">Where work<br />feels like home.</div>
                      <div className="mb-3 max-w-[200px] text-[11px] leading-[1.4] opacity-90">Hot desks, meeting rooms, and now — team lunches on demand.</div>
                      <button className="hv2-m-atlas-cta cursor-default inline-flex items-center gap-1.5 rounded-full bg-[#fa43ad] px-4 py-2 text-[11px] font-semibold text-white shadow-[0_4px_14px_rgba(250,67,173,0.4)]">Get catering now →</button>
                    </div>
                  </div>
                  <div className="hv2-m-atlas-cursor" aria-hidden="true">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="block h-full w-full">
                      <path d="M5 2 L19 14 L11.5 14.5 L8 22 Z" fill="white" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Page 2: Order page */}
                <div className="hv2-m-order absolute inset-0 flex flex-col bg-white">
                  <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3">
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
                    <div className="flex items-center gap-2 rounded-lg border border-[#e8e2da] bg-[#fafafa] px-2.5 py-1.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-[#8a8580]"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
                      <span className="text-[10px] text-[#8a8580]">Search restaurants and menu items…</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-[#ffeaf4] px-2.5 py-1.5">
                      <div className="text-[9.5px] leading-tight">
                        <div className="font-semibold text-[#1a1a1a]">Don&apos;t know what to get?</div>
                        <div className="text-[#8a8580]">Look at our bundles.</div>
                      </div>
                      <button className="shrink-0 rounded-full bg-[#fa43ad] px-2.5 py-0.5 text-[8.5px] font-semibold text-white">Browse</button>
                    </div>
                    <div className="flex gap-1.5 overflow-hidden">
                      {[["🍳","Breakfast"],["🥪","Sandwiches"],["🍕","Pizzas"],["🥡","Wraps"],["🥤","Drinks"],["🥗","Healthy"]].map(([emoji,label]) => (
                        <div key={label} className="flex flex-col items-center gap-0.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4efe8] text-[12px]">{emoji}</div>
                          <span className="text-[7px] text-[#4a4845]">{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["Halal","Vegetarian","Vegan","Pescatarian"].map((d) => (
                        <span key={d} className="rounded-full border border-[#e8e2da] px-1.5 py-0.5 text-[8px] text-[#4a4845]">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: "Asian Delights", rating: "4.0", from: "from-[#fa43ad]", to: "to-[#ff80c7]" },
                        { name: "B Bagel", rating: "4.9", from: "from-[#d4a574]", to: "to-[#e8c89d]" },
                        { name: "Baked Bird", rating: "4.8", from: "from-[#4a6fa5]", to: "to-[#82a6d0]" },
                        { name: "Pho Time", rating: "4.7", from: "from-[#6b7a4c]", to: "to-[#a3b07e]" },
                      ].map((r) => (
                        <div key={r.name} className="overflow-hidden rounded-lg border border-[#e8e2da] bg-white">
                          <div className={`h-12 bg-gradient-to-br ${r.from} ${r.to}`} />
                          <div className="px-1.5 py-1">
                            <div className="truncate text-[9px] font-semibold text-[#1a1a1a]">{r.name}</div>
                            <div className="text-[8px] text-[#8a8580]">★ {r.rating}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-[#e8e2da] bg-white px-3 py-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e8e2da] text-[12px] text-[#8a8580]">⋯</span>
                    <button className="hv2-m-ask-ai-btn flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e8e2da] py-1.5 text-[11px] font-semibold text-[#1a1a1a]">
                      <span className="text-[#fa43ad]">✨</span>Ask AI<span className="rounded-full bg-[#fa43ad] px-1.5 py-px text-[8px] font-bold text-white">BETA</span>
                    </button>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e8e2da]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-[#8a8580]"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
                    </span>
                  </div>
                  <div className="hv2-m-order-cursor" aria-hidden="true">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="block h-full w-full">
                      <path d="M5 2 L19 14 L11.5 14.5 L8 22 Z" fill="white" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Page 3: AI Chat */}
                <div className="hv2-m-chat absolute inset-0 flex flex-col gap-2.5 bg-[#fafafa] p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#8a8580]">←</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fa43ad] text-[13px] text-white">✨</span>
                    <div className="leading-tight">
                      <div className="text-[11px] font-semibold text-[#1a1a1a]">AI Assistant</div>
                      <div className="text-[9px] text-[#8a8580]">Get menu suggestions</div>
                    </div>
                  </div>
                  <div className="hv2-m-user-bubble ml-auto rounded-lg bg-[#fa43ad] px-3 py-1.5 text-[11px] text-white">suggest some pizza</div>
                  <div className="hv2-m-typing-dots flex w-fit items-center gap-1 rounded-lg bg-white px-3 py-2.5 shadow-sm">
                    <span className="block h-1.5 w-1.5 rounded-full bg-[#8a8580]" />
                    <span className="block h-1.5 w-1.5 rounded-full bg-[#8a8580]" />
                    <span className="block h-1.5 w-1.5 rounded-full bg-[#8a8580]" />
                  </div>
                  <div className="hv2-m-ai-bubble rounded-lg bg-white px-3 py-2 text-[11px] leading-snug text-[#1a1a1a] shadow-sm">Here are some pizza options. Do any of these look good?</div>
                  <div className="hv2-m-menu-preview rounded-lg border border-[#e8e2da] bg-white px-3 py-2.5">
                    <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-[#8a8580]">Menu Preview</div>
                    <div className="mb-2 text-[12px] font-semibold text-[#1a1a1a]">Pizza</div>
                    <div className="flex gap-2 overflow-x-auto pb-0.5">
                      {[["🍕","Margherita"],["🌶️","Diavola"],["🧀","4-Cheese"],["🍅","Marinara"]].map(([emoji,name]) => (
                        <div key={name} className="flex w-[52px] shrink-0 flex-col items-center justify-center rounded-md bg-[#f4efe8] px-1.5 py-2">
                          <span className="text-[20px] leading-none">{emoji}</span>
                          <span className="mt-1 w-full truncate text-center text-[9px] text-[#4a4845]">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="hv2-m-chat-input mt-auto flex items-center gap-2 rounded-full border border-[#e8e2da] bg-white px-3 py-2">
                    <span className="overflow-hidden text-[11px] leading-none text-[#1a1a1a]">
                      <span className="hv2-m-typewriter">suggest some pizza</span>
                      <span className="hv2-m-caret" />
                    </span>
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#fa43ad] text-[10px] leading-none text-white">▸</span>
                  </div>
                  <button className="rounded-full bg-[#fa43ad] py-2 text-[11px] font-semibold text-white">Checkout</button>
                </div>
              </div>
              <div className="flex items-center justify-center bg-white py-2">
                <div className="h-[4px] w-[100px] rounded-full bg-[#1a1a1a] opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────── HOW IT WORKS ────────────── */}
      <div className="relative z-10 border-t border-[#e8e2da]">
      <section className="mx-auto max-w-[1280px] px-8 py-24 max-md:px-6 max-md:py-16">
        <div className={SECTION_EYEBROW}>How it works</div>
        <h2 className="mb-[72px] max-w-[720px] text-[clamp(36px,4.2vw,56px)] font-medium leading-[1.06] tracking-[-0.022em] max-md:mb-12 max-md:text-[26px]">
          Live on your site in <em className="italic text-[#fa43ad]">under five minutes.</em>
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[
            {
              num: "01",
              title: "Install the package",
              body: "One npm install. Works with React, Next.js, or any framework that supports components.",
            },
            {
              num: "02",
              title: "Drop in the widget",
              body: "Add a single component to your page. Set your publishable key and brand colours — that's it.",
            },
            {
              num: "03",
              title: "Your users order catering",
              body: "Members browse menus, get AI suggestions, and place orders — all without leaving your site.",
            },
          ].map(({ num, title, body }) => (
            <div key={num} className={STEP_CARD}>
              <div className="mb-6 text-[56px] font-medium italic leading-none tracking-[-0.03em] text-[#fa43ad] opacity-90">{num}</div>
              <h3 className="mb-3 text-[23px] font-semibold tracking-[-0.012em]">{title}</h3>
              <p className="text-[15px] leading-[1.6] text-[#4a4845]">{body}</p>
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* ────────────── WHY SWIFT ────────────── */}
      <section className="relative z-10 border-y border-[#e8e2da] bg-white">
        <div className="mx-auto max-w-[1280px] px-8 py-24 max-md:px-6 max-md:py-16">
          <div className={SECTION_EYEBROW}>Why Swift</div>
          <h2 className="mb-14 max-w-[600px] text-[clamp(36px,4.2vw,56px)] font-medium leading-[1.06] tracking-[-0.022em] max-md:mb-10 max-md:text-[26px]">
            Built for the people who <em className="italic text-[#fa43ad]">run</em> the space.
          </h2>
          <div className="grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2">
            {[
              ["Easy to integrate.", "Install the package, drop in the component — minimal code, no complex setup."],
              ["Your brand, your colours.", "Customise the widget to match your site's look and feel."],
              ["AI handles the hard parts.", "Menu suggestions, sizing for headcount, and real-time pricing — your users just chat."],
              ["Free to get started.", "No setup fee, no monthly cost. Get up and running in minutes."],
              ["Real local kitchens.", "We partner with vetted restaurants across London — no ghost kitchens, no reheated trays."],
            ].map(([lead, rest]) => (
              <div key={lead} className="hv2-check relative pl-8 text-[15px] leading-[1.5] text-[#4a4845]">
                <strong className="mr-1 font-semibold text-[#1a1a1a]">{lead}</strong>
                {rest}
              </div>
            ))}
          </div>
          <div className="mt-14 flex items-center gap-8 rounded-2xl border border-[#e8e2da] bg-[#fbf7f4] px-8 py-6 max-md:flex-col max-md:text-center">
            <img src="/logos/halkin.svg" alt="Halkin" className="h-8 shrink-0 object-contain" />
            <div>
              <p className="text-[15px] font-semibold text-[#1a1a1a]">
                Partnered with Halkin
              </p>
              <p className="text-[14px] leading-[1.5] text-[#4a4845]">
                Trusted by Halkin and other leading workspace operators across London.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────── CODE SNIPPET ────────────── */}
      <section className="relative z-10 mx-auto max-w-[1280px] px-8 py-24 max-md:px-6 max-md:py-16">
        <div className="mx-auto max-w-[640px] text-center">
          <div className={`${SECTION_EYEBROW} text-center`}>Integration</div>
          <h2 className="mb-4 text-[clamp(36px,4.2vw,56px)] font-medium leading-[1.06] tracking-[-0.022em] max-md:text-[26px]">
            Seriously,<br /><em className="italic text-[#fa43ad]">one line.</em>
          </h2>
          <p className="mb-10 text-[17px] leading-[1.55] text-[#4a4845]">
            Import the component, pass your key and brand colour. That&apos;s the entire integration.
          </p>
          <pre className="mx-auto max-w-[560px] overflow-x-auto rounded-xl bg-[#1a1a1a] px-[18px] py-5 text-left font-mono text-[13px] leading-[1.6] tracking-[-0.005em] text-[#f4efe8]">
            <span className="text-[#8db4e8]">import</span>
            {" { "}CateringWidget{" } "}
            <span className="text-[#8db4e8]">from</span>{" "}
            <span className="text-[#aed68a]">&quot;@swift-food-services/catering-widget&quot;</span>
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
      </section>

      {/* ────────────── CTA ────────────── */}
      <section className="relative z-10 border-t border-[#e8e2da] bg-[#3a3a3a]">
        <div className="mx-auto max-w-[1280px] px-8 py-28 text-center max-md:px-6 max-md:py-20">
          <h2 className="mb-4 text-[clamp(36px,4.2vw,56px)] font-medium leading-[1.06] tracking-[-0.022em] text-white max-md:text-[26px]">
            Ready to add catering to your site?
          </h2>
          <p className="mx-auto mb-9 max-w-[500px] text-[17px] leading-[1.55] text-[#a8a4a0]">
            Free to set up. Live in minutes.
            <br />
            No commitments.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a className={BTN_PRIMARY} href="https://www.npmjs.com/package/@swift-food-services/catering-widget" target="_blank" rel="noopener noreferrer">
              Install Now
            </a>
            <a className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white px-6 py-[13px] text-[14.5px] font-semibold text-[#1a1a1a] transition-all hover:bg-[#f0f0f0] max-md:px-5 max-md:py-2.5 max-md:text-[13px]" href="/contact">
              Talk to us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
