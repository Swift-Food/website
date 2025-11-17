"use client";

import CorporateLoginModal from "@/app/components/modals/CorporateLoginModal";
import { useState, FormEvent, useEffect, useRef } from "react";
import Image from "next/image";
import { useCatering } from "@/context/CateringContext";
import { restaurantApi } from "@/app/api/restaurantApi";
import {
  ContactInfo,
  CorporateUser,
  CorporateUserRole,
  EventDetails,
} from "@/types/catering.types";

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
    name: "Birthday/Private Party",
    value: "birthday",
    imgSrc: "/event-detail-img/birthdays_private party.JPG",
  },
  {
    name: "Student Event",
    value: "student",
    imgSrc: "/event-detail-img/student events.JPG",
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
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return {
    label: `${hour12} ${ampm}`,
    value: String(hour24).padStart(2, "0"),
  };
});

const MINUTE_OPTIONS = [
  { label: "00", value: "00" },
  { label: "15", value: "15" },
  { label: "30", value: "30" },
  { label: "45", value: "45" },
];

// Below constants, add for hour, minute, and period
const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1).padStart(2, '0') }));
const PERIOD_OPTIONS = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' }
];

// UK Postcode validation regex
// Matches formats like: SW1A 1AA, M1 1AE, B33 8TH, CR2 6XH, DN55 1PT
const UK_POSTCODE_REGEX = /^([A-Z]{1,2}\d{1,2}[A-Z]?)\s?(\d[A-Z]{2})$/i;

const validateUKPostcode = (postcode: string): boolean => {
  if (!postcode) return false;
  return UK_POSTCODE_REGEX.test(postcode.trim());
};

export default function Step1EventDetails() {
  // State to control modal visibility
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const {
    eventDetails,
    setEventDetails,
    setCurrentStep,
    selectedRestaurants,
    contactInfo,
    setContactInfo,
    setCorporateUser,
  } = useCatering();
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    eventDate?: string;
    eventTime?: string;
    eventType?: string;
    addressLine1?: string;
    city?: string;
    zipcode?: string;
    noticeHours?: string;
    addressValidation?: string;
  }>({});

  // State for address validation
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  // Google Places Autocomplete refs
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refs for scrolling to error fields
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const eventTypeRef = useRef<HTMLDivElement>(null);
  const addressLine1Ref = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const zipcodeRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<EventDetails>(
    eventDetails || {
      eventType: "",
      eventDate: "",
      eventTime: "",
      guestCount: 0,
      specialRequests: "",
      address: "",
      userType: "guest",
      // corporateUser: null,
    }
  );

  const [addressFormData, setAddressFormData] = useState<ContactInfo>(
    contactInfo || {
      organization: "",
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
      localStorage.setItem("catering_event_details", JSON.stringify(formData));
    }
  }, [formData]);

  // Save address form data to local storage whenever it changes
  useEffect(() => {
    if (
      addressFormData.addressLine1 ||
      addressFormData.city ||
      addressFormData.zipcode
    ) {
      localStorage.setItem(
        "catering_contact_info",
        JSON.stringify(addressFormData)
      );
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

    // Store place_id for validation
    if (place.place_id) {
      setSelectedPlaceId(place.place_id);
    }

    let street = "";
    let city = "";
    let zipcode = "";
    let country = "";

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
      if (types.includes("country")) {
        country = component.short_name;
      }
    });

    // Validate if address is in UK
    if (country && country !== "GB") {
      setValidationErrors((prev) => ({
        ...prev,
        addressValidation:
          "Sorry, we only deliver to addresses within the United Kingdom.",
      }));
    } else {
      setValidationErrors((prev) => ({
        ...prev,
        addressValidation: undefined,
      }));
    }

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
  const getMinDate = () => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  };

  const validateEventDateTime = (date: string, time: string): string | null => {
    if (
      !date ||
      !time ||
      !selectedRestaurants ||
      selectedRestaurants.length === 0
    ) {
      return null;
    }

    const eventDate = new Date(date);
    const dayOfWeek = eventDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    for (const restaurant of selectedRestaurants) {
      // Skip if no catering hours configured
      if (!restaurant.cateringOperatingHours) {
        continue;
      }

      const daySchedule = restaurant.cateringOperatingHours.find(
        (schedule) => schedule.day.toLowerCase() === dayOfWeek
      );

      if (!daySchedule || !daySchedule.enabled) {
        return `${restaurant.restaurant_name} does not accept event ordering orders on ${dayOfWeek}s`;
      }

      if (!daySchedule.open || !daySchedule.close) {
        return `${restaurant.restaurant_name} is closed for event ordering on ${dayOfWeek}s`;
      }

      // Convert times to minutes for comparison
      const [eventHour, eventMinute] = time.split(":").map(Number);
      const eventTimeMinutes = eventHour * 60 + eventMinute;

      const [openHour, openMinute] = daySchedule.open.split(":").map(Number);
      const openMinutes = openHour * 60 + openMinute;

      const [closeHour, closeMinute] = daySchedule.close.split(":").map(Number);
      const closeMinutes = closeHour * 60 + closeMinute;

      if (eventTimeMinutes < openMinutes || eventTimeMinutes > closeMinutes) {
        return `${restaurant.restaurant_name} only accepts event ordering orders between ${daySchedule.open} and ${daySchedule.close} on ${dayOfWeek}s`;
      }
    }

    return null;
  };

  const getMaxNoticeHours = () => {
    if (!selectedRestaurants || selectedRestaurants.length === 0) {
      return 48; // Default 48 hours
    }

    return Math.max(
      ...selectedRestaurants.map((r) => r.minimumDeliveryNoticeHours || 48)
    );
  };

  useEffect(() => {
    if (formData.eventDate && formData.eventTime) {
      const error = validateEventDateTime(
        formData.eventDate,
        formData.eventTime
      );
      setDateTimeError(error);
    } else {
      setDateTimeError(null);
    }
  }, [formData.eventDate, formData.eventTime, selectedRestaurants]);

  // In state, track period and set on mount
  const [selectedHour, setSelectedHour] = useState(() => {
    if (eventDetails?.eventTime) {
      const [h, m] = eventDetails.eventTime.split(":");
      const period = Number(h) >= 12 ? "PM" : "AM";
      const hour12 = Number(h) % 12 || 12;
      return String(hour12).padStart(2, '0');
    }
    return "";
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (eventDetails?.eventTime) {
      return eventDetails.eventTime.split(":")[1];
    }
    return "";
  });
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    if (eventDetails?.eventTime) {
      const hour = Number(eventDetails.eventTime.split(":")[0]);
      return hour >= 12 ? "PM" : "AM";
    }
    return "AM";
  });
  const handleTimeChange = (hour: string, minute: string, period: string) => {
    if (hour && minute) {
      let hourNum = Number(hour) % 12;
      if (period === 'PM') hourNum += 12;
      if (period === 'AM' && hourNum === 12) hourNum = 0;
      const timeValue = `${String(hourNum).padStart(2, '0')}:${minute}`;
      setFormData({ ...formData, eventTime: timeValue });
    } else {
      setFormData({ ...formData, eventTime: "" });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: typeof validationErrors = {};
    let firstErrorElement: HTMLDivElement | null = null;

    // Validate all fields
    if (!formData.eventDate) {
      newErrors.eventDate = "Event date is required.";
      if (!firstErrorElement) firstErrorElement = dateRef.current;
    }

    if (!formData.eventTime) {
      newErrors.eventTime = "Event time is required.";
      if (!firstErrorElement) firstErrorElement = timeRef.current;
    }

    // if (!formData.eventType) {
    //   newErrors.eventType = "Event type is required.";
    //   if (!firstErrorElement) firstErrorElement = eventTypeRef.current;
    // }

    // Validate address fields only for guest users
    if (formData.userType === "guest") {
      if (!addressFormData.addressLine1.trim()) {
        newErrors.addressLine1 = "Address Line 1 is required.";
        if (!firstErrorElement) firstErrorElement = addressLine1Ref.current;
      }

      if (!addressFormData.city.trim()) {
        newErrors.city = "City is required.";
        if (!firstErrorElement) firstErrorElement = cityRef.current;
      }

      if (!addressFormData.zipcode.trim()) {
        newErrors.zipcode = "Postcode is required.";
        if (!firstErrorElement) firstErrorElement = zipcodeRef.current;
      } else if (!validateUKPostcode(addressFormData.zipcode)) {
        newErrors.zipcode =
          "Please enter a valid UK postcode (e.g., SW1A 1AA).";
        if (!firstErrorElement) firstErrorElement = zipcodeRef.current;
      }

      // Check if there's an existing address validation error
      if (validationErrors.addressValidation) {
        newErrors.addressValidation = validationErrors.addressValidation;
        if (!firstErrorElement) firstErrorElement = addressLine1Ref.current;
      }
    }

    // Validate delivery notice
    if (formData.eventDate && formData.eventTime) {
      const eventDateTime = new Date(
        `${formData.eventDate}T${formData.eventTime}`
      );
      const now = new Date();
      const hoursUntilEvent =
        (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const requiredNoticeHours = getMaxNoticeHours();

      if (hoursUntilEvent < requiredNoticeHours) {
        newErrors.noticeHours = `Please select a date/time at least ${requiredNoticeHours} hours in advance.`;
        if (!firstErrorElement) firstErrorElement = dateRef.current;
      }

      // Validate operating hours
      const operatingHoursError = validateEventDateTime(
        formData.eventDate,
        formData.eventTime
      );
      if (operatingHoursError) {
        newErrors.eventTime = operatingHoursError;
        if (!firstErrorElement) firstErrorElement = timeRef.current;
      }
    }

    // Update validation errors state
    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Scroll to first error field
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    // Construct full address
    const fullAddress = `${addressFormData.addressLine1}${
      addressFormData.addressLine2 ? ", " + addressFormData.addressLine2 : ""
    }, ${addressFormData.city}, ${addressFormData.zipcode}`;

    // Save both event details and address info
    setEventDetails({ ...formData, address: fullAddress });
    setContactInfo(addressFormData);
    setCurrentStep(3);
  };

  const handleSuccessfulModalLogin = async (
    corporateAccount: CorporateUser
  ) => {
    if (corporateAccount.corporateRole === ("employee" as CorporateUserRole)) {
      alert(
        "You need to sign in as a manager account to make a corporate order"
      );
      return;
    }
    setCorporateUser(corporateAccount);
    setFormData({
      ...formData,
      userType: "corporate",
      // corporateUser: corporateAccount,
    });

    // Fetch organization details if organizationId exists
    let organizationName = "";
    if (corporateAccount.organizationId) {
      try {
        const organization = await restaurantApi.getOrganization(
          corporateAccount.organizationId
        );
        organizationName = organization.name || "";
      } catch (error) {
        console.error("Error fetching organization:", error);
        // Fall back to empty string if fetch fails
      }
    }

    setAddressFormData({
      organization: organizationName,
      fullName: corporateAccount.fullName || "",
      email: corporateAccount.email || "",
      phone: corporateAccount.phoneNumber || "",
      addressLine1: "", // Corporate users may have delivery addresses that could be populated
      addressLine2: "",
      city: "",
      zipcode: "",
    });

    setLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCorporateUser(null);
    setFormData({
      ...formData,
      userType: "guest",
      // corporateUser: null,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-base-100">
      {/* Corporate Login Modal */}
      <CorporateLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccessfulLogin={handleSuccessfulModalLogin}
        handleLogout={handleLogout}
      />
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* <p className="text-sm text-base-content/60 mb-2">
                Step 3 of 3 - Contact & Confirmation
              </p> */}
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-base-content">
            Your Event Details
          </h2>
        </div>
        <button
          onClick={() => setCurrentStep(1)}
          className="text-primary hover:opacity-80 font-medium flex items-center gap-1 mt-1"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-10">
        {/* Delivery Date & Time Section */}
        <div>
          {/* <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            User Type
          </h3>
          <div className="flex flex-1 flex-row gap-2 mb-4">
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-xl font-semibold border-2 transition-colors
                ${
                  // !(formData.userType == "corporate" && corporateUser)
                  formData.userType === "guest"
                    ? "bg-primary text-white"
                    : "border-base-300 bg-base-100 text-base-content hover:border-primary hover:bg-primary/10"
                }
              `}
              onClick={() => setFormData({ ...formData, userType: "guest" })}
            >
              Guest Customer
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-xl font-semibold border-2 transition-colors
                ${
                  // formData.userType == "corporate" && corporateUser
                  formData.userType === "corporate"
                    ? "bg-primary text-white"
                    : "border-base-300 bg-base-100 text-base-content hover:border-primary hover:bg-primary/10"
                }
              `}
              onClick={() => {
                setLoginModalOpen(true);
                // if (formData.corporateUser) {
                //   setFormData({ ...formData, userType: "corporate" });
                // } else {
                //   setLoginModalOpen(true);
                // }
              }}
            >
              Corporate Customer
            </button>
          </div> */}

          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Delivery Date & Time
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Most event orders require advance notice.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full" ref={dateRef}>
              <label className="block text-sm font-medium mb-2">
                Event Date
              </label>

              <div
                className={`w-full px-4 py-3 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${
                  validationErrors.eventDate || validationErrors.noticeHours
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => {
                    setFormData({ ...formData, eventDate: e.target.value });
                    setValidationErrors({
                      ...validationErrors,
                      eventDate: undefined,
                      noticeHours: undefined,
                    });
                  }}
                  max={getMaxDate()}
                  min={getMinDate()}
                  className="w-full"
                />
              </div>
              {validationErrors.eventDate && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.eventDate}
                </p>
              )}
              {validationErrors.noticeHours && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.noticeHours}
                </p>
              )}
              {dateTimeError &&
                !validationErrors.eventDate &&
                !validationErrors.noticeHours && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{dateTimeError}</p>
                  </div>
                )}
            </div>
            <div className="w-full" ref={timeRef}>
              <label className="block text-sm font-medium mb-2">
                Event Time
              </label>
              <div className="flex gap-2">
                <select
                  required
                  value={selectedHour}
                  onChange={e => {
                    setSelectedHour(e.target.value);
                    handleTimeChange(e.target.value, selectedMinute, selectedPeriod);
                    setValidationErrors({ ...validationErrors, eventTime: undefined });
                  }}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.eventTime ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Hour</option>
                  {HOUR_12_OPTIONS.map(hour => (
                    <option key={hour.value} value={hour.value}>{hour.label}</option>
                  ))}
                </select>
                <span className="flex items-center text-2xl font-bold text-gray-400">:</span>
                <select
                  required
                  value={selectedMinute}
                  onChange={e => {
                    setSelectedMinute(e.target.value);
                    handleTimeChange(selectedHour, e.target.value, selectedPeriod);
                    setValidationErrors({ ...validationErrors, eventTime: undefined });
                  }}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.eventTime ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Min</option>
                  {MINUTE_OPTIONS.map(minute => (
                    <option key={minute.value} value={minute.value}>{minute.label}</option>
                  ))}
                </select>
                <select
                  required
                  value={selectedPeriod}
                  onChange={e => {
                    setSelectedPeriod(e.target.value);
                    handleTimeChange(selectedHour, selectedMinute, e.target.value);
                    setValidationErrors({ ...validationErrors, eventTime: undefined });
                  }}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.eventTime ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              {validationErrors.eventTime && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.eventTime}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Type of Event Section */}
        <div ref={eventTypeRef}>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Type of Event
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {EVENT_TYPE_OPTIONS.map((option) => {
              const isSelected = formData.eventType === option.value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    setFormData({ ...formData, eventType: option.value });
                    setValidationErrors({
                      ...validationErrors,
                      eventType: undefined,
                    });
                  }}
                  className={`
                    cursor-pointer transition-all duration-200 text-center border-2 rounded-lg overflow-hidden
                    ${
                      isSelected
                        ? "border-dark-pink bg-base-300"
                        : validationErrors.eventType
                        ? "border-red-500"
                        : "border-base-300 hover:border-gray-400"
                    }
                  `}
                >
                  {/* Placeholder for the image */}
                  <div className="w-full aspect-square relative">
                    <Image
                      src={option.imgSrc}
                      alt={option.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <p className="text-xs pt-2 pb-2 font-medium text-gray-800">
                    {option.name}
                  </p>
                </div>
              );
            })}
          </div>
          {validationErrors.eventType && (
            <p className="mt-2 text-sm text-red-600">
              {validationErrors.eventType}
            </p>
          )}
        </div>

        {/* Delivery Address Section */}
        {formData.userType === "guest" && (
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
                className={`w-full px-4 py-3 bg-base-200/50 border rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all ${
                  validationErrors.addressValidation
                    ? "border-red-500"
                    : "border-base-300"
                }`}
              />
              {validationErrors.addressValidation && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    {validationErrors.addressValidation}
                  </p>
                </div>
              )}
              {!validationErrors.addressValidation &&
                selectedPlaceId &&
                formData.address && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">
                      ✓ Address validated successfully
                    </p>
                  </div>
                )}
              {/* <p className="text-xs text-base-content/60 mt-2">
              Select from dropdown to autofill, or enter manually below
            </p> */}
            </div>

            {/* Address Line 1 */}
            <div className="mb-4" ref={addressLine1Ref}>
              <label className="block text-sm font-semibold mb-2 text-base-content">
                Address Line 1*
              </label>
              <input
                type="text"
                required
                value={addressFormData.addressLine1}
                onChange={(e) => {
                  setAddressFormData({
                    ...addressFormData,
                    addressLine1: e.target.value,
                  });
                  setValidationErrors({
                    ...validationErrors,
                    addressLine1: undefined,
                  });
                }}
                placeholder="Street address"
                className={`w-full px-4 py-3 bg-base-200/50 border rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all ${
                  validationErrors.addressLine1
                    ? "border-red-500"
                    : "border-base-300"
                }`}
              />
              {validationErrors.addressLine1 && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.addressLine1}
                </p>
              )}
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
                  setAddressFormData({
                    ...addressFormData,
                    addressLine2: e.target.value,
                  })
                }
                placeholder="Apartment, suite, unit, etc."
                className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
              />
            </div>

            {/* City and Zipcode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div ref={cityRef}>
                <label className="block text-sm font-semibold mb-2 text-base-content">
                  City*
                </label>
                <input
                  type="text"
                  required
                  value={addressFormData.city}
                  onChange={(e) => {
                    setAddressFormData({
                      ...addressFormData,
                      city: e.target.value,
                    });
                    setValidationErrors({
                      ...validationErrors,
                      city: undefined,
                    });
                  }}
                  placeholder="City"
                  className={`w-full px-4 py-3 bg-base-200/50 border rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all ${
                    validationErrors.city ? "border-red-500" : "border-base-300"
                  }`}
                />
                {validationErrors.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.city}
                  </p>
                )}
              </div>
              <div ref={zipcodeRef}>
                <label className="block text-sm font-semibold mb-2 text-base-content">
                  Postcode*
                </label>
                <input
                  type="text"
                  required
                  value={addressFormData.zipcode}
                  onChange={(e) => {
                    const newPostcode = e.target.value.toUpperCase();
                    setAddressFormData({
                      ...addressFormData,
                      zipcode: newPostcode,
                    });
                    setValidationErrors({
                      ...validationErrors,
                      zipcode: undefined,
                    });
                  }}
                  onBlur={(e) => {
                    // Validate on blur
                    const postcode = e.target.value.trim();
                    if (postcode && !validateUKPostcode(postcode)) {
                      setValidationErrors({
                        ...validationErrors,
                        zipcode:
                          "Please enter a valid UK postcode (e.g., SW1A 1AA).",
                      });
                    }
                  }}
                  placeholder="e.g., SW1A 1AA"
                  className={`w-full px-4 py-3 bg-base-200/50 border rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all ${
                    validationErrors.zipcode
                      ? "border-red-500"
                      : "border-base-300"
                  }`}
                />
                {validationErrors.zipcode && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.zipcode}
                  </p>
                )}
                {!validationErrors.zipcode &&
                  addressFormData.zipcode &&
                  validateUKPostcode(addressFormData.zipcode) && (
                    <p className="mt-1 text-sm text-green-600">
                      ✓ Valid UK postcode
                    </p>
                  )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <div className="flex items-stretch justify-center gap-4 max-w-2xl mx-auto">
            {/* <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex-[3] bg-white text-dark-pink border-2 border-dark-pink py-2 px-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-50 transition-colors min-h-[60px] flex items-center justify-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
            </button> */}
            <button
              type="submit"
              className="flex-[7] bg-primary text-white py-2 px-6 rounded-xl font-bold text-base sm:text-lg transition-colors min-h-[60px] hover:bg-hot-pink cursor-pointer"
            >
              Continue to contact details
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
