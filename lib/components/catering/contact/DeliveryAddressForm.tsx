import { ContactInfo } from "@/types/catering.types";
import AddressAutocomplete from "./AddressAutocomplete";

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
  onClearAddress?: () => void;
  hasValidAddress?: boolean;
}

export default function DeliveryAddressForm({
  formData,
  errors,
  onFieldChange,
  onPlaceSelect,
  onClearAddress,
  hasValidAddress,
}: DeliveryAddressFormProps) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-dark-pink/10 flex items-center justify-center text-dark-pink">
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h4 className="font-bold text-sm tracking-tight text-base-content">
            Delivery Address
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AddressAutocomplete
          onPlaceSelect={onPlaceSelect}
          onClearAddress={onClearAddress}
          error={
            errors.addressLine1?.includes("United Kingdom") ||
            errors.addressLine1?.includes("London")
              ? errors.addressLine1
              : undefined
          }
          hasValidAddress={hasValidAddress}
        />

        <div className="col-span-full">
          <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-widest mb-1.5">
            Address Line 1<span className="text-dark-pink ml-0.5">*</span>
          </label>
          <input
            type="text"
            name="addressLine1"
            required
            value={formData.addressLine1 || ""}
            readOnly
            placeholder="Select from search above"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all ${
              errors.addressLine1 &&
              !errors.addressLine1.includes("United Kingdom") &&
              !errors.addressLine1.includes("London")
                ? "border-error bg-gray-50"
                : "border-base-300 bg-gray-50"
            } text-base-content/70 cursor-not-allowed`}
          />
          {errors.addressLine1 &&
            !errors.addressLine1.includes("United Kingdom") &&
            !errors.addressLine1.includes("London") && (
              <p className="mt-1 text-xs text-error">{errors.addressLine1}</p>
            )}
        </div>

        <div className="col-span-full">
          <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-widest mb-1.5">
            Address Line 2
            <span className="text-[9px] text-base-content/40 ml-2">(Optional)</span>
          </label>
          <input
            type="text"
            name="addressLine2"
            value={formData.addressLine2 || ""}
            onChange={(e) => onFieldChange("addressLine2", e.target.value)}
            placeholder="Apartment, suite, etc."
            className="w-full bg-white border border-base-300 rounded-lg px-4 py-2.5 text-sm text-base-content placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-dark-pink/20 focus:border-dark-pink transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-widest mb-1.5">
            City
          </label>
          <input
            type="text"
            name="city"
            required
            value={formData.city || ""}
            readOnly
            placeholder="Auto-filled"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all ${
              errors.city ? "border-error bg-gray-50" : "border-base-300 bg-gray-50"
            } text-base-content/70 cursor-not-allowed`}
          />
          {errors.city && <p className="mt-1 text-xs text-error">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-base-content/60 uppercase tracking-widest mb-1.5">
            Postcode
          </label>
          <input
            type="text"
            name="zipcode"
            required
            value={formData.zipcode || ""}
            readOnly
            placeholder="Auto-filled"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all ${
              errors.zipcode
                ? "border-error bg-gray-50"
                : "border-base-300 bg-gray-50"
            } text-base-content/70 cursor-not-allowed`}
          />
          {errors.zipcode && (
            <p className="mt-1 text-xs text-error">{errors.zipcode}</p>
          )}
        </div>
      </div>
    </div>
  );
}
