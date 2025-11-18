"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader, ArrowLeft, Save, AlertCircle, Clock } from "lucide-react";
import { cateringService } from "@/services/api/catering.api";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";

enum DaysOfWeek {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

interface OpeningHour {
  day: DaysOfWeek;
  open: string | null;
  close: string | null;
}

interface RestaurantTiming {
  day: DaysOfWeek;
  openTime: string;
  closeTime: string;
}

interface TimeOption {
  label: string;
  value: string;
}

// Generate time options with 30-minute intervals
const generateTimeOptions = (): TimeOption[] => {
  const times: TimeOption[] = [
    {
      label: "Closed",
      value: "closed",
    },
  ];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, "0");
      const minStr = minute.toString().padStart(2, "0");
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? "AM" : "PM";
      const displayTime = `${displayHour
        .toString()
        .padStart(2, "0")}:${minStr} ${period}`;

      times.push({
        label: displayTime,
        value: `${hourStr}:${minStr}`,
      });
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

const OpeningHoursPage = () => {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);

  const [restaurantTimings, setRestaurantTimings] = useState<
    RestaurantTiming[]
  >([
    { day: DaysOfWeek.MONDAY, openTime: "closed", closeTime: "closed" },
    { day: DaysOfWeek.TUESDAY, openTime: "closed", closeTime: "closed" },
    { day: DaysOfWeek.WEDNESDAY, openTime: "closed", closeTime: "closed" },
    { day: DaysOfWeek.THURSDAY, openTime: "closed", closeTime: "closed" },
    { day: DaysOfWeek.FRIDAY, openTime: "closed", closeTime: "closed" },
    { day: DaysOfWeek.SATURDAY, openTime: "closed", closeTime: "closed" },
    { day: DaysOfWeek.SUNDAY, openTime: "closed", closeTime: "closed" },
  ]);

  useEffect(() => {
    fetchRestaurantDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const fetchRestaurantDetails = async () => {
    setLoading(true);
    try {
      const restaurantDetails = await cateringService.getRestaurant(
        restaurantId
      );

      // Set restaurant open/closed status
      if (restaurantDetails.isOpen !== undefined) {
        setIsRestaurantOpen(restaurantDetails.isOpen);
      }

      if (!restaurantDetails.openingHours) {
        setLoading(false);
        return;
      }

      const openingHours: OpeningHour[] = restaurantDetails.openingHours;

      const openingHoursStateData: RestaurantTiming[] = openingHours.map(
        (day) => {
          return {
            day: day.day,
            openTime: day.open || "closed",
            closeTime: day.close || "closed",
          };
        }
      );

      setRestaurantTimings(openingHoursStateData);
    } catch (err: any) {
      setError(err.message || "Failed to load restaurant details");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTimeChange = (day: string, selectedValue: string): void => {
    setRestaurantTimings((prev) =>
      prev.map((timing) =>
        timing.day === day ? { ...timing, openTime: selectedValue } : timing
      )
    );
  };

  const handleCloseTimeChange = (day: string, selectedValue: string): void => {
    setRestaurantTimings((prev) =>
      prev.map((timing) =>
        timing.day === day ? { ...timing, closeTime: selectedValue } : timing
      )
    );
  };

  const handleToggleRestaurantStatus = async () => {
    const newStatus = !isRestaurantOpen;
    setIsRestaurantOpen(newStatus);

    try {
      await updateRestaurant(restaurantId, { isOpen: newStatus });
      setSuccess(`Restaurant is now ${newStatus ? "open" : "closed"}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update restaurant status");
      setIsRestaurantOpen(!newStatus); // Revert on error
    }
  };

  const updateRestaurant = async (id: string, updates: Record<string, any>) => {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error("Failed to update restaurant");
    }

    return response.json();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Validate that if one time is set, both must be set (unless both are closed)
      const invalidData = restaurantTimings.find(
        (day) =>
          (day.openTime !== "closed" && day.closeTime === "closed") ||
          (day.closeTime !== "closed" && day.openTime === "closed")
      );

      if (invalidData) {
        setError(
          "Please provide both opening and closing time for each day, or set both to closed"
        );
        setSaving(false);
        return;
      }

      // Check for logical time errors (closing time before opening time)
      const logicalError = restaurantTimings.find((day) => {
        if (day.openTime !== "closed" && day.closeTime !== "closed") {
          return day.closeTime <= day.openTime;
        }
        return false;
      });

      if (logicalError) {
        setError("Closing time must be after opening time");
        setSaving(false);
        return;
      }

      const result: OpeningHour[] = restaurantTimings.map((day) => {
        // If both times are closed, restaurant is closed that day
        if (day.openTime === "closed" || day.closeTime === "closed") {
          return {
            day: day.day,
            open: null,
            close: null,
          };
        }

        return {
          day: day.day,
          open: day.openTime,
          close: day.closeTime,
        };
      });

      await updateRestaurant(restaurantId, {
        openingHours: result,
      });

      setSuccess("Opening hours updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update opening hours");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-blue-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/restaurant/dashboard")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Clock className="text-blue-600" size={32} />
              Opening Hours
            </h1>
            <p className="text-gray-600 mt-1">
              Set your restaurant&apos;s operating hours
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white rounded-lg p-6">
          {/* Restaurant Status Toggle */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Restaurant Status
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Toggle to open or close your restaurant temporarily
                </p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p
                  className={`flex items-center justify-center text-sm font-medium text-black`}
                >
                  {isRestaurantOpen ? "Open" : "Closed"}
                </p>
                <button
                  type="button"
                  onClick={handleToggleRestaurantStatus}
                  className={`relative inline-flex h-8 w-20 items-center rounded-full transition-colors ${
                    isRestaurantOpen ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                      isRestaurantOpen ? "translate-x-9" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Weekly Schedule
            </h2>

            {restaurantTimings.map((timing) => (
              <div
                key={timing.day}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="mb-2 md:mb-0 md:w-32">
                  <span className="text-base font-medium text-gray-900">
                    {timing.day}
                  </span>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex-1 md:w-40">
                    <select
                      value={timing.openTime}
                      onChange={(e) =>
                        handleOpenTimeChange(timing.day, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                    >
                      {TIME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-gray-500 font-medium">-</span>

                  <div className="flex-1 md:w-40">
                    <select
                      value={timing.closeTime}
                      onChange={(e) =>
                        handleCloseTimeChange(timing.day, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                    >
                      {TIME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={() => router.push("/restaurant/dashboard")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Opening Hours
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpeningHoursPage;
