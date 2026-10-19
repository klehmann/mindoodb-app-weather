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
import { APP_LOCALES, toGeocodingLanguage, type AppLocale } from "@/i18n";
import { cacheGet, cacheSet, normalizeQueryKey } from "@/services/cache";
import type { ResolvedLocation } from "@/domain/types";

const GEOCODING_CACHE_SCOPE = "geocode";
// v2: the cache id includes the language (names are localized by the API).
const GEOCODING_CACHE_VERSION = 2;

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const GEOCODING_GET_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/get";

interface RawGeocodingResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

/** Why a lookup failed, so the UI can explain it in the user's language. */
export type GeocodingErrorKind = "notFound" | "network" | "http";

export class GeocodingError extends Error {
  constructor(
    message: string,
    readonly kind: GeocodingErrorKind,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GeocodingError";
  }
}

interface RawGeocodingResponse {
  results?: RawGeocodingResult[];
}

async function getJson<T>(url: URL, label: string, fetchImpl: typeof fetch): Promise<T> {
  let response: Response;
  try {
    response = await fetchImpl(url.toString(), { method: "GET" });
  } catch (networkError) {
    throw new GeocodingError(
      `Geocoding network error for "${label}": ${networkError instanceof Error ? networkError.message : "unknown"}`,
      "network",
    );
  }
  if (!response.ok) {
    throw new GeocodingError(`Geocoding failed for "${label}" (HTTP ${response.status})`, "http", response.status);
  }
  return (await response.json()) as T;
}

async function search(
  name: string,
  language: string,
  fetchImpl: typeof fetch,
): Promise<RawGeocodingResult | undefined> {
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set("name", name);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", language);
  url.searchParams.set("format", "json");
  const json = await getJson<RawGeocodingResponse>(url, name, fetchImpl);
  return json.results?.[0];
}

/**
 * The search matches the query (including a country suffix such as
 * "Berlin, Deutschland") against names in the requested language only. A
 * location list written in another language than the viewer's UI is still
 * found by trying the other languages; the hit is then re-read by id in
 * the viewer's language so its names are localized.
 */
async function searchAnyLanguage(
  name: string,
  language: string,
  fetchImpl: typeof fetch,
): Promise<RawGeocodingResult | undefined> {
  const direct = await search(name, language, fetchImpl);
  if (direct) {
    return direct;
  }
  for (const other of APP_LOCALES.map(toGeocodingLanguage)) {
    if (other === language) {
      continue;
    }
    const hit = await search(name, other, fetchImpl);
    if (!hit) {
      continue;
    }
    if (hit.id === undefined) {
      return hit;
    }
    try {
      const url = new URL(GEOCODING_GET_ENDPOINT);
      url.searchParams.set("id", String(hit.id));
      url.searchParams.set("language", language);
      return { ...hit, ...(await getJson<RawGeocodingResult>(url, name, fetchImpl)) };
    } catch {
      return hit;
    }
  }
  return undefined;
}

/**
 * Resolve a user-supplied query string to a canonical location.
 *
 * - Looks up the localStorage cache first (keyed on the normalized query
 *   and the language).
 * - On cache miss, calls the Open-Meteo geocoding API with `count=1`
 *   (see `searchAnyLanguage`).
 * - Throws a `GeocodingError` if the API returns no result or fails.
 *
 * @param query  Raw user input, e.g. "Karlsruhe, Germany".
 * @param locale The app locale; forwarded to the API (`language=`) so it
 *               localizes place and country names.
 * @param fetchImpl  Optional `fetch` override, used in tests.
 */
export async function resolveLocation(
  query: string,
  locale: AppLocale,
  fetchImpl: typeof fetch = fetch,
): Promise<ResolvedLocation> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error("Empty location query");
  }

  const language = toGeocodingLanguage(locale);
  const cacheId = `${normalizeQueryKey(trimmed)}_${language}`;
  const cached = cacheGet<ResolvedLocation>(GEOCODING_CACHE_SCOPE, GEOCODING_CACHE_VERSION, cacheId);
  if (cached) {
    return cached.data;
  }

  const first = await searchAnyLanguage(trimmed, language, fetchImpl);
  if (!first) {
    throw new GeocodingError(`No geocoding result for "${trimmed}"`, "notFound");
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
