import { format, parse } from "date-fns";

/** Formats a "HH:mm" 24-hour time string (as stored) into a 12-hour "h:mm AM/PM" display string. */
export function formatTimeDisplay(time: string): string {
  const parsed = parse(time, "HH:mm", new Date());
  if (Number.isNaN(parsed.getTime())) return time;
  return format(parsed, "h:mm a");
}
