import Image from "next/image";
import InfoContainer from "./components/containers/InfoContainer";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className="flex w-full h-full gap-4 max-lg:flex-col justify-between">
        <section className="flex-4 relative h-full rounded-xl overflow-hidden">
          {/* <Image
            // fill
            src="/store.jpg"
            width={1400}
            height={1400}
            alt="swift food store"
          /> */}
          <img src={"/store.jpg"} className="w-full h-auto" />
        </section>
        <aside className="flex-1 flex flex-col gap-4 items-center">
          <InfoContainer
            heading="Markets"
            className="relative w-full max-sm:w-[80%]"
          >
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
      <section className="mt-4">
        <div className="w-full shadow-lg rounded-xl p-16">
          <div className="flex flex-col gap-4">
            <label className="text-4xl font-bold max-sm:text-center">
              Track orders to your door
            </label>
            <p className="w-[30%] max-sm:w-full max-sm:text-center">
              Get your favourite food delivered in a flash. You’ll see when your
              rider’s picked up your order, and be able to follow them along the
              way. You’ll get a notification when they’re nearby, too.
            </p>
            <div className="flex gap-4">
              <button>Download on Google Play</button>
              <button>Download on App Store</button>
            </div>
          </div>
        </div>
      </section>
      <section className="flex justify-center items-center mt-4 gap-8 max-sm:flex-col flex-wrap">
        <div className="card bg-base-100 w-96 max-sm:w-full shadow-sm">
          <figure>
            <img
              src="/food-shop.avif"
              alt="Stall"
              className="w-[80%] h-auto"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Partner with us</h2>
            <p>
              Join Deliveroo and reach more customers than ever. We handle
              delivery, so you can focus on the food.
            </p>
            <Link href={'/restaurant'}>
              <div className="card-actions justify-start">
                <button className="btn btn-primary">Get Started</button>
              </div>
            </Link>
          </div>
        </div>
        <div className="card bg-base-100 w-96 max-sm:w-full shadow-sm">
          <figure>
            <img
              src="rider.jpg"
              alt="Shoes"
              className="w-[80%] h-auto"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Ride with us</h2>
            <p>
              Join Deliveroo and receive more orders than ever before. We ensure upmost quality service for our riders.
            </p>
            <Link href={'/rider'}>
              <div className="card-actions justify-start">
                <button className="btn btn-primary">Get Started</button>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
