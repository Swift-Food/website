import { describe, expect, it } from "vitest";
import {
  collapseStoredOverrides,
  countOverrideDays,
  eachDayInPeriod,
  expandOverrideRows,
  type DateOverrideRow,
} from "./date-override-period";

/**
 * A restaurant closes for a holiday here. Getting this wrong either takes
 * orders on a day nobody is cooking, or refuses them on a day someone is.
 */
describe("date override periods", () => {
  describe("eachDayInPeriod", () => {
    it("includes both ends", () => {
      expect(eachDayInPeriod("2026-12-24", "2026-12-27")).toEqual([
        "2026-12-24",
        "2026-12-25",
        "2026-12-26",
        "2026-12-27",
      ]);
    });

    it("gives a single day when the ends meet", () => {
      expect(eachDayInPeriod("2026-12-25", "2026-12-25")).toEqual(["2026-12-25"]);
    });

    it("crosses a month, a year and a leap day", () => {
      expect(eachDayInPeriod("2026-12-30", "2027-01-02")).toEqual([
        "2026-12-30",
        "2026-12-31",
        "2027-01-01",
        "2027-01-02",
      ]);
      expect(eachDayInPeriod("2028-02-28", "2028-03-01")).toEqual([
        "2028-02-28",
        "2028-02-29",
        "2028-03-01",
      ]);
    });

    it("does not drop or repeat a day across the BST clock changes", () => {
      // The clocks go forward on 29 March 2026 and back on 25 October 2026.
      // Counted in local time, one of these periods loses a day and the other
      // repeats one.
      expect(eachDayInPeriod("2026-03-28", "2026-03-30")).toEqual([
        "2026-03-28",
        "2026-03-29",
        "2026-03-30",
      ]);
      expect(eachDayInPeriod("2026-10-24", "2026-10-26")).toEqual([
        "2026-10-24",
        "2026-10-25",
        "2026-10-26",
      ]);
    });

    it("gives nothing when the period runs backwards", () => {
      expect(eachDayInPeriod("2026-12-27", "2026-12-24")).toEqual([]);
    });
  });

  describe("expandOverrideRows", () => {
    const row = (over: Partial<DateOverrideRow>): DateOverrideRow => ({
      date: "",
      endDate: "",
      isClosed: true,
      reason: "",
      timeSlots: [],
      ...over,
    });

    it("saves a period as one closed day per date, under one id", () => {
      const saved = expandOverrideRows([
        row({ date: "2026-12-24", endDate: "2026-12-26", reason: "Christmas" }),
      ]);

      expect(saved.map((o) => o.date)).toEqual([
        "2026-12-24",
        "2026-12-25",
        "2026-12-26",
      ]);
      // Every consumer of dateOverrides reads these two fields and nothing else.
      expect(saved.every((o) => o.isClosed && o.reason === "Christmas")).toBe(true);
      expect(new Set(saved.map((o) => o.rangeId)).size).toBe(1);
      expect(saved[0].rangeId).toBeTruthy();
    });

    it("leaves a single day exactly as it was, with no id", () => {
      const saved = expandOverrideRows([row({ date: "2026-12-25" })]);
      expect(saved).toEqual([
        { date: "2026-12-25", isClosed: true, reason: undefined, timeSlots: undefined },
      ]);
    });

    it("treats a period ending on its start date as a single day", () => {
      const saved = expandOverrideRows([
        row({ date: "2026-12-25", endDate: "2026-12-25" }),
      ]);
      expect(saved).toHaveLength(1);
      expect(saved[0].rangeId).toBeUndefined();
    });

    it("gives every day of a period the same shortened hours", () => {
      const saved = expandOverrideRows([
        row({
          date: "2026-12-27",
          endDate: "2026-12-29",
          isClosed: false,
          timeSlots: [{ open: "10:00", close: "14:00" }],
        }),
      ]);

      expect(saved).toHaveLength(3);
      expect(
        saved.every(
          (o) =>
            !o.isClosed &&
            o.timeSlots?.length === 1 &&
            o.timeSlots[0].close === "14:00"
        )
      ).toBe(true);
    });

    it("keeps the id of a period that was already saved, so editing it does not duplicate it", () => {
      const saved = expandOverrideRows([
        row({ date: "2026-12-24", endDate: "2026-12-25", rangeId: "abc" }),
      ]);
      expect(saved.map((o) => o.rangeId)).toEqual(["abc", "abc"]);
    });

    it("drops a row with no date", () => {
      expect(expandOverrideRows([row({ date: "" })])).toEqual([]);
    });
  });

  describe("a period survives being saved and loaded again", () => {
    it("comes back as the one row that was entered", () => {
      const entered: DateOverrideRow[] = [
        { date: "2026-12-24", endDate: "2027-01-02", isClosed: true, reason: "Christmas", timeSlots: [] },
        { date: "2026-08-25", endDate: "", isClosed: true, reason: "Bank holiday", timeSlots: [] },
      ];

      const reloaded = collapseStoredOverrides(expandOverrideRows(entered));

      expect(reloaded).toHaveLength(2);
      expect(reloaded[0]).toMatchObject({
        date: "2026-08-25",
        endDate: "",
        reason: "Bank holiday",
      });
      expect(reloaded[1]).toMatchObject({
        date: "2026-12-24",
        endDate: "2027-01-02",
        reason: "Christmas",
      });
    });

    it("rebuilds a period whose days come back in any order", () => {
      const reloaded = collapseStoredOverrides([
        { date: "2026-12-26", isClosed: true, rangeId: "x" },
        { date: "2026-12-24", isClosed: true, rangeId: "x" },
        { date: "2026-12-25", isClosed: true, rangeId: "x" },
      ]);

      expect(reloaded).toEqual([
        {
          date: "2026-12-24",
          endDate: "2026-12-26",
          isClosed: true,
          reason: "",
          timeSlots: [],
          rangeId: "x",
        },
      ]);
    });

    it("leaves overrides saved before periods existed alone", () => {
      // Every override in the database today looks like this.
      const reloaded = collapseStoredOverrides([
        { date: "2026-12-25", isClosed: true, reason: "Christmas Day" },
        { date: "2026-12-26", isClosed: true, reason: "Boxing Day" },
      ]);

      expect(reloaded.map((r) => [r.date, r.endDate])).toEqual([
        ["2026-12-25", ""],
        ["2026-12-26", ""],
      ]);
    });

    it("does not merge two periods that happen to touch", () => {
      const reloaded = collapseStoredOverrides([
        { date: "2026-12-24", isClosed: true, rangeId: "a", reason: "Christmas" },
        { date: "2026-12-25", isClosed: true, rangeId: "a", reason: "Christmas" },
        { date: "2026-12-26", isClosed: true, rangeId: "b", reason: "Stocktake" },
        { date: "2026-12-27", isClosed: true, rangeId: "b", reason: "Stocktake" },
      ]);

      expect(reloaded).toHaveLength(2);
      expect(reloaded[0].reason).toBe("Christmas");
      expect(reloaded[1].reason).toBe("Stocktake");
    });
  });

  describe("countOverrideDays", () => {
    const row = (date: string, endDate = ""): DateOverrideRow => ({
      date,
      endDate,
      isClosed: true,
      reason: "",
      timeSlots: [],
    });

    it("counts the days a period will take up, not the rows", () => {
      expect(countOverrideDays([row("2026-12-24", "2026-12-26"), row("2026-08-25")])).toBe(4);
    });

    it("ignores empty and backwards rows rather than throwing", () => {
      expect(countOverrideDays([row(""), row("2026-12-27", "2026-12-24")])).toBe(1);
    });
  });
});
