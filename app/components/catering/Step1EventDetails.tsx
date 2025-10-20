"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useCatering } from "@/context/CateringContext";
import { EventDetails } from "@/types/catering.types";

// Define the options for Guest Count and Event Type to map to the UI
// REPLACE the GUEST_COUNT_OPTIONS with:
const GUEST_COUNT_OPTIONS = [
  { label: "10-30 (Small)", value: 20 },
  { label: "30-50 (Medium)", value: 40 },
  { label: "50-70 (Large)", value: 60 },
  { label: "70-90 (XL)", value: 80 },
  { label: "90+ (XXL)", value: 100 },
];

const EVENT_TYPE_OPTIONS = [
  {
    name: "Corporate Lunch",
    value: "corporate",
    imgSrc: "/event-detail-img/corporate lunch.JPG",
  }, // Placeholder paths
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
  const { eventDetails, setEventDetails, setCurrentStep, selectedRestaurants } = useCatering();

  // Calculate min and max dates
  // const getMinDate = () => {
  //   const date = new Date();
  //   date.setDate(date.getDate() + 3);
  //   return date.toISOString().split("T")[0];
  // };

  const getMaxDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date.toISOString().split("T")[0];
  };
  const getMaxNoticeHours = () => {
    if (!selectedRestaurants || selectedRestaurants.length === 0) {
      return 48; // Default 48 hours
    }
    
    return Math.max(
      ...selectedRestaurants.map(r => r.minimumDeliveryNoticeHours || 48)
    );
  };

  // REPLACE with:
  const [formData, setFormData] = useState<EventDetails>(
    eventDetails || {
      eventType: "",
      eventDate: "",
      eventTime: "",
      guestCount: 0, // No default selection
      specialRequests: "",
    }
  );

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
    if (formData.guestCount === 0)
      errors.push("Please select an estimated guest count.");
  
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
    }
  
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
  
    setEventDetails(formData);
    setCurrentStep(3);
  };

  const handleGuestCountSelect = (optionValue: number) => {
    setFormData({ ...formData, guestCount: optionValue });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Event Details Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-4xl font-bold mb-2">Event Details</h2>
          <p className="text-lg text-gray-600">
            We just need a few details before we start building your event order menu.
          </p>
        </div>
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
                  // min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full"
                />
              </div>
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

        {/* Portion Size (Guest Count) Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Portion Size (Guest Count)
          </h3>

          <div className="flex flex-wrap gap-3 mb-3">
            {GUEST_COUNT_OPTIONS.map((option) => {
              const isActive = formData.guestCount === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleGuestCountSelect(option.value)}
                  className={`
                      px-5 py-2 rounded-full text-base font-medium transition-all duration-200  cursor-pointer
                      ${
                        isActive
                          ? "bg-dark-pink text-white shadow-lg"
                          : "bg-base-200 text-gray-600 hover:bg-base-300"
                      }
                    `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Custom guest count input for 90+ */}
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

        <div className="text-center pt-4">
          <button
            type="submit"
            className="bg-dark-pink text-white py-4 px-12 rounded-full font-bold text-lg hover:bg-pink-700 transition-colors shadow-lg shadow-dark-pink/30"
          >
            Continue to contact details
          </button>
          <p className="text-sm text-gray-500 mt-3">
            You can edit your event details later before submission.
          </p>
        </div>
      </form>
    </div>
  );
}
