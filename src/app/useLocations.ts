/**
 * Turn a reactive list of user-supplied location query strings into a
 * reactive list of geocoded-location records.
 *
 * Each entry goes through the following states:
 *
 *   `pending`  -> initial; we are about to ask the geocoder
 *   `resolved` -> `location` is available
 *   `error`    -> geocoding failed; `error` contains a human-readable reason
 *
 * The composable caches results in localStorage (via `services/geocoding`)
 * so repeat launches of the app are fast and work offline.
 *
 * @module app/useLocations
 */
import { ref, watch, type Ref } from "vue";
import { resolveLocation } from "@/services/geocoding";
import type { ResolvedLocation } from "@/domain/types";

export type LocationState =
  | { query: string; status: "pending" }
  | { query: string; status: "resolved"; location: ResolvedLocation }
  | { query: string; status: "error"; error: string };

export interface UseLocationsState {
  entries: Ref<LocationState[]>;
  /** Manually trigger a re-resolution (e.g. after a network reconnection). */
  resolveAll: () => Promise<void>;
}

/**
 * @param queries Reactive list of user-supplied queries (e.g.
 *                `["Berlin, Germany", "Karlsruhe, Germany"]`).
 * @param locale  Reactive i18n locale used to ask the geocoder for
 *                localized place names.
 */
export function useLocations(queries: Ref<string[]>, locale: Ref<"de" | "en">): UseLocationsState {
  const entries = ref<LocationState[]>([]);

  async function resolveOne(query: string): Promise<LocationState> {
    try {
      const location = await resolveLocation(query, locale.value);
      return { query, status: "resolved", location };
    } catch (error) {
      return {
        query,
        status: "error",
        error: error instanceof Error ? error.message : "Geocoding failed",
      };
    }
  }

  async function resolveAll() {
    const current = queries.value.slice();

    // Seed pending state immediately so the UI can render skeletons.
    entries.value = current.map((query) => ({ query, status: "pending" as const }));

    const resolved = await Promise.all(current.map((query) => resolveOne(query)));

    // Only accept this batch if the query list hasn't been replaced in the meantime.
    if (sameQueryList(current, queries.value)) {
      entries.value = resolved;
    }
  }

  watch(
    () => [queries.value.slice(), locale.value] as const,
    () => {
      void resolveAll();
    },
    { immediate: true, deep: false },
  );

  return { entries, resolveAll };
}

function sameQueryList(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
