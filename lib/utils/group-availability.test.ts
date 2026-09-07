import { describe, it, expect } from "vitest";
import {
  GroupAvailability,
  formatGroupAvailability,
  emptyDraft,
  draftFromAvailability,
  draftToAvailability,
  PRESET_WINDOWS,
} from "./group-availability";

const weekdayMornings: GroupAvailability = {
  timeSlots: [
    { day: "monday", open: "07:00", close: "11:00", enabled: true },
    { day: "tuesday", open: "07:00", close: "11:00", enabled: true },
    { day: "wednesday", open: "07:00", close: "11:00", enabled: true },
    { day: "thursday", open: "07:00", close: "11:00", enabled: true },
    { day: "friday", open: "07:00", close: "11:00", enabled: true },
  ],
};

describe("formatGroupAvailability", () => {
  it("collapses consecutive days sharing a window into a range", () => {
    expect(formatGroupAvailability(weekdayMornings)).toBe("Mon–Fri, 07:00–11:00");
  });

  it("describes a full week as Every day", () => {
    const allWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ].map((day) => ({ day, open: "07:00", close: "11:00", enabled: true }));
    expect(formatGroupAvailability({ timeSlots: allWeek as never })).toBe(
      "Every day, 07:00–11:00"
    );
  });

  it("lists non-consecutive days separately", () => {
    expect(
      formatGroupAvailability({
        timeSlots: [
          { day: "monday", open: "12:00", close: "15:00", enabled: true },
          { day: "wednesday", open: "12:00", close: "15:00", enabled: true },
        ],
      })
    ).toBe("Mon, Wed, 12:00–15:00");
  });

  it("falls back to per-day lines when windows differ by day", () => {
    expect(
      formatGroupAvailability({
        timeSlots: [
          { day: "monday", open: "07:00", close: "11:00", enabled: true },
          { day: "saturday", open: "09:00", close: "13:00", enabled: true },
        ],
      })
    ).toBe("Mon 07:00–11:00, Sat 09:00–13:00");
  });

  it("describes a one-off date range", () => {
    expect(
      formatGroupAvailability({ dateRange: { start: "2026-12-01", end: "2026-12-31" } })
    ).toBe("1 Dec – 31 Dec 2026");
  });

  it("describes an annually repeating range", () => {
    expect(
      formatGroupAvailability({
        dateRange: { start: "2026-12-01", end: "2026-12-31", repeatsAnnually: true },
      })
    ).toBe("1 Dec – 31 Dec, every year");
  });

  it("joins both parts", () => {
    expect(
      formatGroupAvailability({
        timeSlots: [{ day: "friday", open: "07:00", close: "11:00", enabled: true }],
        dateRange: { start: "2026-12-01", end: "2026-12-31", repeatsAnnually: true },
      })
    ).toBe("Fri, 07:00–11:00 · 1 Dec – 31 Dec, every year");
  });

  it("ignores disabled days", () => {
    expect(
      formatGroupAvailability({
        timeSlots: [
          { day: "monday", open: "07:00", close: "11:00", enabled: true },
          { day: "sunday", open: "07:00", close: "11:00", enabled: false },
        ],
      })
    ).toBe("Mon, 07:00–11:00");
  });

  it("says nothing when there is no schedule", () => {
    expect(formatGroupAvailability(null)).toBe("");
    expect(formatGroupAvailability({})).toBe("");
  });
});

describe("draft round-trip", () => {
  it("starts with both switches off", () => {
    const draft = emptyDraft();
    expect(draft.timeEnabled).toBe(false);
    expect(draft.dateEnabled).toBe(false);
    expect(draftToAvailability(draft)).toBeNull();
  });

  it("round-trips a weekly schedule", () => {
    const draft = draftFromAvailability(weekdayMornings);
    expect(draft.timeEnabled).toBe(true);
    expect(draft.dateEnabled).toBe(false);
    expect(draftToAvailability(draft)).toEqual(weekdayMornings);
  });

  it("round-trips a date range", () => {
    const availability: GroupAvailability = {
      dateRange: { start: "2026-12-01", end: "2026-12-31", repeatsAnnually: true },
    };
    const draft = draftFromAvailability(availability);
    expect(draft.dateEnabled).toBe(true);
    expect(draft.repeatsAnnually).toBe(true);
    expect(draftToAvailability(draft)).toEqual(availability);
  });

  it("keeps a day's times when it is switched off, so toggling back restores them", () => {
    const draft = draftFromAvailability(weekdayMornings);
    const off = {
      ...draft,
      days: { ...draft.days, monday: { ...draft.days.monday, enabled: false } },
    };
    expect(off.days.monday.open).toBe("07:00");
    expect(draftToAvailability(off)?.timeSlots?.map((s) => s.day)).toEqual([
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
    ]);
  });

  it("drops the time part entirely when every day is switched off", () => {
    const draft = draftFromAvailability(weekdayMornings);
    const allOff = {
      ...draft,
      days: Object.fromEntries(
        Object.entries(draft.days).map(([d, v]) => [d, { ...v, enabled: false }])
      ) as typeof draft.days,
    };
    expect(draftToAvailability(allOff)).toBeNull();
  });

  it("drops an incomplete date range rather than sending it", () => {
    const draft = { ...emptyDraft(), dateEnabled: true, start: "2026-12-01", end: "" };
    expect(draftToAvailability(draft)).toBeNull();
  });

  it("applies a preset to the days that are on, leaving days off alone", () => {
    const draft = draftFromAvailability(weekdayMornings);
    const lunch = PRESET_WINDOWS.find((p) => p.label === "Lunch")!;
    const applied = {
      ...draft,
      days: Object.fromEntries(
        Object.entries(draft.days).map(([d, v]) => [
          d,
          v.enabled ? { ...v, open: lunch.open, close: lunch.close } : v,
        ])
      ) as typeof draft.days,
    };
    expect(draftToAvailability(applied)?.timeSlots?.[0]).toEqual({
      day: "monday",
      open: lunch.open,
      close: lunch.close,
      enabled: true,
    });
  });
});

describe("validateDraft", () => {
  it("rejects a day whose close is not after its open", async () => {
    const { validateDraft } = await import("./group-availability");
    const draft = draftFromAvailability(weekdayMornings);
    const bad = {
      ...draft,
      days: { ...draft.days, monday: { enabled: true, open: "11:00", close: "07:00" } },
    };
    expect(validateDraft(bad)).toMatch(/Mon/);
  });

  it("rejects a date range that ends before it starts", async () => {
    const { validateDraft } = await import("./group-availability");
    const draft = {
      ...emptyDraft(),
      dateEnabled: true,
      start: "2026-12-31",
      end: "2026-12-01",
    };
    expect(validateDraft(draft)).toMatch(/end date/i);
  });

  it("rejects a time window switched on with every day unticked", async () => {
    const { validateDraft } = await import("./group-availability");
    const base = emptyDraft();
    const draft = {
      ...base,
      timeEnabled: true,
      days: Object.fromEntries(
        Object.entries(base.days).map(([d, v]) => [d, { ...v, enabled: false }])
      ) as typeof base.days,
    };
    expect(validateDraft(draft)).toMatch(/at least one day/i);
  });

  it("accepts a freshly switched-on time window, which starts with every day on", async () => {
    const { validateDraft } = await import("./group-availability");
    expect(validateDraft({ ...emptyDraft(), timeEnabled: true })).toBeNull();
  });

  it("passes a well-formed schedule", async () => {
    const { validateDraft } = await import("./group-availability");
    expect(validateDraft(draftFromAvailability(weekdayMornings))).toBeNull();
  });
});
