"use client";

import { AccountPageShell } from "@/lib/components/account/AccountPageShell";
import { ChangePasswordCard } from "@/lib/components/account/ChangePasswordCard";
import { ProfileSection } from "@/lib/components/account/ProfileSection";

export default function AccountDetailsPage() {
  return (
    <AccountPageShell
      title="Your details"
      subtitle="Used to fill in your checkout. Change them here and every future order picks them up."
      backTo={{ label: "Back to account", href: "/account" }}
    >
      <div className="space-y-6">
        <ProfileSection />
        <ChangePasswordCard />
      </div>
    </AccountPageShell>
  );
}
