/**
 * Typed client for the Open-Meteo forecast API.
 *
 * Docs: https://open-meteo.com/en/docs
 *
 * The returned payload is decoded into the app's internal `LocationForecast`
 * shape so the rest of the codebase never has to reason about the API's
 * snake_case field names or its array-oriented time series layout.
 *
 * The API is keyless, rate-generous, and CORS-friendly -- no secret ever
 * needs to ship inside the app bundle.
 *
 * @module services/openMeteo
 */
import { cacheGet, cacheSet, formatCoordinateKey } from "@/services/cache";
import type {
  CurrentConditions,
  DailyPoint,
  HourlyPoint,
  LocationForecast,
  ResolvedLocation,
} from "@/domain/types";
import type { Units } from "@/services/launchParams";

const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

const FORECAST_CACHE_SCOPE = "forecast";
const FORECAST_CACHE_VERSION = 1;

const CURRENT_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "is_day",
  "weather_code",
  "wind_speed_10m",
  "wind_direction_10m",
  "pressure_msl",
  "surface_pressure",
  "uv_index",
  "visibility",
].join(",");

const HOURLY_FIELDS = ["temperature_2m", "weather_code", "precipitation_probability", "uv_index"].join(",");

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "uv_index_max",
  "sunrise",
  "sunset",
].join(",");

interface RawCurrent {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: 0 | 1;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  pressure_msl: number;
  surface_pressure: number;
  uv_index: number | null;
  visibility: number | null;
}

interface RawHourly {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability: Array<number | null>;
  uv_index: Array<number | null>;
}

interface RawDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: Array<number | null>;
  uv_index_max: Array<number | null>;
  sunrise: string[];
  sunset: string[];
}

interface RawForecastResponse {
  current: RawCurrent;
  hourly: RawHourly;
  daily: RawDaily;
}

/** Map our `Units` to the Open-Meteo query parameter values. */
function unitParams(units: Units): {
  temperatureUnit: "celsius" | "fahrenheit";
  windSpeedUnit: "kmh" | "mph";
  precipitationUnit: "mm" | "inch";
} {
  if (units === "imperial") {
    return {
      temperatureUnit: "fahrenheit",
      windSpeedUnit: "mph",
      precipitationUnit: "inch",
    };
  }
  return {
    temperatureUnit: "celsius",
    windSpeedUnit: "kmh",
    precipitationUnit: "mm",
  };
}

function buildForecastUrl(location: ResolvedLocation, units: Units, locale: "de" | "en"): URL {
  const { temperatureUnit, windSpeedUnit, precipitationUnit } = unitParams(units);

  const url = new URL(FORECAST_ENDPOINT);
  url.searchParams.set("latitude", location.latitude.toString());
  url.searchParams.set("longitude", location.longitude.toString());
  url.searchParams.set("current", CURRENT_FIELDS);
  url.searchParams.set("hourly", HOURLY_FIELDS);
  url.searchParams.set("daily", DAILY_FIELDS);
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "10");
  url.searchParams.set("temperature_unit", temperatureUnit);
  url.searchParams.set("wind_speed_unit", windSpeedUnit);
  url.searchParams.set("precipitation_unit", precipitationUnit);
  url.searchParams.set("language", locale);
  return url;
}

/** Decode the current-conditions block into our internal shape. */
function decodeCurrent(raw: RawCurrent): CurrentConditions {
  return {
    time: raw.time,
    temperature: raw.temperature_2m,
    apparentTemperature: raw.apparent_temperature,
    humidity: raw.relative_humidity_2m,
    windSpeed: raw.wind_speed_10m,
    windDirectionDeg: raw.wind_direction_10m,
    pressureMsl: raw.pressure_msl,
    surfacePressure: raw.surface_pressure,
    uvIndex: raw.uv_index,
    visibility: raw.visibility,
    isDay: raw.is_day === 1,
    weatherCode: raw.weather_code,
  };
}

/** Transpose the parallel hourly arrays into per-hour point objects. */
function decodeHourly(raw: RawHourly): HourlyPoint[] {
  const out: HourlyPoint[] = [];
  for (let i = 0; i < raw.time.length; i += 1) {
    out.push({
      time: raw.time[i]!,
      temperature: raw.temperature_2m[i]!,
      weatherCode: raw.weather_code[i]!,
      precipitationProbability: raw.precipitation_probability[i] ?? null,
      uvIndex: raw.uv_index[i] ?? null,
    });
  }
  return out;
}

/** Transpose the parallel daily arrays into per-day point objects. */
function decodeDaily(raw: RawDaily): DailyPoint[] {
  const out: DailyPoint[] = [];
  for (let i = 0; i < raw.time.length; i += 1) {
    out.push({
      date: raw.time[i]!,
      weatherCode: raw.weather_code[i]!,
      tempMax: raw.temperature_2m_max[i]!,
      tempMin: raw.temperature_2m_min[i]!,
      precipitationProbabilityMax: raw.precipitation_probability_max[i] ?? null,
      uvIndexMax: raw.uv_index_max[i] ?? null,
      sunrise: raw.sunrise[i]!,
      sunset: raw.sunset[i]!,
    });
  }
  return out;
}

function cacheId(location: ResolvedLocation, units: Units, locale: "de" | "en"): string {
  return `${formatCoordinateKey(location.latitude, location.longitude)}_${units}_${locale}`;
}

/**
 * Retrieve a cached forecast for this location without issuing a network
 * request. Useful for rendering immediately on startup while the live
 * fetch is still in flight.
 */
export function readCachedForecast(
  location: ResolvedLocation,
  units: Units,
  locale: "de" | "en",
): LocationForecast | null {
  const entry = cacheGet<LocationForecast>(FORECAST_CACHE_SCOPE, FORECAST_CACHE_VERSION, cacheId(location, units, locale));
  return entry?.data ?? null;
}

/**
 * Fetch a fresh forecast from Open-Meteo and update the cache.
 *
 * @throws {Error} when the network request fails or the response is malformed.
 */
export async function fetchForecast(
  location: ResolvedLocation,
  units: Units,
  locale: "de" | "en",
  fetchImpl: typeof fetch = fetch,
): Promise<LocationForecast> {
  const url = buildForecastUrl(location, units, locale);

  let response: Response;
  try {
    response = await fetchImpl(url.toString(), { method: "GET" });
  } catch (networkError) {
    throw new Error(
      `Forecast network error for "${location.displayName}": ${networkError instanceof Error ? networkError.message : "unknown"}`,
    );
  }
  if (!response.ok) {
    throw new Error(`Forecast request failed for "${location.displayName}" (HTTP ${response.status})`);
  }

  const json = (await response.json()) as RawForecastResponse;
  if (!json.current || !json.hourly || !json.daily) {
    throw new Error(`Malformed forecast payload for "${location.displayName}"`);
  }

  const forecast: LocationForecast = {
    location,
    current: decodeCurrent(json.current),
    hourly: decodeHourly(json.hourly),
    daily: decodeDaily(json.daily),
    fetchedAt: Date.now(),
  };

  cacheSet(FORECAST_CACHE_SCOPE, FORECAST_CACHE_VERSION, cacheId(location, units, locale), forecast);
  return forecast;
}
