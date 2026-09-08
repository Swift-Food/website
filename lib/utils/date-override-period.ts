/**
 * Date overrides: the days a restaurant is closed, or open on different hours,
 * regardless of its weekly schedule.
 *
 * A restaurant closing for a holiday used to have to add one override per day.
 * It can now give a period, which is saved as its individual days, every one
 * of them carrying the same `rangeId`.
 *
 * The days are stored individually on purpose. Order creation, the chat
 * pipeline, the catering menu and the availability fingerprint all decide
 * whether a restaurant is open by looking for the day's own `date`; a stored
 * range would be a shape each of them had to learn, and any one that missed it
 * would show a closed kitchen as open. The `rangeId` only serves the editor,
 * so it can show a period back as the single row that was entered and remove
 * it in one go.
 */

export interface OverrideTimeSlot {
  open: string;
  close: string;
}

/** An override as the API stores it: one day. */
export interface StoredDateOverride {
  date: string; // "YYYY-MM-DD"
  isClosed: boolean;
  reason?: string;
  timeSlots?: OverrideTimeSlot[];
  rangeId?: string;
}

/** An override as the editor shows it: one day, or a period. */
export interface DateOverrideRow {
  date: string; // "YYYY-MM-DD" — the first day
  endDate: string; // "YYYY-MM-DD" — the last day; empty for a single day
  isClosed: boolean;
  reason: string;
  timeSlots: OverrideTimeSlot[];
  rangeId?: string;
}

/**
 * The API accepts 400 date overrides, and a period is stored as its days —
 * room for a year of closure, which is longer than anyone should need.
 */
export const MAX_OVERRIDE_DAYS = 400;

/** Every day from `start` to `end` inclusive, as "YYYY-MM-DD". */
export const eachDayInPeriod = (start: string, end: string): string[] => {
  const days: string[] = [];
  // Stepped in UTC: local time would drop or repeat a day across a clock change.
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) return days;
  while (cursor <= last) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
};

export const newRangeId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `r${Date.now()}${Math.floor(Math.random() * 1e6)}`;

/** How many days a set of rows will occupy once periods are saved as days. */
export const countOverrideDays = (rows: DateOverrideRow[]): number =>
  rows
    .filter((row) => row.date)
    .reduce(
      (total, row) =>
        total +
        (row.endDate && row.endDate >= row.date
          ? eachDayInPeriod(row.date, row.endDate).length
          : 1),
      0
    );

/** Bring the stored days of a period back together into the row entered. */
export const collapseStoredOverrides = (
  stored: StoredDateOverride[]
): DateOverrideRow[] => {
  const rows: DateOverrideRow[] = [];
  const periodRowByRangeId = new Map<string, DateOverrideRow>();

  for (const entry of stored) {
    const row = entry.rangeId ? periodRowByRangeId.get(entry.rangeId) : undefined;
    if (row) {
      // Days can arrive in any order, so widen the row to hold this one.
      if (entry.date < row.date) row.date = entry.date;
      if (entry.date > row.endDate) row.endDate = entry.date;
      continue;
    }

    const fresh: DateOverrideRow = {
      date: entry.date,
      endDate: entry.rangeId ? entry.date : "",
      isClosed: entry.isClosed,
      reason: entry.reason || "",
      timeSlots: entry.timeSlots || [],
      rangeId: entry.rangeId,
    };
    rows.push(fresh);
    if (entry.rangeId) periodRowByRangeId.set(entry.rangeId, fresh);
  }

  // A period of a single day reads as a single date.
  for (const row of rows) if (row.endDate === row.date) row.endDate = "";

  return rows.sort((a, b) => a.date.localeCompare(b.date));
};

/** Turn the editor's rows into the days the API stores. */
export const expandOverrideRows = (
  rows: DateOverrideRow[]
): StoredDateOverride[] =>
  rows
    .filter((row) => row.date)
    .flatMap((row) => {
      const shared = {
        isClosed: row.isClosed,
        reason: row.reason || undefined,
        timeSlots:
          !row.isClosed && row.timeSlots.length > 0 ? row.timeSlots : undefined,
      };
      if (!row.endDate || row.endDate === row.date) {
        return [{ date: row.date, ...shared }];
      }
      const rangeId = row.rangeId || newRangeId();
      return eachDayInPeriod(row.date, row.endDate).map((date) => ({
        date,
        ...shared,
        rangeId,
      }));
    });
