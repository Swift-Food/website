import Image from "next/image";
import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-16 py-4 max-sm:flex-col max-lg:px-4 max-lg:items-start">
    
      <Link href={'/'}>
        <div className="flex items-center gap-4 cursor-pointer" >
            <Image src="/logo.png" width={60} height={60} alt="swift foods logo" />
            <label className="font-bold text-primary">SWIFT FOOD</label>
        </div>
      </Link>
      <div className="flex gap-4 items-center max-sm:flex-col-reverse max-sm:mt-4">
        <button className="btn btn-md btn-ghost text-primary rounded-full">
          About Us
        </button>
        {/* <button className="btn btn-md btn-outline btn-primary rounded-full">
          Sign up
        </button>
        <button className="btn btn-md btn-outline btn-primary rounded-full">
          Log in
        </button> */}
      </div>
    </nav>
  );
}
