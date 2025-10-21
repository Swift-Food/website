"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "../navbar.module.css";

export default function HomeHeroSection() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleButtonClick = () => {
    router.push("/event-order");
  };
  const imageSection = (
    <div
      className={`
      relative rounded-xl overflow-hidden
      lg:basis-[60%] lg:flex-none
      max-lg:w-full max-lg:flex-none max-lg:max-w-md max-lg:mx-auto py-[5%] px-[5%] sm:py-[3%] sm:px-[3%]
      transition-all duration-1000 ease-out
      ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
    `}
      style={{ transitionDelay: "200ms" }}
    >
      <div className="relative w-full aspect-[4/3]">
        <Image
          // src="/blurred-market.png"
          src="/catering.jpg"
          alt="Market"
          fill
          className="object-cover rounded-4xl"
        />
        <div className="absolute bottom-0 right-0 w-[25%] aspect-square rounded-full overflow-hidden translate-y-[18%] translate-x-[18%]">
          <Image
            src="/logo.png"
            alt="Swift Food logo"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );

  const textSection = (
    <div
      className={`
flex flex-col justify-center gap-2 md:gap-4 p-6 max-lg:p-4 max-sm:p-3 max-lg:text-center
    lg:basis-[35%] lg:flex-none
    transition-all duration-1000 ease-out
    ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
  `}
    >
      <div
        className={`text-7xl font-bold text-primary max-lg:text-6xl max-sm:text-4xl ${styles.montFont}`}
      >
        <style jsx>{`
          @keyframes wave {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }
          .wave-1 {
            animation: wave 2s ease-in-out infinite;
            animation-delay: 0s;
          }
          .wave-2 {
            animation: wave 2s ease-in-out infinite;
            animation-delay: 0.2s;
          }
          .wave-3 {
            animation: wave 2s ease-in-out infinite;
            animation-delay: 0.4s;
          }
        `}</style>
        <span className="inline-block wave-1">REAL,</span>
        <br />
        <span className="inline-block wave-2">LOCAL</span>{" "}
        <span className="inline-block wave-3">& FAST</span>
      </div>
      {/* <p
        className={`text-7xl font-bold text-primary max-lg:text-6xl max-sm:text-4xl  ${styles.montFont}`}
      >
        LOCAL,
      </p>
      <p
        className={`text-7xl font-bold text-primary max-lg:text-6xl max-sm:text-4xl  ${styles.montFont}`}
      >
        & FAST
      </p> */}
      <p className="text-primary leading-relaxed text-xl max-lg:text-base max-sm:text-md font-medium">
        WE ALSO SERVE EVENTS OF ANY SIZE - BROWSE THE MENU AND ORDER ONLINE FOR
        EASY DELIVERY!
      </p>
      <div className="max-lg:flex max-lg:justify-center mt-5">
        <button
          onClick={handleButtonClick}
          className="btn btn-primary rounded-full btn-sm text-white w-fit px-12 py-8 text-2xl font-bold tracking-wider border-primary hover:bg-transparent shadow-none"
        >
          ORDER NOW
        </button>
      </div>
    </div>
  );
  return (
    <section className="flex w-full gap-6 max-lg:flex-col max-lg:gap-4 max-sm:gap-3 justify-between items-center bg-secondary py-4 px-4 sm:px-6 lg:px-8 lg:!pr-16">
      <>
        {textSection}
        {imageSection}
      </>
    </section>
  );
}
