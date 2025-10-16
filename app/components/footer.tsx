import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="px-16 max-lg:px-4 bg-beige  text-primary">
      <div className="py-8 flex items-start gap-16 max-lg:gap-4 max-lg:flex-col">
        <section className="flex flex-col gap-2">
          <Link href={"/"}>
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                width={40}
                height={40}
                alt="swift foods logo"
                className="rounded-full"
              />
              <label className="font-bold text-primary">SWIFT FOOD</label>
            </div>
          </Link>
          {/* <p className="text-xs font-extrabold">
            Slogan slogan slogan slogan your{" "}
            <label className="text-primary">Swift Food</label>
          </p> */}
        </section>

        <section className="flex flex-col gap-4">
          {/* <Link href={"/about"}>About Us</Link> */}
          <Link href={"/contact"}>Contact Us</Link>
          {/* <Link href={"/rider"}>Ride With Us</Link> */}
          <Link href={"/restaurant/dashboard"}>Restaurant Dashboard</Link>
        </section>

        <section className="flex flex-col gap-4">
          <Link href={"/privacy"}>Privacy Policy</Link>
          <Link href={"/terms"}>Terms & Conditions</Link>
          <Link href={"/faq"}>FAQs</Link>
        </section>
      </div>
      <div className="py-6 flex justify-end items-center gap-4 max-lg:justify-start">
        <Link
          href={
            "https://www.xiaohongshu.com/user/profile/681a5e79000000000e01e079?xsec_token=YBJMunRjaQm_KF1W5GX9o1s5G_Lry_BjCc5BSfTiBtNNA=&xsec_source=app_share&xhsshare=CopyLink&appuid=5fcaee6e0000000001004ff6&apptime=1753284553&share_id=8a0c750a339f41e7921535a37a5fff01"
          }
        >
          <button className="btn btn-square btn-outline btn-primary rounded-xl p-1">
            <Image
              src={"/socials/social.png"}
              width={40}
              height={40}
              alt="social"
            />
          </button>
        </Link>
        <Link href={"https://www.tiktok.com/@swiftfood_uk"}>
          <button className="btn btn-square btn-outline btn-primary rounded-xl p-1">
            <Image
              src={"/socials/tiktok.png"}
              width={24}
              height={24}
              alt="social"
            />
          </button>
        </Link>
        {/* <Link href={"www.tiktok.com/@swiftfood_uk"}>
          <button className="btn btn-square btn-outline btn-primary rounded-xl p-1">
            <Image
              src={"/socials/youtube.png"}
              width={24}
              height={24}
              alt="social"
            />
          </button>
        </Link> */}
        <Link href={" https://www.instagram.com/swiftfood_uk/"}>
          <button className="btn btn-square btn-outline btn-primary rounded-xl p-1">
            <Image
              src={"/socials/instagram.png"}
              width={24}
              height={24}
              alt="social"
            />
          </button>
        </Link>
      </div>
    </div>
  );
}
