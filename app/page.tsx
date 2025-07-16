import Image from "next/image";
import InfoContainer from "./components/containers/InfoContainer";
import Link from "next/link";
import PatnerCard from "./components/cards/PatnerCard";
import ImageTextSection from "./components/containers/ImageTextSection";
import SectionDivider from "./components/sectionDivider";

export default function Home() {
  return (
    <div className="px-4 max-w-7xl mx-md">
      <section className="flex w-full gap-4 max-lg:flex-col justify-between mb-8 min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
        {/* Image Section - Maintain 5:2 ratio */}
        <section className="flex-[5] relative rounded-xl overflow-hidden min-h-[300px] lg:min-h-full">
          <div className="relative w-full h-full">
            <Image
              src="/store.jpg"
              alt="store"
              fill
              className="object-cover"
            />
          </div>
        </section>
        
        {/* Info Container Section - Maintain 5:2 ratio */}
        <section className="flex-[2] flex flex-col justify-between min-h-[400px] lg:min-h-full gap-4">
          <aside className="flex-[1] flex flex-col gap-4 items-center h-full">
            <Link
              href={"/markets"}
              className="w-full max-sm:w-[90%] flex flex-col items-center "
            >
              <InfoContainer heading="Markets" className="relative w-full h-full flex-1">
                <div className="max-sm:block max-md:flex max-md:justify-center max-md:gap-4 max-lg:flex max-lg:justify-evenly max-lg:mt-6 max-sm:mt-0 max-sm:space-y-4 h-full flex flex-col justify-center">

                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-primary mx-auto sm:mx-0 md:right-11 border-2 border-black flex justify-center items-center max-sm:relative max-lg:static overflow-hidden">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex flex-col gap-2 sm:gap-4 items-center">
                      <h6 className="text-white text-xs sm:text-sm font-semibold">TCR</h6>
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                        <Image
                          src="/sample/dish.png"
                          alt="sample dish"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
        
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-primary mx-auto sm:mx-0 md:left-30 border-2 border-black flex justify-center items-center max-sm:relative max-lg:static overflow-hidden">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex flex-col gap-2 sm:gap-4 items-center">
                      <h6 className="text-white text-xs sm:text-sm font-semibold">Goodge</h6>
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                        <Image
                          src="/sample/dish.png"
                          alt="sample dish"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
              

                  <div className="w-full flex justify-center items-center max-sm:w-full max-lg:w-fit">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-primary-light border-2 border-black flex justify-center items-center overflow-hidden">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex flex-col gap-2 sm:gap-4 items-center">
                        <h6 className="text-primary text-xs sm:text-sm font-semibold">
                          Coming soon
                        </h6>
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                          <Image
                            src="/sample/dish.png"
                            alt="sample dish"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full flex justify-center absolute bottom-2 sm:bottom-4 left-0">
                  <button className="btn btn-primary rounded-full btn-xs sm:btn-sm text-white text-xs sm:text-sm">
                    Explore More
                  </button>
                </div>
              </InfoContainer>
            </Link>
          </aside>
          
          <aside className="flex-[1] flex flex-col gap-4 items-center">
            <Link href={'/catering'} className="w-full max-sm:w-[90%] flex flex-col items-center h-full">
              <InfoContainer heading="Catering" className="relative w-full h-full">
                <section className="relative w-full min-h-[120px] sm:min-h-[150px] md:min-h-[200px] ">
                  <Image 
                    src={'/catering.jpg'}
                    alt = 'catering'
                    fill
                 
                  />
                </section>
                <div className="w-full flex justify-center absolute bottom-2 sm:bottom-4 left-0">
                  <button className="btn btn-primary rounded-full btn-xs sm:btn-sm text-white text-xs sm:text-sm">
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
      <div className="space-y-8 max-sm:space-y-6">
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
          description="While big delivery platforms focus on expensive restaurants, we saw a gap in the market—London's vibrant street food scene was missing from delivery apps. At the same time, platforms like Deliveroo, UberEats, and JustEat were becoming too expensive for students and everyday people. That's where Swift Food comes in."
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