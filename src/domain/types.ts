/**
 * Shared domain types used across the weather app.
 *
 * These types describe the *internal* shape of our data after raw API
 * responses are decoded. The raw Open-Meteo response types stay inside
 * `services/openMeteo.ts` so the UI never reaches into snake_case field
 * names.
 *
 * @module domain/types
 */

/** WMO weather codes collapsed into a small set used to pick backgrounds and icons. */
export type VisualState = "clear" | "partly-cloudy" | "cloudy" | "rain" | "snow" | "storm";

/** Either day or night variant of a visual state -- used for background + icon selection. */
export type DayOrNight = "day" | "night";

/**
 * Combined visual descriptor for a moment in time (current or a daily row).
 * `key` is `${state}-${period}`, matching the filenames under
 * `public/backgrounds/<key>.jpg`.
 */
export interface VisualCondition {
  state: VisualState;
  period: DayOrNight;
  key: `${VisualState}-${DayOrNight}`;
  /** Original WMO code retained for debugging and i18n lookups. */
  weatherCode: number;
}

/** A geocoded location, either freshly resolved or loaded from the cache. */
export interface ResolvedLocation {
  /** Original user-supplied query string (e.g. "Karlsruhe, Germany"). */
  query: string;
  /** Display name returned by the geocoder, falling back to query on failure. */
  displayName: string;
  /** ISO country code (e.g. "DE") when available. */
  countryCode?: string;
  /** Country name returned by the geocoder (may be absent). */
  country?: string;
  /** Region/state label (may be absent). */
  admin1?: string;
  latitude: number;
  longitude: number;
  /** IANA timezone string, e.g. "Europe/Berlin". */
  timezone: string;
}

/** Current-conditions snapshot for a single location. */
export interface CurrentConditions {
  /** ISO timestamp of the observation (from API). */
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirectionDeg: number;
  pressureMsl: number;
  surfacePressure: number;
  uvIndex: number | null;
  visibility: number | null;
  isDay: boolean;
  weatherCode: number;
}

/** One entry in the hourly forecast timeline. */
export interface HourlyPoint {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number | null;
  uvIndex: number | null;
}

/** One entry in the daily forecast timeline. */
export interface DailyPoint {
  /** ISO date string (YYYY-MM-DD) for this day in the location's timezone. */
  date: string;
  weatherCode: number;
  tempMin: number;
  tempMax: number;
  precipitationProbabilityMax: number | null;
  uvIndexMax: number | null;
  sunrise: string;
  sunset: string;
}

/** Decoded, UI-friendly forecast payload for a single location. */
export interface LocationForecast {
  location: ResolvedLocation;
  current: CurrentConditions;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  /** Epoch millis when this payload was produced -- used for staleness UI. */
  fetchedAt: number;
}

/**
 * Air-quality snapshot. The `index` is whichever scale is used in the
 * current locale (European AQI for `de`, US AQI otherwise); `scale`
 * records the choice so the UI can label it correctly.
 */
export interface AirQualitySnapshot {
  scale: "european" | "us";
  index: number;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  fetchedAt: number;
}
