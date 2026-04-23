/**
 * Top-level orchestrator composable for the weather app.
 *
 * Wires together:
 *
 * - `useHavenSession`  - Haven bridge + viewport
 * - launch-params parsing (derived from `session.launchParameters`)
 * - `useLocations`     - geocoding the query strings
 * - per-location forecast + air-quality state, keyed by query string
 * - `useAutoRefresh`   - periodic data refresh
 *
 * The composable exposes an array of `LocationTile` view models, each
 * representing one card in the carousel. The UI layer stays thin: it
 * renders whatever `tiles.value` says, indexing by `tile.kind` to
 * pick the right sub-component (loading / error / ready).
 *
 * @module app/useWeatherApp
 */
import { computed, reactive, ref, watch, type Ref } from "vue";

import type { AirQualitySnapshot, LocationForecast, ResolvedLocation } from "@/domain/types";
import { parseLaunchParams, type Units } from "@/services/launchParams";
import { fetchAirQuality, readCachedAirQuality } from "@/services/airQuality";
import { fetchForecast, readCachedForecast } from "@/services/openMeteo";
import { useHavenSession } from "@/app/useHavenSession";
import { useLocations } from "@/app/useLocations";
import { useAutoRefresh } from "@/app/useAutoRefresh";

/** Per-location tile view model consumed by the UI. */
export type LocationTile =
  | { kind: "loading"; query: string }
  | { kind: "error"; query: string; error: string }
  | {
      kind: "ready";
      query: string;
      location: ResolvedLocation;
      forecast: LocationForecast | null;
      airQuality: AirQualitySnapshot | null;
      forecastError: string | null;
      refreshing: boolean;
    };

interface WeatherBag {
  forecast: LocationForecast | null;
  airQuality: AirQualitySnapshot | null;
  forecastError: string | null;
  refreshing: boolean;
}

export interface UseWeatherAppState {
  locale: Ref<"de" | "en">;
  units: Ref<Units>;
  refreshIntervalMinutes: Ref<number>;
  tiles: Ref<LocationTile[]>;
  /** Connect to the Haven bridge and start fetching. Call on mount. */
  start: () => Promise<void>;
  /** Force a refresh of all tiles. */
  refreshAll: () => Promise<void>;
  /** Exposed for the background and carousel components. */
  session: ReturnType<typeof useHavenSession>;
  /** Active slide index owned by the carousel; exposed so background can react to it. */
  activeIndex: Ref<number>;
}

export function useWeatherApp(locale: Ref<"de" | "en">): UseWeatherAppState {
  const session = useHavenSession();

  const units = ref<Units>("metric");
  const refreshIntervalMinutes = ref<number>(0);
  const queries = ref<string[]>([]);
  const activeIndex = ref(0);

  const locations = useLocations(queries, locale);

  // Forecast + air-quality state, keyed by query string. We intentionally
  // use a keyed map (rather than parallel arrays) so reordering or
  // deduplication of queries doesn't lose state.
  const bags = reactive<Record<string, WeatherBag>>({});

  function ensureBag(query: string): WeatherBag {
    let bag = bags[query];
    if (!bag) {
      bag = reactive({
        forecast: null,
        airQuality: null,
        forecastError: null,
        refreshing: false,
      });
      bags[query] = bag;
    }
    return bag;
  }

  function getResolvedLocation(query: string): ResolvedLocation | null {
    const entry = locations.entries.value.find((e) => e.query === query);
    return entry?.status === "resolved" ? entry.location : null;
  }

  async function refreshOne(query: string) {
    const location = getResolvedLocation(query);
    if (!location) {
      return;
    }
    const bag = ensureBag(query);
    bag.refreshing = true;

    if (!bag.forecast) {
      bag.forecast = readCachedForecast(location, units.value, locale.value);
    }
    if (!bag.airQuality) {
      bag.airQuality = readCachedAirQuality(location, locale.value);
    }

    try {
      bag.forecast = await fetchForecast(location, units.value, locale.value);
      bag.forecastError = null;
    } catch (error) {
      bag.forecastError = error instanceof Error ? error.message : "Forecast fetch failed";
    }

    try {
      bag.airQuality = await fetchAirQuality(location, locale.value);
    } catch {
      // Non-fatal: UI hides the tile when airQuality stays null.
    }

    bag.refreshing = false;
  }

  async function refreshAll() {
    await Promise.all(queries.value.map((query) => refreshOne(query)));
  }

  async function start() {
    await session.connect();

    // Derive launch params from the session (or fall back to URL query
    // parameters, handy when running the dev server directly outside Haven).
    const rawParams: Record<string, string> = { ...session.launchParameters.value };
    if (!rawParams.locations && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      for (const [key, value] of urlParams.entries()) {
        if (value) {
          rawParams[key] = value;
        }
      }
    }

    const parsed = parseLaunchParams(rawParams);
    queries.value = parsed.locationQueries;
    units.value = parsed.units;
    refreshIntervalMinutes.value = parsed.refreshIntervalMinutes;
  }

  // Whenever a location becomes resolved, kick off its forecast fetch.
  // Using a watch keeps the behaviour reactive if the query list changes
  // at runtime (e.g. after Haven re-launches the app with new params).
  watch(
    () => locations.entries.value.map((e) => ({ query: e.query, status: e.status })),
    (current, previous) => {
      const previouslyResolved = new Set(
        (previous ?? []).filter((e) => e.status === "resolved").map((e) => e.query),
      );
      for (const entry of current) {
        if (entry.status === "resolved" && !previouslyResolved.has(entry.query)) {
          void refreshOne(entry.query);
        }
      }
    },
    { deep: true },
  );

  // Refetch forecasts when the user switches units.
  watch(units, () => {
    void refreshAll();
  });

  useAutoRefresh(refreshIntervalMinutes, refreshAll);

  const tiles = computed<LocationTile[]>(() =>
    locations.entries.value.map<LocationTile>((entry) => {
      if (entry.status === "pending") {
        return { kind: "loading", query: entry.query };
      }
      if (entry.status === "error") {
        return { kind: "error", query: entry.query, error: entry.error };
      }
      const bag = bags[entry.query];
      return {
        kind: "ready",
        query: entry.query,
        location: entry.location,
        forecast: bag?.forecast ?? null,
        airQuality: bag?.airQuality ?? null,
        forecastError: bag?.forecastError ?? null,
        refreshing: bag?.refreshing ?? false,
      };
    }),
  );

  return {
    locale,
    units,
    refreshIntervalMinutes,
    tiles,
    start,
    refreshAll,
    session,
    activeIndex,
  };
}
