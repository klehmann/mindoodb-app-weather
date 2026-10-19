/**
 * Typed client for the Open-Meteo air-quality API.
 *
 * Docs: https://open-meteo.com/en/docs/air-quality-api
 *
 * This endpoint is separate from the main forecast API and may not be
 * available for every region. Failures are *non-fatal* for our app:
 * callers are expected to catch and gracefully hide the corresponding
 * UI tile when this call rejects.
 *
 * The app uses `us_aqi` for English and `european_aqi` for every other
 * (European) locale -- matching the convention a native user would expect.
 *
 * @module services/airQuality
 */
import type { AppLocale } from "@/i18n";
import { cacheGet, cacheSet, formatCoordinateKey } from "@/services/cache";
import type { AirQualitySnapshot, ResolvedLocation } from "@/domain/types";

const AIR_QUALITY_ENDPOINT = "https://air-quality-api.open-meteo.com/v1/air-quality";
const AIR_QUALITY_CACHE_SCOPE = "airQuality";
const AIR_QUALITY_CACHE_VERSION = 1;

const CURRENT_FIELDS = [
  "european_aqi",
  "us_aqi",
  "pm2_5",
  "pm10",
  "ozone",
  "nitrogen_dioxide",
  "sulphur_dioxide",
  "carbon_monoxide",
].join(",");

interface RawAirQualityCurrent {
  time: string;
  european_aqi: number | null;
  us_aqi: number | null;
  pm2_5: number | null;
  pm10: number | null;
  ozone: number | null;
  nitrogen_dioxide: number | null;
  sulphur_dioxide: number | null;
  carbon_monoxide: number | null;
}

interface RawAirQualityResponse {
  current: RawAirQualityCurrent;
}

function chooseScale(locale: AppLocale): "european" | "us" {
  return locale === "en" ? "us" : "european";
}

function cacheId(location: ResolvedLocation, locale: AppLocale): string {
  return `${formatCoordinateKey(location.latitude, location.longitude)}_${locale}`;
}

/** Synchronous cache read, for instant first render while fetching. */
export function readCachedAirQuality(
  location: ResolvedLocation,
  locale: AppLocale,
): AirQualitySnapshot | null {
  const entry = cacheGet<AirQualitySnapshot>(
    AIR_QUALITY_CACHE_SCOPE,
    AIR_QUALITY_CACHE_VERSION,
    cacheId(location, locale),
  );
  return entry?.data ?? null;
}

/**
 * Fetch an air-quality snapshot. Throws on network / HTTP errors; callers
 * are expected to hide the UI tile on failure rather than surface an error
 * state.
 */
export async function fetchAirQuality(
  location: ResolvedLocation,
  locale: AppLocale,
  fetchImpl: typeof fetch = fetch,
): Promise<AirQualitySnapshot> {
  const scale = chooseScale(locale);

  const url = new URL(AIR_QUALITY_ENDPOINT);
  url.searchParams.set("latitude", location.latitude.toString());
  url.searchParams.set("longitude", location.longitude.toString());
  url.searchParams.set("current", CURRENT_FIELDS);
  url.searchParams.set("timezone", "auto");

  let response: Response;
  try {
    response = await fetchImpl(url.toString(), { method: "GET" });
  } catch (networkError) {
    throw new Error(
      `Air-quality network error: ${networkError instanceof Error ? networkError.message : "unknown"}`,
    );
  }
  if (!response.ok) {
    throw new Error(`Air-quality request failed (HTTP ${response.status})`);
  }

  const json = (await response.json()) as RawAirQualityResponse;
  if (!json.current) {
    throw new Error("Malformed air-quality payload");
  }

  const index = scale === "european" ? json.current.european_aqi : json.current.us_aqi;
  if (index === null || index === undefined) {
    throw new Error(`Air-quality index unavailable for this location (${scale} scale)`);
  }

  const snapshot: AirQualitySnapshot = {
    scale,
    index,
    pm25: json.current.pm2_5,
    pm10: json.current.pm10,
    ozone: json.current.ozone,
    no2: json.current.nitrogen_dioxide,
    so2: json.current.sulphur_dioxide,
    co: json.current.carbon_monoxide,
    fetchedAt: Date.now(),
  };

  cacheSet(AIR_QUALITY_CACHE_SCOPE, AIR_QUALITY_CACHE_VERSION, cacheId(location, locale), snapshot);
  return snapshot;
}
