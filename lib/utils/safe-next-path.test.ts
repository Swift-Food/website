import { describe, it, expect } from "vitest";
import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  it("keeps a same-site path, query string and all", () => {
    expect(safeNextPath("/event-order?partner=acme")).toBe("/event-order?partner=acme");
  });

  it("falls back when there is nothing to return to", () => {
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath("   ")).toBeNull();
  });

  it("refuses an absolute URL to another origin", () => {
    expect(safeNextPath("https://evil.example/steal")).toBeNull();
  });

  it("refuses a protocol-relative URL, which a browser reads as another origin", () => {
    expect(safeNextPath("//evil.example/steal")).toBeNull();
    expect(safeNextPath("/\\evil.example/steal")).toBeNull();
  });

  it("refuses a scheme smuggled in behind a leading slash", () => {
    expect(safeNextPath("/javascript:alert(1)")).toBeNull();
  });

  it("refuses a bare relative path, which could escape the site's routes", () => {
    expect(safeNextPath("event-order")).toBeNull();
  });
});
