"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeHeroSection() {
  const router = useRouter();
  const handleButtonClick = () => {
    router.push("/catering");
  };
  const imageSection = (
    <div
    className="
      relative rounded-xl overflow-hidden
      lg:basis-[65%] lg:flex-none
      max-lg:w-full max-lg:flex-none max-lg:max-w-md max-lg:mx-auto
    "
  >
     <div className="relative w-full aspect-[4/3]">
  <Image
    src="/blurred-market.png"
    alt="Market"
    fill
    className="object-cover"
  />
       <div className="absolute bottom-0 right-0 w-[20%] aspect-square rounded-full overflow-hidden">
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
flex flex-col justify-center gap-8 md:gap-12 p-6 max-lg:p-4 max-sm:p-3 max-lg:text-center
    lg:basis-[35%] lg:flex-none
  "
  >
      <h2 className="text-6xl font-bold text-primary max-lg:text-4xl max-sm:text-2xl ">
        REAL, LOCAL & FAST
      </h2>
      <p className="text-primary leading-relaxed text-m max-lg:text-base max-sm:text-sm">
        WE ALSO CATER EVENTS OF ANY SIZE - BROWSE THE MENU AND ORDER ONLINE FOR
        EASY DELIVERY!
      </p>
      <div className="max-lg:flex max-lg:justify-center">
        <button
          onClick={handleButtonClick}
          className="btn btn-primary rounded-full btn-sm text-white w-fit px-8 py-6 text-2xl font-bold"
        >
          ORDER NOW!
        </button>
      </div>
    </div>
  );
  return (
    <section
  className="flex w-full gap-6 max-lg:flex-col max-lg:gap-4 max-sm:gap-3 justify-between items-center bg-secondary py-4 px-4 sm:px-6 lg:px-8 lg:!pr-16"
>

      <>
        {textSection}
        {imageSection}
      </>
    </section>
  );
}
