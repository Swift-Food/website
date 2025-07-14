import Image from "next/image";
import InfoContainer from "./components/containers/InfoContainer";
import Link from "next/link";
import PatnerCard from "./components/cards/PatnerCard";
import ImageTextSection from "./components/containers/ImageTextSection";
import SectionDivider from "./components/sectionDivider";

export default function Home() {
  return (
    <div className="px-4 max-w-7xl mx-auto">
      {/* Hero Section - Responsive like store.jpg */}
      <section className="flex w-full h-full gap-4 max-lg:flex-col justify-between mb-8">
        <section className="flex-3 relative h-full rounded-xl overflow-hidden">
          <div className="relative w-full aspect-[192/139]">
            <Image
              src="/store.jpg"
              alt="store"
              fill
              className="object-cover"
            />
          </div>
        </section>
        <section className="flex flex-col relative gap-4 flex-1 justify-between h-full">
          <aside className="flex flex-col gap-4 items-center">
            <Link
              href={"/markets"}
              className="w-full max-sm:w-[80%] flex flex-col items-center"
            >
              <InfoContainer heading="Markets" className="relative w-full">
                <div className="max-sm:block max-lg:flex max-lg:justify-evenly max-lg:mt-6 max-sm:mt-0">
                  <div className="relative w-40 h-40 rounded-full bg-primary right-11 border-2 border-black flex justify-center items-center max-sm:relative max-lg:static">
                    <div className="w-36 h-36 flex flex-col gap-4 items-center">
                      <h6 className="text-white text-sm font-semibold">Goodge</h6>
                      <Image
                        src="/sample/dish.png"
                        alt="sample dish"
                        width={115}
                        height={115}
                      />
                    </div>
                  </div>
         
                  <div className="w-full flex justify-center items-center max-sm:w-full max-lg:w-fit"></div>
                  <div className="absolute top-20 right-[-10] w-32 h-32 rounded-full bg-general1 flex justify-center items-center max-sm:absolute max-lg:static">
                    <div className="w-32 h-32 rounded-full bg-primary-light border-2 border-black flex justify-center items-center">
                      <h6 className="text-sm text-primary font-semibold">TCR</h6>
                      <Image
                        src="/sample/dish.png"
                        alt="sample dish"
                        width={100}
                        height={100}
                      />
                    </div>
                  </div>
              

                  <div className="w-full flex justify-center items-center max-sm:w-full max-lg:w-fit">
                    <div className="w-40 h-40 rounded-full bg-primary-light border-2 border-black flex justify-center items-center">
                      <div className="w-36 h-36 flex flex-col gap-4 items-center">
                        <h6 className="text-primary text-sm font-semibold">
                          Coming soon
                        </h6>
                        <Image
                          src="/sample/dish.png"
                          alt="sample dish"
                          width={115}
                          height={115}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full flex justify-center absolute bottom-4 left-0">
                  <button className="btn btn-primary rounded-full btn-sm text-white">
                    Explore More
                  </button>
                </div>
              </InfoContainer>
            </Link>
          </aside>
          <aside className="flex flex-col gap-4 items-center">
              <InfoContainer heading="Catering" className="relative w-full">
                <section className="relative w-full aspect-[192/139]">
                  <Image 
                    src={'/goodge.jpg'}
                    alt = 'catering'
                    fill

                  />
                </section>
                <div className="w-full flex justify-center absolute bottom-4 left-0">
                  <button className="btn btn-primary rounded-full btn-sm text-white">
                    Order Now
                  </button>
                </div>
              </InfoContainer>
    
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
            image="/goodge.jpg" 
            imageAlt="Multiple cuisines" 
            title="Multiple Cuisines, One Order" 
            description="Craving Thai, Mexican, Lebanese all at once? No problem, mix and match dishes from different vendors in a single order."
            className="max-sm:gap-4"
          />
          
          <ImageTextSection 
            image="/goodge.jpg" 
            imageAlt="Local businesses" 
            title="Supporting Local Businesses" 
            description="We champion independant food stalls and small vendors, bringing their incredible flavours to your doorstep." 
            reverse={true}
            className="max-sm:gap-4"
          />
          
          <ImageTextSection 
            image="/goodge.jpg" 
            imageAlt="Affordable pricing" 
            title="More affordable" 
            description="Lower delivery fees means you can enjoy your favourite meals without breaking the bank."
            className="max-sm:gap-4"
          />
        </div>

        <SectionDivider text="The Problem We're Solving" />
        
        <ImageTextSection 
          image="/goodge.jpg" 
          imageAlt="Problem solving" 
          title="" 
          description="While big delivery platforms focus on expensive restaurants, we saw a gap in the market—London's vibrant street food scene was missing from delivery apps. At the same time, platforms like Deliveroo, UberEats, and JustEat were becoming too expensive for students and everyday people. That's where Swift Food comes in."
          className="max-sm:gap-4"
        />
        
        <SectionDivider text="Where We Operate" />
        
        <ImageTextSection 
          image="/goodge.jpg" 
          imageAlt="Operating areas" 
          title="" 
          description="We're currently serving the Camden area, but we have big plans! Swift Food is scaling across London, bringing its fast, affordable, and diverse food delivery service to more people soon."
          className="max-sm:gap-4"
        />
      </div>

      {/* Partner Cards - Responsive */}
      <section className="flex justify-center items-center mt-12 gap-8 max-lg:gap-6 max-sm:flex-col max-sm:gap-4 flex-wrap mb-8">
        <PatnerCard
          image={"/food-shop.png"}
          imageAlt={"Stall"}
          title={"Partner with us"}
          description={
            "Join Swift Food to reach more customers than ever — we handle the delivery, so you can focus on the food."
          }
          buttonTitle={"Get Started"}
          link="/restaurant"
        />
        <PatnerCard
          image={"/rider.png"}
          imageAlt={"Rider"}
          title={"Ride with us"}
          description={
            "Join Swift Food and receive more orders than ever before. We ensure the utmost support and care for our riders."
          }
          buttonTitle={"Get Started"}
          link="/rider"
        />
      </section>
    </div>
  );
}