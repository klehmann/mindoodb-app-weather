/**
 * Thin client for the Open-Meteo geocoding API.
 *
 * Docs: https://open-meteo.com/en/docs/geocoding-api
 *
 * The API is keyless and CORS-friendly, which fits the sandboxed-iframe
 * security model of MindooDB Haven: no secret needs to be shipped inside
 * the app bundle.
 *
 * Results are cached in localStorage via `services/cache` so a repeat
 * launch of the app resolves locations without a network round-trip,
 * which also lets the app keep working offline.
 *
 * @module services/geocoding
 */
import { cacheGet, cacheSet, normalizeQueryKey } from "@/services/cache";
import type { ResolvedLocation } from "@/domain/types";

const GEOCODING_CACHE_SCOPE = "geocode";
const GEOCODING_CACHE_VERSION = 1;

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

interface RawGeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

interface RawGeocodingResponse {
  results?: RawGeocodingResult[];
}

/**
 * Resolve a user-supplied query string to a canonical location.
 *
 * - Looks up the localStorage cache first (keyed on the normalized query).
 * - On cache miss, calls the Open-Meteo geocoding API with `count=1`.
 * - Throws a descriptive `Error` if the API returns no result or fails.
 *
 * @param query  Raw user input, e.g. "Karlsruhe, Germany".
 * @param locale `"de"` or `"en"`; forwarded to the API so it localizes place names.
 * @param fetchImpl  Optional `fetch` override, used in tests.
 */
export async function resolveLocation(
  query: string,
  locale: "de" | "en",
  fetchImpl: typeof fetch = fetch,
): Promise<ResolvedLocation> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Empty location query");
  }

  const cacheId = normalizeQueryKey(trimmed);
  const cached = cacheGet<ResolvedLocation>(GEOCODING_CACHE_SCOPE, GEOCODING_CACHE_VERSION, cacheId);
  if (cached) {
    return cached.data;
  }

  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", locale);
  url.searchParams.set("format", "json");

  let response: Response;
  try {
    response = await fetchImpl(url.toString(), { method: "GET" });
  } catch (networkError) {
    throw new Error(
      `Geocoding network error for "${trimmed}": ${networkError instanceof Error ? networkError.message : "unknown"}`,
    );
  }
  if (!response.ok) {
    throw new Error(`Geocoding failed for "${trimmed}" (HTTP ${response.status})`);
  }

  const json = (await response.json()) as RawGeocodingResponse;
  const first = json.results?.[0];
  if (!first) {
    throw new Error(`No geocoding result for "${trimmed}"`);
  }

  const resolved: ResolvedLocation = {
    query: trimmed,
    displayName: first.name,
    country: first.country,
    countryCode: first.country_code,
    admin1: first.admin1,
    latitude: first.latitude,
    longitude: first.longitude,
    timezone: first.timezone ?? "auto",
  };

  cacheSet(GEOCODING_CACHE_SCOPE, GEOCODING_CACHE_VERSION, cacheId, resolved);
  return resolved;
}
