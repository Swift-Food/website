"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  MapPin,
  Loader,
  Star,
  Search,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api-client/auth-client";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";
import { PickupAddress } from "@/types/restaurant.types";
import { loadGoogleMapsScript } from "@/lib/utils/google-maps-loader";
import { GOOGLE_MAPS_CONFIG } from "@/lib/constants/google-maps";

interface PickupAddressesSectionProps {
  restaurantId: string;
  onBack: () => void;
}

const emptyAddress: PickupAddress = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  zipcode: "",
  location: { latitude: 0, longitude: 0 },
};

export const PickupAddressesSection = ({
  restaurantId,
  onBack,
}: PickupAddressesSectionProps) => {
  const [addresses, setAddresses] = useState<PickupAddress[]>([]);
  const [initialAddresses, setInitialAddresses] = useState<PickupAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState<PickupAddress>({ ...emptyAddress });
  const [addressSelected, setAddressSelected] = useState(false);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const initAutocomplete = useCallback(() => {
    if (!autocompleteInputRef.current || !window.google?.maps?.places) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      autocompleteInputRef.current,
      {
        componentRestrictions: { country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION },
        fields: GOOGLE_MAPS_CONFIG.FIELDS,
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.address_components) return;

      let addressLine1 = "";
      let city = "";
      let zipcode = "";
      const latitude = place.geometry?.location?.lat() || 0;
      const longitude = place.geometry?.location?.lng() || 0;

      place.address_components.forEach((component) => {
        const types = component.types;
        if (types.includes("street_number")) {
          addressLine1 = component.long_name;
        }
        if (types.includes("route")) {
          addressLine1 += (addressLine1 ? " " : "") + component.long_name;
        }
        if (types.includes("postal_town") || types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("postal_code")) {
          zipcode = component.long_name;
        }
      });

      setNewAddress((prev) => ({
        ...prev,
        addressLine1,
        city,
        zipcode,
        location: { latitude, longitude },
      }));
      setAddressSelected(true);
    });
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [restaurantId]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(restaurantId)}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("pickup", JSON.stringify(data))
        const existing = data.pickupAddresses || [];
        setAddresses(existing);
        setInitialAddresses(existing);
      }
    } catch (err) {
      console.warn("Failed to load pickup addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      console.log("Addresses sent", JSON.stringify(addresses))
      const response = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(restaurantId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pickupAddresses: addresses }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update pickup addresses");
      }

      setInitialAddresses([...addresses]);
      setSuccess("Pickup addresses updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save pickup addresses");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (showAddForm) {
      loadGoogleMapsScript().then(() => {
        // Small delay to ensure the input ref is attached
        setTimeout(initAutocomplete, 100);
      });
    } else {
      autocompleteRef.current = null;
    }
  }, [showAddForm, initAutocomplete]);

  const handleAddAddress = () => {
    if (!newAddress.name.trim() || !newAddress.addressLine1.trim() || !newAddress.city.trim() || !newAddress.zipcode.trim()) {
      setError("Name, address line 1, city, and zipcode are required");
      return;
    }
    if (!newAddress.location.latitude || !newAddress.location.longitude) {
      setError("Please select an address from the search suggestions to set the location");
      return;
    }
    setAddresses((prev) => [...prev, { ...newAddress, addressLine2: newAddress.addressLine2 || undefined }]);
    setNewAddress({ ...emptyAddress });
    setAddressSelected(false);
    setShowAddForm(false);
    setError("");
  };

  const handleRemove = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setAddresses((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === addresses.length - 1) return;
    setAddresses((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const hasChanges = JSON.stringify(addresses) !== JSON.stringify(initialAddresses);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Pickup Addresses
            </h1>
            <p className="text-gray-600 mt-1">
              Manage where orders can be collected from. The first address is the default.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Address List */}
        <div className="space-y-3 mb-6">
          {addresses.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
              <p>No pickup addresses yet</p>
              <p className="text-sm mt-1">Add your first address below</p>
            </div>
          )}

          {addresses.map((addr, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3"
            >
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === addresses.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{addr.name}</p>
                  {idx === 0 && (
                    <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      <Star size={10} /> Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                {addr.addressLine2 && (
                  <p className="text-sm text-gray-600">{addr.addressLine2}</p>
                )}
                <p className="text-sm text-gray-600">
                  {addr.city}, {addr.zipcode}
                </p>
              </div>

              <button
                onClick={() => handleRemove(idx)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Form */}
        {showAddForm ? (
          <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add New Address</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Main Kitchen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Address *
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={autocompleteInputRef}
                    type="text"
                    placeholder="Start typing an address..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select an address from the dropdown to auto-fill the fields below
                </p>
              </div>

              {addressSelected && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold text-green-800 mb-1">Address selected:</p>
                  <p className="text-sm text-green-900">{newAddress.city}, {newAddress.zipcode}</p>
                  <p className="text-xs text-green-700">
                    Coordinates: {newAddress.location.latitude.toFixed(6)}, {newAddress.location.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={newAddress.addressLine1}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, addressLine1: e.target.value }))
                  }
                  placeholder="Street address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={newAddress.addressLine2 || ""}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      addressLine2: e.target.value,
                    }))
                  }
                  placeholder="Flat, unit, floor (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddAddress}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Add Address
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewAddress({ ...emptyAddress });
                    setAddressSelected(false);
                    setError("");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors mb-6"
          >
            <Plus size={18} />
            Add Pickup Address
          </button>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`w-full sm:w-auto font-semibold py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm ${
            hasChanges && !saving
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <>
              <Loader size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
};
