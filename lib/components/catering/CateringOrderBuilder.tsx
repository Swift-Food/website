"use client";

import { useState, useRef, useEffect } from "react";
import { useCatering } from "@/context/CateringContext";
import { MealSessionState } from "@/types/catering.types";

// Hour and minute options for time picker
const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}`,
  value: String(i + 1).padStart(2, "0"),
}));

const MINUTE_OPTIONS = [
  { label: "00", value: "00" },
  { label: "15", value: "15" },
  { label: "30", value: "30" },
  { label: "45", value: "45" },
];

interface SessionEditorProps {
  session: MealSessionState;
  sessionIndex: number;
  onUpdate: (index: number, updates: Partial<MealSessionState>) => void;
  onClose: () => void;
}

function SessionEditor({ session, sessionIndex, onUpdate, onClose }: SessionEditorProps) {
  const [sessionName, setSessionName] = useState(session.sessionName);
  const [sessionDate, setSessionDate] = useState(session.sessionDate);
  const [selectedHour, setSelectedHour] = useState(() => {
    if (session.eventTime) {
      const h = session.eventTime.split(":")[0];
      const hour12 = Number(h) % 12 || 12;
      return String(hour12).padStart(2, "0");
    }
    return "";
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (session.eventTime) {
      return session.eventTime.split(":")[1];
    }
    return "00";
  });
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    if (session.eventTime) {
      const hour = Number(session.eventTime.split(":")[0]);
      return hour >= 12 ? "PM" : "AM";
    }
    return "AM";
  });

  const editorRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sessionName, sessionDate, selectedHour, selectedMinute, selectedPeriod]);

  const getMinDate = () => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split("T")[0];
  };

  const handleSave = () => {
    let eventTime = "";
    if (selectedHour && selectedMinute) {
      let hourNum = Number(selectedHour) % 12;
      if (selectedPeriod === "PM") hourNum += 12;
      if (selectedPeriod === "AM" && hourNum === 12) hourNum = 0;
      eventTime = `${String(hourNum).padStart(2, "0")}:${selectedMinute}`;
    }

    onUpdate(sessionIndex, {
      sessionName: sessionName || "Untitled Session",
      sessionDate,
      eventTime,
    });
    onClose();
  };

  return (
    <div
      ref={editorRef}
      className="bg-white rounded-xl shadow-lg border border-base-200 p-4 mt-2"
    >
      <div className="flex flex-col gap-3">
        {/* Session Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Session Name
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g., Breakfast, Lunch, Dinner"
            className="w-full px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Time
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">HH</option>
              {HOUR_12_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-gray-400">:</span>
            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(e.target.value)}
              className="px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {MINUTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Step2MenuItemsNew() {
  const {
    mealSessions,
    activeSessionIndex,
    setActiveSessionIndex,
    addMealSession,
    updateMealSession,
    removeMealSession,
    getSessionTotal,
    getTotalPrice,
  } = useCatering();

  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(null);

  const handleAddSession = () => {
    const newSession: MealSessionState = {
      sessionName: `Session ${mealSessions.length + 1}`,
      sessionDate: "",
      eventTime: "",
      orderItems: [],
    };
    addMealSession(newSession);
    // Auto-open editor for new session
    setEditingSessionIndex(mealSessions.length);
    setActiveSessionIndex(mealSessions.length);
  };

  const handleSessionClick = (index: number) => {
    if (activeSessionIndex === index && editingSessionIndex !== index) {
      // If clicking on already active session, toggle editor
      setEditingSessionIndex(editingSessionIndex === index ? null : index);
    } else {
      setActiveSessionIndex(index);
      setEditingSessionIndex(null);
    }
  };

  const handleRemoveSession = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mealSessions.length > 1) {
      removeMealSession(index);
      setEditingSessionIndex(null);
    }
  };

  const formatSessionDisplay = (session: MealSessionState) => {
    const parts: string[] = [];

    if (session.sessionDate) {
      const date = new Date(session.sessionDate);
      parts.push(date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
    }

    if (session.eventTime) {
      const [hours, minutes] = session.eventTime.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      parts.push(`${hour12}:${minutes} ${period}`);
    }

    return parts.length > 0 ? parts.join(" • ") : "Set date & time";
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Meal Sessions Tab Bar - Sticky */}
      <div className="sticky top-[64px] md:top-[80px] z-40 bg-base-100 border-b border-base-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {/* Session Tabs */}
            {mealSessions.map((session, index) => (
              <div key={index} className="relative flex-shrink-0">
                <button
                  onClick={() => handleSessionClick(index)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all
                    ${activeSessionIndex === index
                      ? "bg-primary text-white shadow-md"
                      : "bg-base-200 text-gray-700 hover:bg-base-300"
                    }
                  `}
                >
                  <span className="whitespace-nowrap">{session.sessionName}</span>

                  {/* Remove button (only if more than 1 session) */}
                  {mealSessions.length > 1 && activeSessionIndex === index && (
                    <button
                      onClick={(e) => handleRemoveSession(index, e)}
                      className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </button>

                {/* Underline indicator for active tab */}
                {activeSessionIndex === index && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
              </div>
            ))}

            {/* Add Session Button */}
            <button
              onClick={handleAddSession}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium bg-secondary text-white hover:bg-secondary/90 transition-all shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Add Session</span>
            </button>
          </div>

          {/* Session Editor - Outside scrollable container */}
          {editingSessionIndex !== null && (
            <SessionEditor
              session={mealSessions[editingSessionIndex]}
              sessionIndex={editingSessionIndex}
              onUpdate={updateMealSession}
              onClose={() => setEditingSessionIndex(null)}
            />
          )}

          {/* Active Session Info Bar */}
          <div className="flex items-center justify-between py-2 border-t border-base-200 text-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditingSessionIndex(activeSessionIndex)}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-500">
                  {formatSessionDisplay(mealSessions[activeSessionIndex])}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 text-gray-600">
              <span>
                {mealSessions[activeSessionIndex].orderItems.length} items
              </span>
              <span className="font-semibold text-primary">
                £{getSessionTotal(activeSessionIndex).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Placeholder for menu content - will be implemented in next iteration */}
        <div className="bg-base-200/50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Menu Content Area
          </h2>
          <p className="text-gray-500">
            This is where the restaurant/menu catalogue will be displayed for session:{" "}
            <strong>{mealSessions[activeSessionIndex].sessionName}</strong>
          </p>

          {/* Session Summary */}
          <div className="mt-6 p-4 bg-white rounded-xl inline-block">
            <h3 className="font-medium text-gray-700 mb-2">Current Session Details:</h3>
            <ul className="text-sm text-gray-600 text-left space-y-1">
              <li><strong>Name:</strong> {mealSessions[activeSessionIndex].sessionName}</li>
              <li><strong>Date:</strong> {mealSessions[activeSessionIndex].sessionDate || "Not set"}</li>
              <li><strong>Time:</strong> {mealSessions[activeSessionIndex].eventTime || "Not set"}</li>
              <li><strong>Items:</strong> {mealSessions[activeSessionIndex].orderItems.length}</li>
              <li><strong>Session Total:</strong> £{getSessionTotal(activeSessionIndex).toFixed(2)}</li>
            </ul>
          </div>

          {/* Overall Order Summary */}
          <div className="mt-4 p-4 bg-primary/10 rounded-xl inline-block">
            <h3 className="font-medium text-primary mb-2">Overall Order Summary:</h3>
            <ul className="text-sm text-gray-700 text-left space-y-1">
              <li><strong>Total Sessions:</strong> {mealSessions.length}</li>
              <li><strong>Grand Total:</strong> £{getTotalPrice().toFixed(2)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
