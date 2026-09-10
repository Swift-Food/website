import { describe, expect, it } from "vitest";
import {
  hasRemittance,
  remittanceFilename,
  remittanceReference,
} from "./withdrawal-remittance";

describe("which withdrawals have a statement", () => {
  it("offers one for a withdrawal Stripe has paid out", () => {
    expect(hasRemittance({ id: "w1", stripePayoutId: "po_123" })).toBe(true);
  });

  it("offers none before Stripe has paid out — the API refuses those", () => {
    expect(hasRemittance({ id: "w1", stripePayoutId: null })).toBe(false);
    expect(hasRemittance({ id: "w1" })).toBe(false);
  });

  it("offers none for a payout Stripe made on its own schedule", () => {
    // These rows carry a Stripe payout id as their id and have no record of
    // ours behind them, so asking for a statement would 404.
    expect(
      hasRemittance({ id: "po_1abc", stripePayoutId: "po_1abc", isAutomatic: true }),
    ).toBe(false);
  });
});

describe("the reference on the document", () => {
  it("is the first eight characters of the id, upper case", () => {
    expect(remittanceReference("3f2a9c1e-5b6d-4e7f-8a9b-0c1d2e3f4a5b")).toBe("WD-3F2A9C1E");
  });

  it("names the file the same way the backend does", () => {
    expect(remittanceFilename("3f2a9c1e-5b6d-4e7f-8a9b-0c1d2e3f4a5b")).toBe(
      "withdrawal-statement-WD-3F2A9C1E.pdf",
    );
  });
});
