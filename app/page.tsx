import Image from "next/image";
import InfoContainer from "./components/containers/InfoContainer";
import Link from "next/link";
import PatnerCard from "./components/cards/PatnerCard";
export default function Home() {
  return (
    <div>
      <section className="flex w-full h-full gap-4 max-lg:flex-col justify-between">
        <section className="flex-4 relative h-full rounded-xl overflow-hidden">
          <div className="relative w-full aspect-[192/139]">
            <Image
              src="/store.jpg"
              alt="store"
              fill
              className="object-cover" // or object-contain, object-fill
            />
          </div>
        </section>
        <aside className="flex-1 flex flex-col gap-4 items-center">
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

                <div className="absolute top-20 right-[-10] w-32 h-32 rounded-full bg-general1 flex justify-center items-center max-sm:absolute max-lg:static">
                  <div className="w-32 h-32 flex flex-col gap-4 items-center">
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
          {/* <InfoContainer heading="Catering" className="flex-1" /> */}
        </aside>
      </section>
      <section className="mt-4">
        {/* <div className="w-full shadow-lg rounded-xl p-16  bg-primary">
          <div className="flex flex-col gap-4 text-white">
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
        </div> */}
      </section>
      <section className="flex justify-center items-center mt-4 gap-8 max-sm:flex-col flex-wrap">
        <PatnerCard
          image={"/food-shop.png"}
          imageAlt={"Stall"}
          title={"Partner with us"}
          description={
            "Join Swift Foods and reach more customers than ever. We handle delivery, so you can focus on the food"
          }
          buttonTitle={"Get Started"}
          link="/restaurant"
        />
        <PatnerCard
          image={"/rider.png"}
          imageAlt={"Rider"}
          title={"Ride with us"}
          description={
            "Join Swift Food and receive more orders than ever before. We ensure upmost quality service for our riders."
          }
          buttonTitle={"Get Started"}
          link="/rider"
        />
      </section>
    </div>
  );
}
