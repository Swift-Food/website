"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader, ArrowLeft, Save, AlertCircle, Clock, Plus, Trash2, CalendarOff } from "lucide-react";
import { cateringService } from "@/services/api/catering.api";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";
import { fetchWithAuth } from "@/lib/api-client/auth-client";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

interface TimeSlot {
  open: string;
  close: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface DateOverride {
  date: string; // "YYYY-MM-DD"
  isClosed: boolean;
  reason: string;
  timeSlots: TimeSlot[];
}

interface TimeOption {
  label: string;
  value: string;
}

// Generate time options with 30-minute intervals
const generateTimeOptions = (): TimeOption[] => {
  const times: TimeOption[] = [];

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

const createDefaultSchedule = (): Record<DayOfWeek, DaySchedule> => {
  const schedule: Record<string, DaySchedule> = {};
  for (const day of DAYS_OF_WEEK) {
    schedule[day] = { enabled: false, slots: [] };
  }
  return schedule as Record<DayOfWeek, DaySchedule>;
};

const OpeningHoursPage = () => {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [schedule, setSchedule] = useState<Record<DayOfWeek, DaySchedule>>(
    createDefaultSchedule()
  );
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);

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

      // Load from cateringOperatingHours (the correct field)
      const hours = restaurantDetails.cateringOperatingHours;
      if (hours && Array.isArray(hours)) {
        const newSchedule = createDefaultSchedule();

        for (const entry of hours) {
          const dayKey = DAYS_OF_WEEK.find(
            (d) => d.toLowerCase() === entry.day.toLowerCase()
          );
          if (!dayKey) continue;

          if (entry.enabled && entry.open && entry.close) {
            newSchedule[dayKey].enabled = true;
            newSchedule[dayKey].slots.push({
              open: entry.open,
              close: entry.close,
            });
          }
        }

        // Ensure enabled days with no valid slots still show as enabled with one empty slot
        for (const day of DAYS_OF_WEEK) {
          if (newSchedule[day].enabled && newSchedule[day].slots.length === 0) {
            newSchedule[day].slots.push({ open: "09:00", close: "17:00" });
          }
        }

        setSchedule(newSchedule);
      }

      // Load date overrides
      const overrides = restaurantDetails.dateOverrides;
      if (overrides && Array.isArray(overrides)) {
        setDateOverrides(
          overrides.map((o: any) => ({
            date: o.date,
            isClosed: o.isClosed,
            reason: o.reason || "",
            timeSlots: o.timeSlots || [],
          }))
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to load restaurant details");
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (
    id: string,
    updates: Record<string, any>
  ) => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update restaurant");
    }

    return response.json();
  };

  // --- Day schedule handlers ---

  const toggleDay = (day: DayOfWeek) => {
    setSchedule((prev) => {
      const current = prev[day];
      if (current.enabled) {
        return { ...prev, [day]: { enabled: false, slots: [] } };
      } else {
        return {
          ...prev,
          [day]: { enabled: true, slots: [{ open: "09:00", close: "17:00" }] },
        };
      }
    });
  };

  const addSlot = (day: DayOfWeek) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { open: "09:00", close: "17:00" }],
      },
    }));
  };

  const removeSlot = (day: DayOfWeek, slotIndex: number) => {
    setSchedule((prev) => {
      const newSlots = prev[day].slots.filter((_, i) => i !== slotIndex);
      return {
        ...prev,
        [day]: {
          ...prev[day],
          enabled: newSlots.length > 0,
          slots: newSlots,
        },
      };
    });
  };

  const updateSlot = (
    day: DayOfWeek,
    slotIndex: number,
    field: "open" | "close",
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === slotIndex ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  // --- Date override handlers ---

  const addDateOverride = () => {
    setDateOverrides((prev) => [
      ...prev,
      { date: "", isClosed: true, reason: "", timeSlots: [] },
    ]);
  };

  const removeDateOverride = (index: number) => {
    setDateOverrides((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDateOverride = (
    index: number,
    updates: Partial<DateOverride>
  ) => {
    setDateOverrides((prev) =>
      prev.map((o, i) => (i === index ? { ...o, ...updates } : o))
    );
  };

  const addOverrideSlot = (overrideIndex: number) => {
    setDateOverrides((prev) =>
      prev.map((o, i) =>
        i === overrideIndex
          ? { ...o, timeSlots: [...o.timeSlots, { open: "09:00", close: "17:00" }] }
          : o
      )
    );
  };

  const removeOverrideSlot = (overrideIndex: number, slotIndex: number) => {
    setDateOverrides((prev) =>
      prev.map((o, i) =>
        i === overrideIndex
          ? { ...o, timeSlots: o.timeSlots.filter((_, si) => si !== slotIndex) }
          : o
      )
    );
  };

  const updateOverrideSlot = (
    overrideIndex: number,
    slotIndex: number,
    field: "open" | "close",
    value: string
  ) => {
    setDateOverrides((prev) =>
      prev.map((o, i) =>
        i === overrideIndex
          ? {
              ...o,
              timeSlots: o.timeSlots.map((s, si) =>
                si === slotIndex ? { ...s, [field]: value } : s
              ),
            }
          : o
      )
    );
  };

  // --- Save ---

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Validate time slots
      for (const day of DAYS_OF_WEEK) {
        const dayData = schedule[day];
        if (!dayData.enabled) continue;

        for (const slot of dayData.slots) {
          if (slot.close <= slot.open) {
            setError(
              `${day}: Closing time must be after opening time for each slot`
            );
            setSaving(false);
            return;
          }
        }
      }

      // Validate date overrides
      for (const override of dateOverrides) {
        if (!override.date) {
          setError("Please set a date for all date overrides or remove empty ones");
          setSaving(false);
          return;
        }
        if (!override.isClosed) {
          for (const slot of override.timeSlots) {
            if (slot.close <= slot.open) {
              setError(
                `Date override ${override.date}: Closing time must be after opening time`
              );
              setSaving(false);
              return;
            }
          }
        }
      }

      // Build cateringOperatingHours array (multiple entries per day for multiple slots)
      const cateringOperatingHours: {
        day: string;
        open: string | null;
        close: string | null;
        enabled: boolean;
      }[] = [];

      for (const day of DAYS_OF_WEEK) {
        const dayData = schedule[day];
        if (dayData.enabled && dayData.slots.length > 0) {
          for (const slot of dayData.slots) {
            cateringOperatingHours.push({
              day,
              open: slot.open,
              close: slot.close,
              enabled: true,
            });
          }
        } else {
          // Day is closed
          cateringOperatingHours.push({
            day,
            open: null,
            close: null,
            enabled: false,
          });
        }
      }

      // Build date overrides payload
      const dateOverridesPayload = dateOverrides
        .filter((o) => o.date)
        .map((o) => ({
          date: o.date,
          isClosed: o.isClosed,
          reason: o.reason || undefined,
          timeSlots:
            !o.isClosed && o.timeSlots.length > 0 ? o.timeSlots : undefined,
        }));

      await updateRestaurant(restaurantId, {
        cateringOperatingHours,
        dateOverrides:
          dateOverridesPayload.length > 0 ? dateOverridesPayload : null,
      });

      setSuccess("Operating hours updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update operating hours");
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
              Operating Hours
            </h1>
            <p className="text-gray-600 mt-1">
              Set your restaurant&apos;s operating hours and date-specific
              schedules
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* Weekly Schedule */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Weekly Schedule
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Add multiple time slots per day for split operating hours (e.g.
              breakfast and dinner service).
            </p>

            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayData = schedule[day];
                return (
                  <div
                    key={day}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            dayData.enabled ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              dayData.enabled
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span className="text-base font-medium text-gray-900">
                          {day}
                        </span>
                      </div>

                      {dayData.enabled && (
                        <button
                          type="button"
                          onClick={() => addSlot(day)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Plus size={14} />
                          Add slot
                        </button>
                      )}
                    </div>

                    {!dayData.enabled && (
                      <p className="text-sm text-gray-400 ml-14">Closed</p>
                    )}

                    {dayData.enabled && (
                      <div className="space-y-2 ml-14">
                        {dayData.slots.map((slot, slotIdx) => (
                          <div
                            key={slotIdx}
                            className="flex items-center gap-2"
                          >
                            <select
                              value={slot.open}
                              onChange={(e) =>
                                updateSlot(day, slotIdx, "open", e.target.value)
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                            >
                              {TIME_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <span className="text-gray-500 font-medium">
                              -
                            </span>
                            <select
                              value={slot.close}
                              onChange={(e) =>
                                updateSlot(
                                  day,
                                  slotIdx,
                                  "close",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white text-sm"
                            >
                              {TIME_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {dayData.slots.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSlot(day, slotIdx)}
                                className="p-1 text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Overrides */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CalendarOff size={22} className="text-orange-500" />
                  Date Overrides
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Set specific dates when the restaurant is closed or has
                  different hours (e.g. holidays, Christmas break).
                </p>
              </div>
              <button
                type="button"
                onClick={addDateOverride}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add date
              </button>
            </div>

            {dateOverrides.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No date overrides set. Add specific dates for holidays or
                special schedules.
              </p>
            )}

            <div className="space-y-4">
              {dateOverrides.map((override, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-orange-200 rounded-lg bg-orange-50/30"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <input
                        type="date"
                        value={override.date}
                        onChange={(e) =>
                          updateDateOverride(idx, { date: e.target.value })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white text-sm"
                      />
                      <input
                        type="text"
                        value={override.reason}
                        onChange={(e) =>
                          updateDateOverride(idx, { reason: e.target.value })
                        }
                        placeholder="Reason (e.g. Christmas Break)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white text-sm w-64"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDateOverride(idx)}
                      className="p-1 text-red-400 hover:text-red-600 flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateDateOverride(idx, {
                          isClosed: true,
                          timeSlots: [],
                        })
                      }
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        override.isClosed
                          ? "bg-red-100 text-red-700 font-medium"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Closed all day
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateDateOverride(idx, {
                          isClosed: false,
                          timeSlots:
                            override.timeSlots.length > 0
                              ? override.timeSlots
                              : [{ open: "09:00", close: "17:00" }],
                        })
                      }
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        !override.isClosed
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Custom hours
                    </button>
                  </div>

                  {!override.isClosed && (
                    <div className="space-y-2">
                      {override.timeSlots.map((slot, slotIdx) => (
                        <div
                          key={slotIdx}
                          className="flex items-center gap-2"
                        >
                          <select
                            value={slot.open}
                            onChange={(e) =>
                              updateOverrideSlot(
                                idx,
                                slotIdx,
                                "open",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white text-sm"
                          >
                            {TIME_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <span className="text-gray-500 font-medium">-</span>
                          <select
                            value={slot.close}
                            onChange={(e) =>
                              updateOverrideSlot(
                                idx,
                                slotIdx,
                                "close",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white text-sm"
                          >
                            {TIME_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeOverrideSlot(idx, slotIdx)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOverrideSlot(idx)}
                        className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800"
                      >
                        <Plus size={14} />
                        Add time slot
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
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
                  Save Operating Hours
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
