/**
 * Time-manipulation helpers for the weather app.
 *
 * Open-Meteo returns all timestamps in the location's own timezone when
 * called with `timezone=auto`. The strings are ISO-like (`YYYY-MM-DDTHH:mm`)
 * without a timezone suffix, which means they can be compared lexically
 * for "same day", "same hour", or "before/after" operations without ever
 * constructing a `Date`. We lean into that -- it avoids subtle timezone
 * bugs from accidentally reinterpreting the strings as UTC.
 *
 * For display we *do* build `Date` objects, but only for the purpose of
 * extracting weekday and hour-of-day through `Intl.DateTimeFormat` using
 * the location's timezone. That isolates all timezone handling to one
 * place.
 *
 * @module domain/time
 */

/** Extract the date portion (YYYY-MM-DD) of a local ISO timestamp. */
export function dateOf(isoLocal: string): string {
  return isoLocal.slice(0, 10);
}

/** Extract the hour portion (00-23) of a local ISO timestamp. */
export function hourOf(isoLocal: string): number {
  return Number(isoLocal.slice(11, 13));
}

/**
 * Find the index of the first hourly sample whose ISO timestamp is
 * greater than or equal to the given reference ISO timestamp. Returns 0
 * when nothing matches (so the UI still shows something rather than
 * being blank).
 */
export function findHourIndexFrom(hourlyTimes: string[], fromIsoLocal: string): number {
  for (let i = 0; i < hourlyTimes.length; i += 1) {
    if (hourlyTimes[i]! >= fromIsoLocal) {
      return i;
    }
  }
  return 0;
}

/**
 * Parse an Open-Meteo local ISO timestamp (no timezone suffix) as if it
 * were UTC. This is the approach the web UI uses to format the string
 * into a weekday label: we never want to apply the *viewer's* timezone,
 * we want to display the time as Open-Meteo returned it for the location.
 * Reading the string as UTC and then formatting with `timeZone: "UTC"`
 * preserves the original wall-clock.
 */
export function parseLocalIsoAsUtc(isoLocal: string): Date {
  // The string has no "Z" or "+HH:MM", so browsers treat it as local.
  // Appending "Z" pins it to UTC, matching the preservation trick above.
  return new Date(`${isoLocal}Z`);
}

/** Format a short weekday label (e.g. "Mon" / "Mo") from an ISO date string. */
export function formatWeekdayShort(dateIso: string, locale: string): string {
  const date = parseLocalIsoAsUtc(`${dateIso}T12:00`);
  return new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(date);
}

/** Format an "hour of day" label (e.g. "14 Uhr" / "2 PM") from an ISO timestamp. */
export function formatHourLabel(isoLocal: string, locale: string): string {
  const date = parseLocalIsoAsUtc(isoLocal);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    hour12: locale.startsWith("en"),
    timeZone: "UTC",
  }).format(date);
}

/** Format a "HH:MM" clock time (e.g. sunrise / sunset) from an ISO timestamp. */
export function formatClockTime(isoLocal: string, locale: string): string {
  const date = parseLocalIsoAsUtc(isoLocal);
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: locale.startsWith("en"),
    timeZone: "UTC",
  }).format(date);
}

/**
 * Compare two local ISO date strings ("YYYY-MM-DD") and return `true` if
 * they refer to the same calendar day.
 */
export function isSameLocalDate(aIso: string, bIso: string): boolean {
  return dateOf(aIso) === dateOf(bIso);
}
