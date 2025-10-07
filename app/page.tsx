import styles from "./page.module.css";
import Image from "next/image";
import InfoContainer from "./components/containers/InfoContainer";
import Link from "next/link";
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
          <button className="btn bg-primary text-white rounded-full px-8 py-3 font-semibold text-lg shadow-md hover:bg-pink-500 transition">
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
      <section className="flex w-full h-full gap-4 max-lg:flex-col justify-between my-8">
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
                {/* <div className="max-sm:block max-lg:flex max-lg:justify-evenly max-lg:mt-6 max-sm:mt-0"> */}
                {/* <div className="relative w-40 h-40 rounded-full bg-primary right-4 flex items-end justify-center">
                    <div className="w-36 h-36 flex flex-col gap-2 items-center justify-end">
                      <h6 className="text-white text-sm font-semibold text-center leading-tight">
                        Tottenham <br/>
                        Court Road <br/>
                        Market
                        
                      </h6>
                      <Image
                        src="/sample/dish.png"
                        alt="sample dish"
                        width={85}
                        height={85}
                      />
                    </div>
                  </div>

                  <div className="absolute top-20 right-[-2] w-34 h-34 rounded-full bg-[#ffcd5e] flex justify-center items-end max-sm:absolute max-lg:static">
                    <div className="w-32 h-32 flex flex-col gap-2 items-center justify-end">
                      <h6 className="text-sm text-primary font-semibold text-center">
                      More Markets
                      </h6>
                      <Image
                        src="/sample/dish.png"
                        alt="sample dish"
                        width={80}
                        height={80}
                      />
                    </div>
                  </div>

                  <div className="w-full flex justify-center items-center max-sm:w-full max-lg:w-fit">
                    <div className="w-40 h-40 rounded-full bg-secondary flex justify-center items-end">
                      <div className="w-36 h-36 flex flex-col gap-2 items-center">
                        <h6 className="text-primary text-sm font-semibold text-center">
                          Goodge <br/> Street Market
                        </h6>
                        <Image
                          src="/sample/dish.png"
                          alt="sample dish"
                          width={95}
                          height={95}
                        />
                      </div>
                    </div>
                  </div> */}
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
      </section>

      {/* Brand Banner - Responsive */}
      <section className="w-full bg-primary py-6 px-4 my-8 rounded-xl max-sm:py-4 max-sm:px-3">
        <div className="flex items-center gap-6 max-w-6xl mx-auto max-lg:flex-col max-lg:text-center max-lg:gap-4 max-sm:gap-3">
          {/* Left side - Logo and Brand (25%) */}
          <div className="flex-[25%] flex flex-col items-start max-lg:items-center gap-3 max-sm:gap-2">
            {/* Logo and Swift Food */}
            <div className="flex items-center gap-3 max-sm:gap-2">
              <div className="flex flex-col gap-0 leading-none">
                <h2 className="text-white font-bold text-3xl leading-tight max-sm:text-lg">
                  SWIFT
                </h2>
                <h2 className="text-white font-bold text-3xl leading-tight -mt-1 max-sm:text-lg">
                  FOOD
                </h2>
              </div>
              <div className="relative flex-shrink-0">
                <Image
                  src="/white-logo.png"
                  alt="Swift Food Logo"
                  width={128}
                  height={128}
                  className="object-contain max-sm:w-16 max-sm:h-16 max-md:w-20 max-md:h-20"
                />
              </div>
            </div>

            {/* Tagline */}
            <p className="text-white/90 text-sm font-medium max-lg:text-center max-sm:text-xs">
              Fast delivery, fresh food
            </p>
          </div>

          {/* Right side - Main Text (75%) */}
          <div className="flex-[75%] flex items-center">
            <h1 className="text-white font-bold text-4xl leading-tight max-lg:text-3xl max-md:text-2xl max-sm:text-xl max-lg:text-center">
              From the streets where the cars don't reach
            </h1>
          </div>
        </div>
      </section>

      {/* Section Dividers and Content - Responsive */}
      <div id="aboutus" className="space-y-8 max-sm:space-y-6">
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
      </div>
    </div>
  );
}
