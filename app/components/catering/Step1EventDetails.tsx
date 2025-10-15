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

const TIME_SLOT_OPTIONS = [
  { label: "Morning (8:00 AM - 10:00 AM)", value: "09:00" },
  { label: "Late Morning (10:00 AM - 12:00 PM)", value: "11:00" },
  { label: "Lunch (12:00 PM - 2:00 PM)", value: "13:00" },
  { label: "Afternoon (2:00 PM - 4:00 PM)", value: "15:00" },
  { label: "Early Evening (4:00 PM - 6:00 PM)", value: "17:00" },
  { label: "Evening (6:00 PM - 8:00 PM)", value: "19:00" },
  { label: "Late Evening (8:00 PM - 10:00 PM)", value: "21:00" },
];

export default function Step1EventDetails() {
  const { eventDetails, setEventDetails, setCurrentStep } = useCatering();

  // Calculate min and max dates
  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date.toISOString().split("T")[0];
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

  // REPLACE handleSubmit with:
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (
      !formData.eventDate ||
      !formData.eventTime ||
      !formData.eventType ||
      formData.guestCount === 0
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate date is not in the past or too soon
    const selectedDate = new Date(formData.eventDate);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    minDate.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < minDate) {
      alert(
        "Please select a date at least 2 days from today. Catering orders require advance notice."
      );
      return;
    }

    setEventDetails(formData);
    setCurrentStep(2);
  };

  const handleGuestCountSelect = (optionValue: number) => {
    setFormData({ ...formData, guestCount: optionValue });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Event Details Header */}
      <h2 className="text-4xl font-bold mb-2">Event Details</h2>
      <p className="text-lg text-gray-600 mb-10">
        We just need a few details before we start building your catering menu.
      </p>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Delivery Date & Time Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Delivery Date & Time
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Catering orders require at least 3 days' notice.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Event Date
              </label>

              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventDate: e.target.value })
                }
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Event Time
              </label>
              <select
                required
                value={formData.eventTime}
                onChange={(e) =>
                  setFormData({ ...formData, eventTime: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a time slot</option>
                {TIME_SLOT_OPTIONS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
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
                      px-5 py-2 rounded-full text-base font-medium transition-all duration-200 
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
            Next - Choose Menu
          </button>
          <p className="text-sm text-gray-500 mt-3">
            You can edit your event details later before submission.
          </p>
        </div>
      </form>
    </div>
  );
}
