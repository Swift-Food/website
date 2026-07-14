import { describe, it, expect } from "vitest";
import { parseInitialDataFromParams } from "./parseInitialDataFromParams";

const parse = (qs: string) => parseInitialDataFromParams(new URLSearchParams(qs));

describe("parseInitialDataFromParams", () => {
  it("returns undefined when no relevant params are present", () => {
    expect(parse("partner=acme")).toBeUndefined();
    expect(parse("")).toBeUndefined();
  });

  it("maps flat event + guest params", () => {
    expect(parse("eventName=Gala&startDate=2026-08-01&startTime=18:00&guests=50")).toEqual({
      eventName: "Gala",
      eventStartDate: "2026-08-01",
      eventStartTime: "18:00",
      guestCount: 50,
    });
  });

  it("nests deliveryAddress and coerces lat/lng to numbers", () => {
    const result = parse("line1=1+High+St&city=London&postcode=E1+6AN&lat=51.5&lng=-0.1");
    expect(result?.deliveryAddress).toEqual({
      line1: "1 High St",
      city: "London",
      postcode: "E1 6AN",
      lat: 51.5,
      lng: -0.1,
    });
  });

  it("nests contact and maps org -> organization", () => {
    const result = parse("name=Jo&email=jo@acme.com&phone=%2B447700900000&org=Acme");
    expect(result?.contact).toEqual({
      name: "Jo",
      email: "jo@acme.com",
      phone: "+447700900000",
      organization: "Acme",
    });
  });

  it("ignores non-numeric guests/lat/lng", () => {
    const result = parse("eventName=Gala&guests=abc&lat=xyz");
    expect(result).toEqual({ eventName: "Gala" });
    expect(result?.guestCount).toBeUndefined();
  });

  it("omits deliveryAddress when only optional address parts exist without line1/city/postcode", () => {
    const result = parse("line2=Floor+2");
    expect(result?.deliveryAddress).toBeUndefined();
  });
});
