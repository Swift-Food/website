import React from "react";
import MarketCard from "../components/cards/MarketCard";

export default function page() {
  return (
    <div>
      <div className="flex flex-wrap md:flex-nowrap justify-center gap-6">
        <MarketCard
          image={"/where-operate.jpg"}
          imageAlt={"Shoes"}
          title={"Tottenham Court Road"}
          description={
            "Goodge Pl, London W1T 4SG"
          }
          openingTime="10:00 AM to 08:00 PM"
          stallCount="14"
          cuisineTypes={[]}
          bubbleLayout="scattered"
        />
        <MarketCard
          image={"/goodge-crowd.jpg"}
          imageAlt={"Shoes"}
          title={"Goodge Street"}
          description={
            "79A Tottenham Ct Td London W1T 4TB"
          }
          openingTime="10:00 AM to 08:00 PM"
          stallCount="11"
          cuisineTypes={[]}
          bubbleLayout="grid"
          
        />
        <div className="w-full bg-base-200 rounded-2xl max-w-md items-center flex justify-center"> 
          <h1 className="text-3xl font-bold text-center text-primary p-6">
            More Markets
          </h1>
        </div>
      </div>
    </div>
  );
}
