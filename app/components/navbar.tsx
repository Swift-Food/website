
import React from "react";
import { Menu } from "@deemlol/next-icons";
import Link from "next/link";
import SearchBar from "./searchBar";

function NavbarAction() {
  return (
    <div className="flex gap-4 items-center max-sm:flex-col-reverse max-sm:mt-8 text-black">
      <Link href={"/catering"}>
        <button className="btn btn-md btn-ghost rounded-full">Catering</button>
      </Link>
      <Link href={"/#aboutus"}>
        <button className="btn btn-md btn-ghost rounded-full">About Us</button>
      </Link>
      <Link href={"/contact"}>
        <button className="btn btn-md btn-ghost rounded-full">
          Contact Us
        </button>
      </Link>

      {/* <button className="btn btn-md btn-outline btn-primary rounded-full">
        Sign up
      </button>
      <button className="btn btn-md btn-outline btn-primary rounded-full">
        Log in
      </button> */}
    </div>
  );
}
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-16 py-4 max-lg:px-4 max-lg:items-start bg-secondary gap-5">
      <div className="hidden sm:block w-full max-w-xs">
        <SearchBar />
      </div>
      <Link href={"/"} className="cursor-pointer">
        <div className="flex items-center gap-4 cursor-pointer h-full">
          {/* <Image
            src="/logo.png"
            width={40}
            height={40}
            alt="swift foods logo"
          /> */}
          <label className="font-bold text-primary text-2xl cursor-pointer">
            SWIFT FOOD
          </label>
        </div>
      </Link>
      <div className="visible max-sm:hidden">
        <NavbarAction />
      </div>
      <div className="drawer w-fit hidden max-sm:block">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label className="btn btn-square drawer-button" htmlFor="my-drawer">
            <Menu size={24} color="var(--color-primary)" />
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="h-full bg-white w-[80%]">
            <div className="px-3 mt-4">
              <SearchBar />
            </div>
            <NavbarAction />
          </div>
        </div>
      </div>
    </nav>
  );
}
