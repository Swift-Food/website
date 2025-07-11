import Image from "next/image";
import React from "react";

type MarketCard = {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  openingTime: string;
};

export default function MarketCard(props: MarketCard) {
  return (
    <div className="card bg-base-100 w-96 max-sm:w-full shadow-sm border-2 border-primary">
      <figure className="h-[277px] overflow-hidden relative">
        <Image
          src={props.image}
          alt={props.imageAlt}
          fill
          style={{
            objectFit: "cover",
          }}
        />
      </figure>
      <div className="card-body bg-primary text-white">
        <h2 className="card-title">{props.title}</h2>
        <p>{props.description}</p>
        <div className="card-actions justify-start">
          <div className="p-4 pl-0">
            <p className="text-base font-medium">Opening Hours</p>
            <label className="text-gray text-md">{props.openingTime}</label>
          </div>
        </div>
      </div>
    </div>
  );
}
