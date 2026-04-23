/**
 * Tiny namespaced + versioned wrapper around `localStorage`.
 *
 * Keys are laid out as `weather-app:<scope>:v<version>:<id>` so we can
 * safely invalidate a whole scope by bumping the version, without touching
 * other keys set by Haven or other apps running in the same origin.
 *
 * The API is intentionally synchronous -- it is only ever called with small
 * JSON payloads from the composables.
 *
 * @module services/cache
 */

const ROOT = "weather-app";

export interface CacheEntry<T> {
  /** Epoch milliseconds when this entry was written. */
  ts: number;
  data: T;
}

/** Build the fully-qualified storage key for a given scope/version/id. */
export function buildCacheKey(scope: string, version: number, id: string): string {
  return `${ROOT}:${scope}:v${version}:${id}`;
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

/**
 * Read a cache entry. Returns `null` when the key is missing, the payload
 * is malformed, or localStorage is unavailable.
 */
export function cacheGet<T>(scope: string, version: number, id: string): CacheEntry<T> | null {
  if (!canUseStorage()) {
    return null;
  }
  const key = buildCacheKey(scope, version, id);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (typeof parsed?.ts !== "number" || !("data" in parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Write a cache entry. Failures (quota, serialization) are silently swallowed. */
export function cacheSet<T>(scope: string, version: number, id: string, data: T): void {
  if (!canUseStorage()) {
    return;
  }
  const key = buildCacheKey(scope, version, id);
  const entry: CacheEntry<T> = { ts: Date.now(), data };
  try {
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or serialization failure: non-fatal.
  }
}

/** Remove a single cache entry. Missing keys are silently ignored. */
export function cacheDelete(scope: string, version: number, id: string): void {
  if (!canUseStorage()) {
    return;
  }
  try {
    window.localStorage.removeItem(buildCacheKey(scope, version, id));
  } catch {
    // Non-fatal.
  }
}

/**
 * Build a deterministic cache id for a geographic point. Coordinates are
 * rounded to 3 decimal places so microscopic geocoding differences don't
 * invalidate cached forecasts for the same human location.
 */
export function formatCoordinateKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
}

/** Normalize an arbitrary user-supplied string for use as a geocode cache id. */
export function normalizeQueryKey(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}
