import { useState } from "react";
import { ContactInfo } from "@/types/catering.types";
import AddressAutocomplete from "./AddressAutocomplete";
import UCLBuildingSelector from "./UCLBuildingSelector";
import uclBuildings from "@/public/data/ucl-buildings.json";

interface ValidationErrors {
  addressLine1?: string;
  city?: string;
  zipcode?: string;
}

interface DeliveryAddressFormProps {
  formData: ContactInfo;
  errors: ValidationErrors;
  onFieldChange: (field: keyof ContactInfo, value: string) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  hasValidAddress?: boolean;
}

const UK_POSTCODE_REGEX = /^([A-Z]{1,2}\d{1,2}[A-Z]?)\s?(\d[A-Z]{2})$/i;

const validateUKPostcode = (postcode: string): boolean => {
  if (!postcode) return false;
  return UK_POSTCODE_REGEX.test(postcode.trim());
};

export default function DeliveryAddressForm({
  formData,
  errors,
  onFieldChange,
  onPlaceSelect,
  hasValidAddress,
}: DeliveryAddressFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleUCLBuildingSelect = (building: (typeof uclBuildings)[0]) => {
    onFieldChange("addressLine1", building.addressLine1);
    onFieldChange("addressLine2", building.name + ", UCL");
    onFieldChange("city", building.city);
    onFieldChange("zipcode", building.zipcode);
  };

  // Check if section is complete
  const isComplete =
    formData.addressLine1 &&
    formData.city &&
    formData.zipcode &&
    validateUKPostcode(formData.zipcode) &&
    !errors.addressLine1 &&
    !errors.city &&
    !errors.zipcode;

  return (
    <div className="pb-4 mb-4 border-b border-base-300">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-base-content">
            Delivery Address
          </h4>
          {isComplete && (
            <span className="text-xs text-success">✓ Complete</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-base-content/60 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="space-y-3">
          <AddressAutocomplete
            onPlaceSelect={onPlaceSelect}
            error={
              errors.addressLine1?.includes("United Kingdom")
                ? errors.addressLine1
                : undefined
            }
            hasValidAddress={hasValidAddress}
          />

          {/* <UCLBuildingSelector onSelect={handleUCLBuildingSelect} /> */}

          {/* Address Line 1 */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-base-content">
              Address Line 1*
            </label>
            <input
              type="text"
              name="addressLine1"
              required
              value={formData.addressLine1 || ""}
              onChange={(e) => onFieldChange("addressLine1", e.target.value)}
              placeholder="Street address"
              className={`w-full px-3 py-2 text-sm bg-base-200/50 border rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all ${
                errors.addressLine1 &&
                !errors.addressLine1.includes("United Kingdom")
                  ? "border-error"
                  : "border-base-300"
              }`}
            />
            {errors.addressLine1 &&
              !errors.addressLine1.includes("United Kingdom") && (
                <p className="mt-1 text-xs text-error">
                  ✗ {errors.addressLine1}
                </p>
              )}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-base-content">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2 || ""}
              onChange={(e) => onFieldChange("addressLine2", e.target.value)}
              placeholder="Apartment, suite, etc."
              className="w-full px-3 py-2 text-sm bg-base-200/50 border border-base-300 rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
            />
          </div>

          {/* City and Postcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-2 text-base-content">
                City*
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city || ""}
                onChange={(e) => onFieldChange("city", e.target.value)}
                placeholder="City"
                className={`w-full px-3 py-2 text-sm bg-base-200/50 border rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all ${
                  errors.city ? "border-error" : "border-base-300"
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-error">✗ {errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 text-base-content">
                Postcode*
              </label>
              <input
                type="text"
                name="zipcode"
                required
                value={formData.zipcode || ""}
                onChange={(e) => {
                  const newPostcode = e.target.value.toUpperCase();
                  onFieldChange("zipcode", newPostcode);
                }}
                placeholder="SW1A 1AA"
                className={`w-full px-3 py-2 text-sm bg-base-200/50 border rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all ${
                  errors.zipcode ? "border-error" : "border-base-300"
                }`}
              />
              {errors.zipcode && (
                <p className="mt-1 text-xs text-error">✗ {errors.zipcode}</p>
              )}
              {!errors.zipcode &&
                formData.zipcode &&
                validateUKPostcode(formData.zipcode) && (
                  <p className="mt-1 text-xs text-success">✓ Valid postcode</p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
