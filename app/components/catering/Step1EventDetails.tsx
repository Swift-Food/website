"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import Image from "next/image";
import { useCatering } from "@/context/CateringContext";
import { ContactInfo, EventDetails } from "@/types/catering.types";

// Load Google Maps script
declare global {
  interface Window {
    initAutocomplete?: () => void;
  }
}

const EVENT_TYPE_OPTIONS = [
  {
    name: "Corporate Lunch",
    value: "corporate",
    imgSrc: "/event-detail-img/corporate lunch.JPG",
  },
  {
    name: "Student Event",
    value: "student",
    imgSrc: "/event-detail-img/student events.JPG",
  },
  {
    name: "Birthday/Private Party",
    value: "birthday",
    imgSrc: "/event-detail-img/birthdays_private party.JPG",
  },
  {
    name: "Wedding/Celebration",
    value: "wedding",
    imgSrc: "/event-detail-img/wedding_celebrations.JPG",
  },
  {
    name: "Other",
    value: "other",
    imgSrc: "/event-detail-img/other events.JPG",
  },
];

// Generate hours from 6 AM to 11 PM
const HOUR_OPTIONS = Array.from({ length: 18 }, (_, i) => {
  const hour24 = i + 6; // Start from 6 AM
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return {
    label: `${hour12} ${ampm}`,
    value: String(hour24).padStart(2, '0')
  };
});

const MINUTE_OPTIONS = [
  { label: '00', value: '00' },
  { label: '15', value: '15' },
  { label: '30', value: '30' },
  { label: '45', value: '45' },
];

export default function Step1EventDetails() {
  const { eventDetails, setEventDetails, setCurrentStep, selectedRestaurants, contactInfo, setContactInfo } = useCatering();
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);
  
  // Google Places Autocomplete refs
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<EventDetails>(
    eventDetails || {
      eventType: "",
      eventDate: "",
      eventTime: "",
      guestCount: 0,
      specialRequests: "",
      address: "",
    }
  );

  const [addressFormData, setAddressFormData] = useState<ContactInfo>(
    contactInfo || {
      fullName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      zipcode: "",
    }
  );

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Save form data to local storage whenever it changes
  useEffect(() => {
    if (formData.eventDate || formData.eventTime || formData.eventType) {
      localStorage.setItem('catering_event_details', JSON.stringify(formData));
    }
  }, [formData]);

  // Save address form data to local storage whenever it changes
  useEffect(() => {
    if (addressFormData.addressLine1 || addressFormData.city || addressFormData.zipcode) {
      localStorage.setItem('catering_contact_info', JSON.stringify(addressFormData));
    }
  }, [addressFormData]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google?.maps?.places) {
        initializeAutocomplete();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    };

    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return;

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "gb" },
        }
      );

      autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
    };

    loadGoogleMapsScript();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.address_components) return;

    let street = "";
    let city = "";
    let zipcode = "";

    place.address_components.forEach((component) => {
      const types = component.types;

      if (types.includes("street_number")) {
        street = component.long_name + " ";
      }
      if (types.includes("route")) {
        street += component.long_name;
      }
      if (types.includes("locality") || types.includes("postal_town")) {
        city = component.long_name;
      }
      if (types.includes("postal_code")) {
        zipcode = component.long_name;
      }
    });

    setAddressFormData((prev) => ({
      ...prev,
      addressLine1: street.trim(),
      city: city,
      zipcode: zipcode,
    }));
  
    setFormData((prev) => ({
      ...prev,
      address: place.formatted_address || "",
    }));
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date.toISOString().split("T")[0];
  };

  const validateEventDateTime = (date: string, time: string): string | null => {
    if (!date || !time || !selectedRestaurants || selectedRestaurants.length === 0) {
      return null;
    }

    const eventDate = new Date(date);
    const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    for (const restaurant of selectedRestaurants) {
      // Skip if no catering hours configured
      if (!restaurant.cateringOperatingHours) {
        continue;
      }

      const daySchedule = restaurant.cateringOperatingHours.find(
        (schedule) => schedule.day.toLowerCase() === dayOfWeek
      );

      if (!daySchedule || !daySchedule.enabled) {
        return `${restaurant.restaurant_name} does not accept catering orders on ${dayOfWeek}s`;
      }

      if (!daySchedule.open || !daySchedule.close) {
        return `${restaurant.restaurant_name} is closed for catering on ${dayOfWeek}s`;
      }

      // Convert times to minutes for comparison
      const [eventHour, eventMinute] = time.split(':').map(Number);
      const eventTimeMinutes = eventHour * 60 + eventMinute;
      
      const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
      const openMinutes = openHour * 60 + openMinute;
      
      const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);
      const closeMinutes = closeHour * 60 + closeMinute;

      if (eventTimeMinutes < openMinutes || eventTimeMinutes > closeMinutes) {
        return `${restaurant.restaurant_name} only accepts catering orders between ${daySchedule.open} and ${daySchedule.close} on ${dayOfWeek}s`;
      }
    }

    return null;
  };

  const getMaxNoticeHours = () => {
    if (!selectedRestaurants || selectedRestaurants.length === 0) {
      return 48; // Default 48 hours
    }
    
    return Math.max(
      ...selectedRestaurants.map(r => r.minimumDeliveryNoticeHours || 48)
    );
  };

  useEffect(() => {
    if (formData.eventDate && formData.eventTime) {
      const error = validateEventDateTime(formData.eventDate, formData.eventTime);
      setDateTimeError(error);
    } else {
      setDateTimeError(null);
    }
  }, [formData.eventDate, formData.eventTime, selectedRestaurants]);

  // Separate state for hour and minute
  const [selectedHour, setSelectedHour] = useState(() => {
    if (eventDetails?.eventTime) {
      return eventDetails.eventTime.split(':')[0];
    }
    return '';
  });

  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (eventDetails?.eventTime) {
      return eventDetails.eventTime.split(':')[1];
    }
    return '';
  });

  // Update eventTime when hour or minute changes
  const handleTimeChange = (hour: string, minute: string) => {
    if (hour && minute) {
      const timeValue = `${hour}:${minute}`;
      setFormData({ ...formData, eventTime: timeValue });
    } else {
      setFormData({ ...formData, eventTime: '' });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
  
    if (!formData.eventDate) errors.push("Event date is required.");
    if (!formData.eventTime) errors.push("Event time is required.");
    if (!formData.eventType) errors.push("Event type is required.");
    
    // Validate address fields
    if (!addressFormData.addressLine1.trim()) errors.push("Address Line 1 is required.");
    if (!addressFormData.city.trim()) errors.push("City is required.");
    if (!addressFormData.zipcode.trim()) errors.push("Postcode is required.");
  
    // Validate delivery notice
    if (formData.eventDate && formData.eventTime) {
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
      const now = new Date();
      const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const requiredNoticeHours = getMaxNoticeHours();
      
      if (hoursUntilEvent < requiredNoticeHours) {
        errors.push(
          `Please select a date/time at least ${requiredNoticeHours} hours in advance. Your selected restaurants require this notice for your event orders.`
        );
      }
  
      // Validate operating hours
      const operatingHoursError = validateEventDateTime(formData.eventDate, formData.eventTime);
      if (operatingHoursError) {
        errors.push(operatingHoursError);
      }
    }
  
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    // Construct full address
    const fullAddress = `${addressFormData.addressLine1}${addressFormData.addressLine2 ? ', ' + addressFormData.addressLine2 : ''}, ${addressFormData.city}, ${addressFormData.zipcode}`;
    
    // Save both event details and address info
    setEventDetails({ ...formData, address: fullAddress });
    setContactInfo(addressFormData);
    setCurrentStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-block bg-dark-pink text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
          Step 2 of 3
        </div>
        <h1 className="text-4xl font-bold mb-3 text-base-content">
          Event Details
        </h1>
        {/* <div className="mb-4">
          <p className="text-base-content/70">
            We just need a few details before we start building your event order menu.
          </p>
        </div> */}
        <button
          onClick={() => setCurrentStep(1)}
          className="text-dark-pink hover:opacity-80 font-medium flex items-center gap-1 mt-1"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Delivery Date & Time Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Delivery Date & Time
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Select your preferred delivery date and time. Most catering orders require advance notice.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium mb-2">
                Event Date
              </label>

              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  max={getMaxDate()}
                  className="w-full"
                />
              </div>
              {dateTimeError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{dateTimeError}</p>
                </div>
              )}
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium mb-2">
                Event Time
              </label>
              <div className="flex gap-2">
                <select
                  required
                  value={selectedHour}
                  onChange={(e) => {
                    setSelectedHour(e.target.value);
                    handleTimeChange(e.target.value, selectedMinute);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Hour</option>
                  {HOUR_OPTIONS.map((hour) => (
                    <option key={hour.value} value={hour.value}>
                      {hour.label}
                    </option>
                  ))}
                </select>
                <span className="flex items-center text-2xl font-bold text-gray-400">:</span>
                <select
                  required
                  value={selectedMinute}
                  onChange={(e) => {
                    setSelectedMinute(e.target.value);
                    handleTimeChange(selectedHour, e.target.value);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Min</option>
                  {MINUTE_OPTIONS.map((minute) => (
                    <option key={minute.value} value={minute.value}>
                      {minute.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Type of Event Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Type of Event
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {EVENT_TYPE_OPTIONS.map((option) => {
              const isSelected = formData.eventType === option.value;
              return (
                <div
                  key={option.value}
                  onClick={() =>
                    setFormData({ ...formData, eventType: option.value })
                  }
                  className={`
                    cursor-pointer transition-all duration-200 text-center
                    ${
                      isSelected
                        ? "border-dark-pink bg-base-300"
                        : "border-base-300 hover:border-gray-400"
                    }
                  `}
                >
                  {/* Placeholder for the image */}
                  <Image
                    src={option.imgSrc}
                    alt="sample dish"
                    width={170}
                    height={170}
                  />

                  <p className="text-xs pt-2 pb-2 font-medium text-gray-800">
                    {option.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Address Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Delivery Address
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Enter the delivery address for your event.
          </p>

          {/* Google Places Autocomplete Search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-base-content">
              Search the Event Address
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="Start typing to autofill address fields..."
              className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
            />
            {/* <p className="text-xs text-base-content/60 mt-2">
              Select from dropdown to autofill, or enter manually below
            </p> */}
          </div>

          {/* Address Line 1 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-base-content">
              Address Line 1*
            </label>
            <input
              type="text"
              required
              value={addressFormData.addressLine1}
              onChange={(e) =>
                setAddressFormData({ ...addressFormData, addressLine1: e.target.value })
              }
              placeholder="Street address"
              className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
            />
          </div>

          {/* Address Line 2 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-base-content">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              value={addressFormData.addressLine2 || ""}
              onChange={(e) =>
                setAddressFormData({ ...addressFormData, addressLine2: e.target.value })
              }
              placeholder="Apartment, suite, unit, etc."
              className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
            />
          </div>

          {/* City and Zipcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-base-content">
                City*
              </label>
              <input
                type="text"
                required
                value={addressFormData.city}
                onChange={(e) =>
                  setAddressFormData({ ...addressFormData, city: e.target.value })
                }
                placeholder="City"
                className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-base-content">
                Postcode*
              </label>
              <input
                type="text"
                required
                value={addressFormData.zipcode}
                onChange={(e) =>
                  setAddressFormData({ ...addressFormData, zipcode: e.target.value })
                }
                placeholder="Postcode"
                className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            type="submit"
            className="bg-dark-pink text-white py-4 px-12 rounded-full font-bold text-lg hover:bg-pink-700 transition-colors shadow-lg shadow-dark-pink/30"
          >
            Continue to contact details
          </button>
          {/* <p className="text-sm text-gray-500 mt-3">
            You can edit your event details later before submission.
          </p> */}
        </div>
      </form>
    </div>
  );
}