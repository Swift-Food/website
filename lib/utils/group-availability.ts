/**
 * Per-menu-group availability windows — restaurant-portal side.
 *
 * A group can be limited to a time of day ("Breakfast, 07:00–11:00") and/or
 * to a season ("Christmas menu, 1–31 December"). Both are optional and
 * independent; when both are set, both must hold.
 *
 * Windows are checked against the customer's DELIVERY slot, not the clock
 * at browse time — catering is booked days or weeks ahead, so a Christmas
 * menu has to be bookable in November.
 *
 * `formatGroupAvailability` mirrors the backend helper of the same name so
 * the pill on the menu page reads exactly like the customer-facing copy.
 */

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface GroupTimeSlot {
  day: Weekday;
  /** 'HH:MM' */
  open: string;
  /** 'HH:MM' */
  close: string;
  enabled: boolean;
}

export interface GroupDateRange {
  /** 'YYYY-MM-DD' */
  start: string;
  /** 'YYYY-MM-DD', inclusive */
  end: string;
  /** When true the year is ignored, so 1–31 Dec means every December. */
  repeatsAnnually?: boolean;
}

export interface GroupAvailability {
  timeSlots?: GroupTimeSlot[];
  dateRange?: GroupDateRange;
}

export const WEEK: readonly Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const SHORT_DAY: Record<Weekday, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** One-tap windows for the shapes restaurants reach for most. */
export const PRESET_WINDOWS: ReadonlyArray<{
  label: string;
  open: string;
  close: string;
}> = [
  { label: "Breakfast", open: "07:00", close: "11:00" },
  { label: "Lunch", open: "12:00", close: "15:00" },
  { label: "Dinner", open: "18:00", close: "22:00" },
  { label: "All day", open: "00:00", close: "23:59" },
];

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

function formatDayList(days: Weekday[]): string {
  const ordered = WEEK.filter((d) => days.includes(d));
  if (ordered.length === 7) return "Every day";
  const consecutive = ordered.every(
    (d, i) => i === 0 || WEEK.indexOf(d) === WEEK.indexOf(ordered[i - 1]) + 1
  );
  if (consecutive && ordered.length >= 3) {
    return `${SHORT_DAY[ordered[0]]}–${SHORT_DAY[ordered[ordered.length - 1]]}`;
  }
  return ordered.map((d) => SHORT_DAY[d]).join(", ");
}

function formatTimeSlots(slots: GroupTimeSlot[]): string {
  const enabled = slots.filter((s) => s.enabled);
  if (enabled.length === 0) return "";

  // One window shared across a set of days is by far the common case and
  // reads much better collapsed than as five identical lines.
  const windows = new Set(enabled.map((s) => `${s.open}–${s.close}`));
  if (windows.size === 1) {
    return `${formatDayList(enabled.map((s) => s.day))}, ${enabled[0].open}–${
      enabled[0].close
    }`;
  }

  return WEEK.flatMap((day) =>
    enabled
      .filter((s) => s.day === day)
      .map((s) => `${SHORT_DAY[day]} ${s.open}–${s.close}`)
  ).join(", ");
}

function formatDay(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

export function formatDateRange(range: GroupDateRange): string {
  const start = formatDay(range.start);
  const end = formatDay(range.end);
  if (range.repeatsAnnually) return `${start} – ${end}, every year`;
  const startYear = range.start.slice(0, 4);
  const endYear = range.end.slice(0, 4);
  return startYear === endYear
    ? `${start} – ${end} ${endYear}`
    : `${start} ${startYear} – ${end} ${endYear}`;
}

/** Plain-English summary. Empty string when the group has no schedule. */
export function formatGroupAvailability(
  availability: GroupAvailability | null | undefined
): string {
  if (!availability) return "";
  const parts: string[] = [];
  if (availability.timeSlots?.length) {
    const slots = formatTimeSlots(availability.timeSlots);
    if (slots) parts.push(slots);
  }
  if (availability.dateRange) parts.push(formatDateRange(availability.dateRange));
  return parts.join(" · ");
}

// ---------------------------------------------------------------------------
// Editor draft
// ---------------------------------------------------------------------------

export interface DayDraft {
  enabled: boolean;
  open: string;
  close: string;
}

/**
 * What the modal edits. Every day always has a row so switching one off and
 * back on restores the times the restaurant already typed, and the two
 * sections carry explicit on/off flags rather than being inferred from
 * whether their fields happen to be filled.
 */
export interface AvailabilityDraft {
  timeEnabled: boolean;
  days: Record<Weekday, DayDraft>;
  dateEnabled: boolean;
  start: string;
  end: string;
  repeatsAnnually: boolean;
}

const DEFAULT_WINDOW = { open: "07:00", close: "11:00" };

export function emptyDraft(): AvailabilityDraft {
  return {
    timeEnabled: false,
    days: Object.fromEntries(
      WEEK.map((day) => [day, { enabled: true, ...DEFAULT_WINDOW }])
    ) as Record<Weekday, DayDraft>,
    dateEnabled: false,
    start: "",
    end: "",
    repeatsAnnually: false,
  };
}

export function draftFromAvailability(
  availability: GroupAvailability | null | undefined
): AvailabilityDraft {
  const draft = emptyDraft();
  const slots = availability?.timeSlots ?? [];

  if (slots.length > 0) {
    draft.timeEnabled = true;
    // A day absent from the stored schedule is off. Off days still carry
    // the first configured window, so switching one on starts from the
    // same times as its neighbours rather than back at the default.
    const fallback = { open: slots[0].open, close: slots[0].close };
    for (const day of WEEK) {
      const slot = slots.find((s) => s.day === day && s.enabled);
      draft.days[day] = slot
        ? { enabled: true, open: slot.open, close: slot.close }
        : { enabled: false, ...fallback };
    }
  }

  const range = availability?.dateRange;
  if (range) {
    draft.dateEnabled = true;
    draft.start = range.start;
    draft.end = range.end;
    draft.repeatsAnnually = !!range.repeatsAnnually;
  }

  return draft;
}

/**
 * The payload for the API — or null when the draft describes no
 * constraint at all, which the endpoint reads as "clear the schedule".
 */
export function draftToAvailability(
  draft: AvailabilityDraft
): GroupAvailability | null {
  const availability: GroupAvailability = {};

  if (draft.timeEnabled) {
    const timeSlots = WEEK.filter((day) => draft.days[day].enabled).map((day) => ({
      day,
      open: draft.days[day].open,
      close: draft.days[day].close,
      enabled: true,
    }));
    if (timeSlots.length > 0) availability.timeSlots = timeSlots;
  }

  if (draft.dateEnabled && draft.start && draft.end) {
    availability.dateRange = draft.repeatsAnnually
      ? { start: draft.start, end: draft.end, repeatsAnnually: true }
      : { start: draft.start, end: draft.end };
  }

  return availability.timeSlots || availability.dateRange ? availability : null;
}

/** Human-readable problem with the draft, or null when it is fit to save. */
export function validateDraft(draft: AvailabilityDraft): string | null {
  if (draft.timeEnabled) {
    const on = WEEK.filter((day) => draft.days[day].enabled);
    if (on.length === 0) {
      return "Turn on at least one day, or switch off the time-of-day window.";
    }
    for (const day of on) {
      const { open, close } = draft.days[day];
      if (!open || !close) return `${SHORT_DAY[day]}: set both an opening and a closing time.`;
      if (open >= close) {
        return `${SHORT_DAY[day]}: the closing time must be after the opening time.`;
      }
    }
  }

  if (draft.dateEnabled) {
    if (!draft.start || !draft.end) return "Set both a start and an end date.";
    if (draft.start > draft.end) {
      return "The end date must be on or after the start date.";
    }
  }

  return null;
}
