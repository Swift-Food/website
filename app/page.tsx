import Image from "next/image";
import InfoContainer from "./components/containers/InfoContainer";

export default function Home() {
  return (
    <div className="h-full">
      <section className="flex w-full h-full gap-4 max-lg:flex-col">
        <section className="flex-4 relative h-full rounded-xl overflow-hidden">
          <Image
            fill
            src="/store.jpg"
            className="object-cover w-full h-auto"
            alt="swift food store"
          />
        </section>
        <aside className="flex-1 flex flex-col gap-4">
          <InfoContainer heading="Markets" className="relative">
            <div className="max-sm:block max-lg:flex max-lg:justify-evenly max-lg:mt-6 max-sm:mt-0">
              <div className="relative w-40 h-40 rounded-full bg-primary right-11 border-2 border-black flex justify-center items-center max-sm:relative max-lg:static">
                <div className="w-36 h-36 flex flex-col gap-4 items-center">
                  <h6 className="text-white text-sm font-semibold">
                    Market AAA
                  </h6>
                  <Image
                    src="/sample/dish.png"
                    alt="sample dish"
                    width={115}
                    height={115}
                  />
                </div>
              </div>

              <div className="absolute top-20 right-[-10] w-32 h-32 rounded-full bg-general1 flex justify-center items-center max-sm:absolute max-lg:static">
                <div className="w-32 h-32 flex flex-col gap-4 items-center">
                  <h6 className="text-sm text-primary font-semibold">
                    Market AAA
                  </h6>
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
                      Market AAA
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
          <InfoContainer heading="Catering" className="flex-1" />
        </aside>
      </section>
    </div>
  );
}
