"use client";

import { Loader } from "lucide-react";
import { AccountPageShell } from "@/lib/components/account/AccountPageShell";
import { AddressBookSection } from "@/lib/components/account/AddressBookSection";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";

export default function AccountAddressesPage() {
  const { user } = useCustomerAuth();

  return (
    <AccountPageShell
      title="Delivery addresses"
      subtitle="Save the places you order to and pick one at checkout instead of typing it out."
      backTo={{ label: "Back to account", href: "/account" }}
    >
      {user?.id ? (
        <AddressBookSection userId={user.id} />
      ) : (
        <div className="py-8 flex justify-center">
          <Loader size={20} className="animate-spin text-gray-300" />
        </div>
      )}
    </AccountPageShell>
  );
}
