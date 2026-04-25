/**
 * Formatting utilities
 * Pure functions for data formatting
 */

/**
 * Format date to GB locale
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format currency amount in GBP
 */
export function formatCurrency(amount: number | string): string {
  return `£${Number(amount).toFixed(2)}`;
}

/**
 * Format event time (subtract 15 minutes for collection time)
 */
export function formatEventTime(eventTime: string): string {
  const [hours, minutes] = eventTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes - 15;
  const newHours = Math.floor(((totalMinutes + 24 * 60) % (24 * 60)) / 60);
  const newMinutes = ((totalMinutes % 60) + 60) % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
    2,
    "0"
  )}`;
}

function subtractMinutes(time: string, mins: number): string {
  const [hours, minutes] = time.split(":").map(Number);
  const total = ((hours * 60 + minutes - mins) % (24 * 60) + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function formatCollectionTimeRange(collectionTime: string): string {
  return `${subtractMinutes(collectionTime, 30)} – ${collectionTime}`;
}

export function formatEventTimeRange(eventTime: string): string {
  const collectionTime = formatEventTime(eventTime);
  return formatCollectionTimeRange(collectionTime);
}
