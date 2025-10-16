"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "../navbar.module.css";

export default function HomeHeroSection() {
  const router = useRouter();
  const handleButtonClick = () => {
    router.push("/catering");
  };
  const imageSection = (
    <div
      className="
      relative rounded-xl overflow-hidden
      lg:basis-[40%] lg:flex-none
      max-lg:w-full max-lg:flex-none max-lg:max-w-md max-lg:mx-auto py-[5%] px-[5%] sm:py-[3%] sm:px-[3%]
    "
    >
      <div className="relative w-full aspect-[4/3]">
        <Image
          // src="/blurred-market.png"
          src="/catering.jpg"
          alt="Market"
          fill
          className="object-cover rounded-4xl"
        />
        <div className="absolute bottom-0 right-0 w-[20%] aspect-square rounded-full overflow-hidden translate-y-[25%] translate-x-[25%]">
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
      className="
flex flex-col justify-center gap-2 md:gap-4 p-6 max-lg:p-4 max-sm:p-3 max-lg:text-center
    lg:basis-[35%] lg:flex-none
  "
    >
      <p
        className={`text-7xl font-bold text-primary max-lg:text-6xl max-sm:text-4xl  ${styles.montFont}`}
      >
        REAL,
      </p>
      <p
        className={`text-7xl font-bold text-primary max-lg:text-6xl max-sm:text-4xl  ${styles.montFont}`}
      >
        LOCAL & FAST
      </p>
      {/* <p
        className={`text-7xl font-bold text-primary max-lg:text-6xl max-sm:text-4xl  ${styles.montFont}`}
      >
        FAST
      </p> */}
      <p className="text-primary leading-relaxed text-xl max-lg:text-base max-sm:text-md font-medium">
        WE ALSO CATER EVENTS OF ANY SIZE - BROWSE THE MENU AND ORDER ONLINE FOR
        EASY DELIVERY!
      </p>
      <div className="max-lg:flex max-lg:justify-center mt-5">
        <button
          onClick={handleButtonClick}
          className="btn btn-primary rounded-full btn-sm text-white w-fit px-12 py-8 text-2xl font-bold tracking-wider"
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
