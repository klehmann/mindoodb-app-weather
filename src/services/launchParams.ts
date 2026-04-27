/**
 * Parse and validate Haven app launch parameters for the weather app.
 *
 * Haven delivers `launchParameters` as a flat `Record<string, string>`,
 * so everything is a string at the boundary. This module converts that
 * raw record into the app's typed shape and applies defaults.
 *
 * Parameters:
 *
 * | Name                    | Req | Default              | Format                                             |
 * |-------------------------|-----|----------------------|----------------------------------------------------|
 * | `locations`             | no  | `"New York City;Berlin;Singapur"` | "Berlin, Deutschland;Karlsruhe, Deutschland;Washington, USA" |
 * | `units`                 | no  | `metric`             | `metric` or `imperial`                             |
 * | `refreshIntervalMinutes`| no  | `0`                  | non-negative integer; `0` disables auto-refresh    |
 *
 * The `locations` parameter is technically optional: when not provided
 * (or when it parses to an empty list), the app falls back to a small
 * default set of queries so Haven administrators get an immediately
 * useful multi-city weather tile without any configuration. The native
 * country name is used where helpful because Open-Meteo's geocoder
 * matches country names in the target language.
 *
 * @module services/launchParams
 */

export type Units = "metric" | "imperial";

export interface ParsedLaunchParams {
  /** Ordered list of user-supplied location strings, already trimmed and de-duped. */
  locationQueries: string[];
  /** Measurement system used for display and for Open-Meteo request options. */
  units: Units;
  /** Minutes between automatic forecast refreshes. `0` disables auto-refresh. */
  refreshIntervalMinutes: number;
}

/**
 * Fallback used when the `locations` launch parameter is missing or
 * parses to an empty list. Keeping this as a single, well-known city
 * makes the app immediately useful when dropped into a Haven tile
 * without any configuration.
 */
export const DEFAULT_LOCATION_QUERIES = [
  "New York City",
  "Berlin",
  "Singapur",
] as const;

export const DEFAULT_LAUNCH_PARAMS: ParsedLaunchParams = {
  locationQueries: [...DEFAULT_LOCATION_QUERIES],
  units: "metric",
  refreshIntervalMinutes: 0,
};

/**
 * Split the raw `locations` string on `;`, trim each entry, drop empties,
 * and de-duplicate by case-insensitive normalized form while preserving
 * original order and original casing of the first occurrence.
 */
export function parseLocationsString(raw: string | undefined | null): string[] {
  if (!raw) {
    return [];
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const rawEntry of raw.split(";")) {
    const entry = rawEntry.trim();
    if (!entry) {
      continue;
    }
    const key = entry.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(entry);
  }
  return out;
}

/** Coerce the `units` parameter to a known value; defaults to `metric`. */
export function parseUnits(raw: string | undefined | null): Units {
  if (typeof raw !== "string") {
    return "metric";
  }
  const normalized = raw.trim().toLowerCase();
  if (normalized === "imperial" || normalized === "us" || normalized === "english") {
    return "imperial";
  }
  return "metric";
}

/**
 * Parse the refresh interval. Accepts integer minutes in `[0, 1440]`.
 * Invalid / negative / non-integer inputs clamp to `0` (refresh disabled).
 */
export function parseRefreshInterval(raw: string | undefined | null): number {
  if (typeof raw !== "string" || raw.trim() === "") {
    return 0;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  const rounded = Math.round(parsed);
  if (rounded < 0) {
    return 0;
  }
  if (rounded > 1440) {
    return 1440;
  }
  return rounded;
}

/**
 * Parse the full launch parameters record from the Haven launch context.
 * Unknown keys are ignored. This function is pure and side-effect-free.
 */
export function parseLaunchParams(
  params: Record<string, string> | null | undefined,
): ParsedLaunchParams {
  const safe = params ?? {};
  const parsedLocations = parseLocationsString(safe.locations);
  return {
    locationQueries:
      parsedLocations.length > 0 ? parsedLocations : [...DEFAULT_LOCATION_QUERIES],
    units: parseUnits(safe.units),
    refreshIntervalMinutes: parseRefreshInterval(safe.refreshIntervalMinutes),
  };
}
