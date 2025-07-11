import Image from "next/image";
import Link from "next/link";
import React from "react";

type PartnerCard = {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  buttonTitle: string;
  link: string;
};

export default function PatnerCard(props: PartnerCard) {
  return (
    <div className="card w-96 max-sm:w-full shadow-sm border-2 border-primary">
      <figure>
        <Image
          src={props.image}
          alt={props.imageAlt}
          width={307}
          height={277}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{props.title}</h2>
        <p>{props.description}</p>
        <div className="card-actions justify-start">
          <Link href={props.link}>
            <button className="btn btn-primary">{props.buttonTitle}</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
