"use client";

import Link from "next/link";
import { MapPin, UserCog } from "lucide-react";
import { AccountOverview } from "@/lib/components/account/OrdersSection";
import { AccountPageShell } from "@/lib/components/account/AccountPageShell";

const LINKS = [
  {
    href: "/account/details",
    icon: UserCog,
    title: "Your details",
    description: "Name, phone, organisation, billing address and your password.",
  },
  {
    href: "/account/addresses",
    icon: MapPin,
    title: "Delivery addresses",
    description: "Save the places you order to and pick one at checkout.",
  },
];

export default function AccountPage() {
  return (
    <AccountPageShell title="Your account">
      <AccountOverview />

      <div className="grid gap-6 sm:grid-cols-2 mt-6">
        {LINKS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.03)] hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary mb-6">
              <Icon size={20} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-widest text-black mb-2">
              {title}
            </h2>
            <p className="text-sm text-gray-400 font-light">{description}</p>
          </Link>
        ))}
      </div>
    </AccountPageShell>
  );
}
