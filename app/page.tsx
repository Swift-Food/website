import ImageTextSection from "./components/containers/ImageTextSection";
import SectionDivider from "./components/sectionDivider";
import HomeHeroSection from "./components/containers/HomeHeroSection";

export default function Home() {
  return (
    <div>
      <HomeHeroSection />
      {/* <div className="w-full bg-secondary py-12 px-12 flex flex-col lg:flex-row items-center justify-center gap-12">
        <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
          <h1 className="text-4xl font-bold text-primary mb-4">
            REAL,
            <br />
            LOCAL & FAST
          </h1>
          <p className="text-base text-secondary-content mb-6">
            WE ALSO <span className="italic">CATER</span> EVENTS OF ANY SIZE
            <br />
            -BROWSE THE MENU AND ORDER ONLINE
            <br />
            FOR EASY DELIVERY!
          </p>
          <button className="btn bg-primary text-white rounded-full px-8 py-3 font-semibold text-lg  hover:bg-pink-500 transition">
            ORDER NOW
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className={styles.blurredMarketImage}></div>
          <div className="relative">
            <Image
              src="/blurred-market.png"
              alt="Street food market"
              width={400}
              height={250}
              className="rounded-3xl  object-cover"
            />
            <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
              <Image
                src="/logo.png"
                alt="Swift Food logo"
                width={96}
                height={96}
                className="rounded-full bg-white shadow-lg"
              />
            </div>
          </div>
        </div>
      </div> */}
      {/* Hero Section - Responsive like store.jpg */}
      {/* <section className="flex w-full h-full gap-4 max-lg:flex-col justify-between my-8">
        <section className="flex-6 h-full rounded-xl overflow-hidden">
          <div className="relative w-full aspect-[192/139] max-sm:aspect-[16/9]">
            <Image src="/store.jpg" alt="store" fill className="object-cover" />
          </div>
        </section>

        <section className="flex-2 flex flex-col justify-between h-full">
          <aside className="flex-1 flex flex-col gap-4 items-center">
            <Link
              href={"/markets"}
              className="w-full max-sm:w-[80%] flex flex-col items-center"
            >
              <InfoContainer heading="Markets" className="relative max-w-md">
                <section className="relative w-full aspect-[828/647] my-2">
                  <Image src={"/where-operate.jpg"} alt="catering" fill />
                </section>
                <div className="w-full flex justify-center bottom-4 ">
                  <button className="btn btn-primary rounded-full btn-sm text-white">
                    Order Now
                  </button>
                </div>
              </InfoContainer>
            </Link>
            <Link
              href={"/catering"}
              className="w-full max-sm:w-[80%] flex flex-col items-center"
            >
              <InfoContainer
                heading="Catering"
                className="relative w-full max-w-md"
              >
                <section className="relative w-full aspect-[828/647] my-2">
                  <Image src={"/catering.jpg"} alt="catering" fill />
                </section>
                <div className="w-full flex justify-center bottom-4 ">
                  <button className="btn btn-primary rounded-full btn-sm text-white">
                    Order Now
                  </button>
                </div>
              </InfoContainer>
            </Link>
          </aside>
        </section>
      </section> */}

      <section className="w-full bg-primary py-10 px-4">
        <h2
          className="text-center text-white text-4xl font-bold tracking-wide mb-10"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          WHAT MAKES US DIFFERENT?
        </h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          <div className="flex-1 bg-hot-pink rounded-3xl p-8 flex flex-col items-center justify-center min-w-[220px] max-w-xs mx-auto">
            <h3
              className="text-primary font-extrabold text-2xl text-center mb-4"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              MUTIPLE ORDERS,
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
          <div className="flex-1 bg-accent rounded-3xl p-8 flex flex-col items-center justify-center min-w-[220px] max-w-xs mx-auto">
            <h3
              className="text-primary font-extrabold text-2xl text-center mb-4"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              FASTER
              <br />
              DELIVERY
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
          <div className="flex-1 bg-beige rounded-3xl p-8 flex flex-col items-center justify-center min-w-[220px] max-w-xs mx-auto">
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
              EVERYTHING YOU
              <br />
              CRAVE, DELIVERED TOGETHER
              <br />
              IN ONE GO.
            </p>
          </div>
        </div>
      </section>

      {/* Section Dividers and Content - Responsive */}
      {/* <div id="aboutus" className="space-y-8 max-sm:space-y-6">
        <SectionDivider text="What Makes Us Different?" />

        <div className="space-y-12 max-sm:space-y-8">
          <ImageTextSection
            image="/cuisines.jpg"
            imageAlt="Multiple cuisines"
            title="Multiple Cuisines, One Order"
            description="Craving Thai, Mexican, Lebanese all at once? No problem, mix and match dishes from different vendors in a single order."
            className="max-sm:gap-4"
          />

          <ImageTextSection
            image="/local.jpg"
            imageAlt="Local businesses"
            title="Supporting Local Businesses"
            description="We champion independant food stalls and small vendors, bringing their incredible flavours to your doorstep."
            reverse={true}
            className="max-sm:gap-4"
          />

          <ImageTextSection
            image="/affordable.jpg"
            imageAlt="Affordable pricing"
            title="More affordable"
            description="Lower delivery fees means you can enjoy your favourite meals without breaking the bank."
            className="max-sm:gap-4"
          />
        </div>

        <SectionDivider text="The Problem We're Solving" />

        <ImageTextSection
          image="/problem-solve.jpg"
          imageAlt="Problem solving"
          title=""
          description="While big delivery platforms focus on expensive restaurants, we saw a gap in the market—London's vibrant street food scene was missing from delivery apps. At the same time, platforms were becoming too expensive for students and everyday people. That's where Swift Food comes in."
          className="max-sm:gap-4"
        />

        <SectionDivider text="Where We Operate" />

        <ImageTextSection
          image="/where-operate.jpg"
          imageAlt="Operating areas"
          title=""
          description="We're currently serving the Camden area, but we have big plans! Swift Food is scaling across London, bringing its fast, affordable, and diverse food delivery service to more people soon."
          className="max-sm:gap-4"
        />
      </div> */}
    </div>
  );
}
