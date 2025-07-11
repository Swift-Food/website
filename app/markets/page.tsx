import React from "react";
import MarketCard from "../components/cards/MarketCard";

export default function page() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Markets</h1>
      <div className="flex flex-wrap justify-center gap-4">
        <MarketCard
          image={"/sample/dish.png"}
          imageAlt={"Shoes"}
          title={"Partner with us"}
          description={
            "Join Swift Foods and reach more customers than ever. We handle delivery, so you can focus on the food"
          }
          openingTime="10:00 AM to 08:00 PM"
        />
        <MarketCard
          image={"/sample/dish.png"}
          imageAlt={"Shoes"}
          title={"Partner with us"}
          description={
            "Join Swift Foods and reach more customers than ever. We handle delivery, so you can focus on the food"
          }
          openingTime="10:00 AM to 08:00 PM"
        />
      </div>
    </div>
  );
}
