import React from "react";
import MarketCard from "../components/cards/MarketCard";

export default function page() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Markets</h1>
      <div className="flex flex-wrap justify-center gap-4">
        <MarketCard
          image={"/tcr.jpg"}
          imageAlt={"Shoes"}
          title={"Tottenham Court Road"}
          description={
            "Discover the hidden gem under Tottenham Court Road — a vibrant food market serving up bold flavors from London’s best street chefs."
          }
          openingTime="10:00 AM to 08:00 PM"
        />
        <MarketCard
          image={"/goodge.jpg"}
          imageAlt={"Shoes"}
          title={"Goodge Street"}
          description={
            "From sizzling Asian stir-fries to fresh Mediterranean wraps, this market is your go-to spot for fast, affordable, and delicious eats in the heart of the city."
          }
          openingTime="10:00 AM to 08:00 PM"
        />
      </div>
    </div>
  );
}
