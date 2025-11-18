import { useEffect, useRef } from 'react';
import { ContactFormData } from '../types/contact-form.dto';
import { GOOGLE_MAPS_CONFIG } from '@/lib/constants/google-maps';
import { loadGoogleMapsScript } from '@/lib/utils/google-maps-loader';

interface AddressAutocompleteResult {
  addressLine1: string;
  city: string;
  zipcode: string;
  latitude: number;
  longitude: number;
}

export function useAddressAutocomplete(
  onPlaceSelect: (address: AddressAutocompleteResult) => void
) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        console.error('Google Maps Places not available');
        return;
      }

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION },
        fields: GOOGLE_MAPS_CONFIG.FIELDS,
      });

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    };

    loadGoogleMapsScript().then(initAutocomplete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();

    if (!place || !place.address_components) {
      console.error('No place data received');
      return;
    }

    let addressLine1 = '';
    let city = '';
    let zipcode = '';
    const latitude = place.geometry?.location?.lat() || 0;
    const longitude = place.geometry?.location?.lng() || 0;

    place.address_components.forEach((component) => {
      const types = component.types;

      if (types.includes('street_number')) {
        addressLine1 = component.long_name;
      }
      if (types.includes('route')) {
        addressLine1 += (addressLine1 ? ' ' : '') + component.long_name;
      }
      if (types.includes('postal_town') || types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('postal_code')) {
        zipcode = component.long_name;
      }
    });

    onPlaceSelect({
      addressLine1,
      city,
      zipcode,
      latitude,
      longitude,
    });
  };

  return { inputRef };
}
