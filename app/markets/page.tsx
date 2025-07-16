import React from "react";
import MarketCard from "../components/cards/MarketCard";

export default function page() {
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-4">
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
      </div>
    </div>
  );
}
