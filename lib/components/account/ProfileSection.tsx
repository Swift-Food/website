"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { AuthAlert } from "./AuthAlert";
import { AuthField } from "./AuthField";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { customerProfileApi } from "@/services/api/customer-profile.api";
import {
  BillingAddress,
  CustomerProfile,
} from "@/types/api/customer-profile.api.types";

const EMPTY_BILLING: BillingAddress = {
  line1: "",
  line2: "",
  city: "",
  postalCode: "",
  country: "",
};

/** A billing address is only worth sending once it has the parts Stripe needs. */
const isBillingComplete = (billing: BillingAddress): boolean =>
  !!billing.line1.trim() &&
  !!billing.city.trim() &&
  !!billing.postalCode.trim() &&
  !!billing.country.trim();

const isBillingEmpty = (billing: BillingAddress): boolean =>
  !Object.values(billing).some((value) => (value ?? "").trim());

export const ProfileSection = () => {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [billing, setBilling] = useState<BillingAddress>(EMPTY_BILLING);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const apply = (data: CustomerProfile) => {
    setProfile(data);
    setFullName(data.fullName ?? "");
    setPhone(data.phone ?? "");
    setOrganization(data.organization ?? "");
    setBilling({ ...EMPTY_BILLING, ...(data.billingAddress ?? {}) });
  };

  useEffect(() => {
    let cancelled = false;
    customerProfileApi
      .get()
      .then((data) => {
        if (!cancelled) apply(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your details.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const billingIncomplete = !isBillingEmpty(billing) && !isBillingComplete(billing);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billingIncomplete) return;
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const updated = await customerProfileApi.update({
        fullName: fullName.trim() || null,
        phone: phone.trim() || null,
        organization: organization.trim() || null,
        billingAddress: isBillingEmpty(billing) ? null : billing,
      });
      apply(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your details.");
    } finally {
      setSaving(false);
    }
  };

  const setBillingField = (field: keyof BillingAddress, value: string) =>
    setBilling((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
      <h2 className="text-xs font-black uppercase tracking-widest text-black mb-2">
        Your details
      </h2>
      <p className="text-sm text-gray-400 font-light mb-8">
        Used to fill in your checkout. Change them here and every future order
        picks them up.
      </p>

      {loading && (
        <div className="py-4 flex justify-center">
          <Loader size={20} className="animate-spin text-gray-300" />
        </div>
      )}

      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <AuthAlert tone="error" message={error} />}
          {saved && <AuthAlert tone="success" message="Your details have been saved." />}

          <AuthField
            label="Full Name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ada Lovelace"
          />

          <AuthField
            label="Email Address"
            type="email"
            readOnly
            value={profile?.email ?? ""}
            className="text-gray-400"
          />

          <AuthField
            label="Phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7700 900123"
          />

          <AuthField
            label="Organisation"
            type="text"
            autoComplete="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Optional"
          />

          <div className="pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-6">
              Billing address
            </p>

            <div className="space-y-8">
              <AuthField
                label="Address Line 1"
                type="text"
                autoComplete="billing address-line1"
                value={billing.line1}
                onChange={(e) => setBillingField("line1", e.target.value)}
                placeholder="1 Example Street"
              />
              <AuthField
                label="Address Line 2"
                type="text"
                autoComplete="billing address-line2"
                value={billing.line2 ?? ""}
                onChange={(e) => setBillingField("line2", e.target.value)}
                placeholder="Optional"
              />
              <AuthField
                label="City"
                type="text"
                autoComplete="billing address-level2"
                value={billing.city}
                onChange={(e) => setBillingField("city", e.target.value)}
                placeholder="London"
              />
              <AuthField
                label="Postcode"
                type="text"
                autoComplete="billing postal-code"
                value={billing.postalCode}
                onChange={(e) => setBillingField("postalCode", e.target.value)}
                placeholder="EC1A 1BB"
              />
              <AuthField
                label="Country"
                type="text"
                autoComplete="billing country-name"
                value={billing.country}
                onChange={(e) => setBillingField("country", e.target.value)}
                placeholder="United Kingdom"
                error={
                  billingIncomplete
                    ? "Fill in line 1, city, postcode and country, or clear them all."
                    : undefined
                }
              />
            </div>
          </div>

          <AuthSubmitButton
            label="Save Details"
            pendingLabel="Saving…"
            pending={saving}
            disabled={billingIncomplete}
          />
        </form>
      )}
    </div>
  );
};
