import { GOOGLE_MAPS_CONFIG } from "@/lib/constants/google-maps";

export interface ParsedPlace {
  addressLine1: string;
  city: string;
  zipcode: string;
  placeId?: string;
  location: { latitude: number; longitude: number };
}

/**
 * Pulls the parts we store out of a Places result. Returns null when the pick
 * has no components or no coordinates - an address without coordinates cannot
 * be used for delivery-range checks, so it is not worth saving.
 */
export function parsePlaceResult(
  place: google.maps.places.PlaceResult | undefined
): ParsedPlace | null {
  if (!place?.address_components) return null;

  const latitude = place.geometry?.location?.lat();
  const longitude = place.geometry?.location?.lng();
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;

  let addressLine1 = "";
  let city = "";
  let zipcode = "";

  place.address_components.forEach((component) => {
    const { types, long_name: value } = component;
    if (types.includes("street_number")) {
      addressLine1 = value;
    }
    if (types.includes("route")) {
      addressLine1 += (addressLine1 ? " " : "") + value;
    }
    if (types.includes("postal_town") || types.includes("locality")) {
      city = value;
    }
    if (types.includes("postal_code")) {
      zipcode = value;
    }
  });

  if (!addressLine1 || !zipcode) return null;

  return {
    addressLine1,
    city,
    zipcode,
    placeId: place.place_id,
    location: { latitude, longitude },
  };
}

export const AUTOCOMPLETE_OPTIONS = {
  componentRestrictions: { country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION },
  fields: GOOGLE_MAPS_CONFIG.FIELDS,
};
