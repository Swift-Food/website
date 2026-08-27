import { describe, it, expect } from "vitest";
import { orderTitle } from "./orderDisplay";
import type { MyCateringOrder } from "@/types/api/customer-account.api.types";

const order = (fields: Partial<MyCateringOrder>): MyCateringOrder =>
  ({ id: "e264a1b2-0000-0000-0000-000000000000", ...fields }) as MyCateringOrder;

describe("orderTitle", () => {
  it("uses the name the customer gave the event", () => {
    expect(
      orderTitle(
        order({
          eventName: "Q3 Team Offsite",
          mealSessions: [{ sessionName: "Main Event" }],
          organization: "Acme",
        } as Partial<MyCateringOrder>)
      )
    ).toBe("Q3 Team Offsite");
  });

  it("trims it", () => {
    expect(orderTitle(order({ eventName: "  Q3 Team Offsite  " }))).toBe(
      "Q3 Team Offsite"
    );
  });

  it("falls back to the session name on an order placed before the field existed", () => {
    expect(
      orderTitle(
        order({
          eventName: null,
          mealSessions: [{ sessionName: "Lunch" }],
        } as Partial<MyCateringOrder>)
      )
    ).toBe("Lunch");
  });

  it("ignores a whitespace-only name", () => {
    expect(
      orderTitle(
        order({
          eventName: "   ",
          mealSessions: [{ sessionName: "Lunch" }],
        } as Partial<MyCateringOrder>)
      )
    ).toBe("Lunch");
  });

  it("falls back to the organisation when there is no session name", () => {
    expect(orderTitle(order({ organization: "Acme" }))).toBe("Acme");
  });

  it("falls back to a short id when it has nothing else", () => {
    expect(orderTitle(order({}))).toBe("Order #e264");
  });
});
