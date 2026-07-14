import type { InitialData } from "@swift-food-services/catering-widget";

/**
 * Maps the flat query-string convention used by branded deep-links onto the
 * catering widget's nested InitialData shape. Returns undefined when no
 * recognized prefill params are present, so callers can avoid passing an
 * empty object to the widget.
 */
export function parseInitialDataFromParams(
  params: URLSearchParams,
): InitialData | undefined {
  const str = (key: string): string | undefined => {
    const v = params.get(key);
    return v && v.trim() !== "" ? v : undefined;
  };
  const num = (key: string): number | undefined => {
    const v = str(key);
    if (v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const data: InitialData = {};

  const eventName = str("eventName");
  if (eventName) data.eventName = eventName;
  const startDate = str("startDate");
  if (startDate) data.eventStartDate = startDate;
  const startTime = str("startTime");
  if (startTime) data.eventStartTime = startTime;
  const endDate = str("endDate");
  if (endDate) data.eventEndDate = endDate;
  const endTime = str("endTime");
  if (endTime) data.eventEndTime = endTime;
  const guestCount = num("guests");
  if (guestCount !== undefined) data.guestCount = guestCount;

  // deliveryAddress requires line1, city, postcode per the widget type; only
  // build it when all three required parts are present.
  const line1 = str("line1");
  const city = str("city");
  const postcode = str("postcode");
  if (line1 && city && postcode) {
    data.deliveryAddress = {
      line1,
      city,
      postcode,
      ...(str("line2") ? { line2: str("line2")! } : {}),
      ...(num("lat") !== undefined ? { lat: num("lat")! } : {}),
      ...(num("lng") !== undefined ? { lng: num("lng")! } : {}),
    };
  }

  const contact: NonNullable<InitialData["contact"]> = {};
  const name = str("name");
  if (name) contact.name = name;
  const email = str("email");
  if (email) contact.email = email;
  const phone = str("phone");
  if (phone) contact.phone = phone;
  const org = str("org");
  if (org) contact.organization = org;
  if (Object.keys(contact).length > 0) data.contact = contact;

  return Object.keys(data).length > 0 ? data : undefined;
}
