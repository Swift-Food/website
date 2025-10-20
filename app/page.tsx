import Image from "next/image";
// OUR STORY SECTION
function OurStorySection() {
  return (
    <section id="aboutus" className="relative w-full flex flex-col">
      <div className="relative w-full aspect-[16/9]">
        <Image
          src="/pink-blurred-market-with-bird2.png"
          alt="Pink blurred market background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-pink-500/30" />
        <div className="absolute inset-0 max-md:hidden flex items-center justify-end py-8 px-4 sm:px-8">
          <div className="relative z-10 max-w-2xl w-full bg-white rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center shadow-lg">
            <h2
              className="text-pink-500 text-4xl sm:text-5xl font-bold mb-6 tracking-widest text-center"
              style={{ letterSpacing: "0.1em" }}
            >
              OUR STORY
            </h2>
            <p
              className="text-pink-500 text-lg sm:text-xl font-mono text-center whitespace-pre-line"
              style={{ letterSpacing: "0.05em" }}
            >
              Swift Food was created by students for students in London. We
              wanted a faster way to get great local food delivered — without
              the high prices or long waits. <br />
              <br /> We work with independent local businesses, helping support
              the community while giving students more variety and better meals.{" "}
              <br /> <br />
              Our goal is simple: fast delivery, affordable food, and a platform
              that puts local first.
            </p>
          </div>
        </div>
      </div>
      <div className="md:hidden w-full px-4 py-8 bg-base-100">
        <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-8 flex flex-col items-center shadow-lg">
          <h2
            className="text-pink-500 text-3xl font-bold mb-6 tracking-widest text-center"
            style={{ letterSpacing: "0.1em" }}
          >
            OUR STORY
          </h2>
          <p
            className="text-pink-500 text-base font-mono text-center whitespace-pre-line"
            style={{ letterSpacing: "0.05em" }}
          >
            Swift Food was created by students for students in London. We wanted
            a faster way to get great local food delivered — without the high
            prices or long waits. <br /> <br />
            We work with independent local businesses, helping support the
            community while giving students more variety and better meals.{" "}
            <br /> <br />
            Our goal is simple: fast delivery, affordable food, and a platform
            that puts local first.
          </p>
        </div>
      </div>
    </section>
  );
}
// import ImageTextSection from "./components/containers/ImageTextSection";
// import SectionDivider from "./components/sectionDivider";
import HomeHeroSection from "./components/containers/HomeHeroSection";

export default function Home() {
  return (
    <div>
      <HomeHeroSection />
      <div className="bg-primary h-10 w-full" />
      <OurStorySection />
      <section className="w-full bg-base-100 py-10 px-4">
        <div>
          <h2
            className="text-center text-primary text-4xl font-bold tracking-wide mb-10"
            style={{ fontFamily: "IBM Plex Mono, monospace" }}
          >
            WHAT MAKES US DIFFERENT?
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch">
            <div className="w-full md:w-80 bg-hot-pink rounded-3xl p-8 flex flex-col items-center justify-center">
              <h3
                className="text-primary font-extrabold text-2xl text-center mb-4"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                MUTIPLE STORES,
                <br />
                ONE DELIVERY
              </h3>
              <p
                className="text-primary text-center font-mono font-bold"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                EVERYTHING YOU
                <br />
                CRAVE, DELIVERED TOGETHER
                <br />
                IN ONE GO.
              </p>
            </div>
            <div className="w-full md:w-80 bg-accent rounded-3xl p-8 flex flex-col items-center justify-center">
              <h3
                className="text-primary font-extrabold text-2xl text-center mb-4"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                £5 FLAT DELIVERY RATE
              </h3>
              <p
                className="text-primary text-center font-mono font-bold"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                ALL EVENT ORDERS HAVE A
                <br />
                £5 DELIVERY FEE.
                <br />
                NO HIDDEN COSTS.
              </p>
            </div>
            <div className="w-full md:w-80 bg-beige rounded-3xl p-8 flex flex-col items-center justify-center">
              <h3
                className="text-primary font-extrabold text-2xl text-center mb-4"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                SUPPORT LOCAL
                <br />
                FOOD MARKETS
              </h3>
              <p
                className="text-primary text-center font-mono font-bold"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                HELP STREET FOOD VENDORS
                <br />
                AND LOCAL RESTAURANTS
                <br />
                THRIVE IN EVERY ORDER.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
