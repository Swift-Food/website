import Image from "next/image";

export default function HomeHeroSection() {
  const handleButtonClick = () => {};
  const imageSection = (
    <div
      className={`flex-1 relative h-full rounded-xl overflow-hidden max-lg:flex-none max-lg:w-full max-lg:max-w-md max-lg:mx-auto`}
    >
      <div className="relative w-full aspect-[4/3] max-sm:aspect-[16/9] max-lg:max-h-64 max-sm:max-h-48">
        <Image
          src="/blurred-market.png"
          alt="Market"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );

  const textSection = (
    <div
      className={`flex-1 flex flex-col justify-center gap-4 p-6 max-lg:p-4 max-sm:p-3 max-lg:text-center`}
    >
      <h2 className="text-3xl font-bold text-primary max-lg:text-2xl max-sm:text-xl">
        REAL, LOCAL & FAST
      </h2>
      <p className="text-gray-700 leading-relaxed text-m max-lg:text-base max-sm:text-sm">
        WE ALSO CATER EVENTS OF ANY SIZE - BROWSE THE MENU AND ORDER ONLINE FOR
        EASY DELIVERY!
      </p>
      <div className="max-lg:flex max-lg:justify-center">
        <button
          // onClick={handleButtonClick}
          className="btn btn-primary rounded-full btn-sm text-white w-fit max-sm:px-4 max-sm:py-2"
        >
          ORDER NOW!
        </button>
      </div>
    </div>
  );
  return (
    <section
      className={`flex w-full gap-6 max-lg:flex-col max-lg:gap-4 max-sm:gap-3 justify-between items-center max-sm:gap-4 bg-secondary`}
    >
      <>
        {textSection}
        {imageSection}
      </>
    </section>
  );
}
