/**
 * Fetch and cache an air-quality snapshot for a resolved location.
 *
 * Air-quality coverage is patchy (the Open-Meteo air-quality API may
 * return no data for remote regions), so failures are *non-fatal* --
 * the UI simply hides the air-quality info tile on error. Callers
 * should render the tile only when `snapshot.value` is non-null.
 *
 * @module app/useAirQuality
 */
import { ref, watch, type Ref } from "vue";
import { fetchAirQuality, readCachedAirQuality } from "@/services/airQuality";
import type { AirQualitySnapshot, ResolvedLocation } from "@/domain/types";

export interface UseAirQualityState {
  snapshot: Ref<AirQualitySnapshot | null>;
  loading: Ref<boolean>;
  refresh: () => Promise<void>;
}

export function useAirQuality(
  location: Ref<ResolvedLocation | null>,
  locale: Ref<"de" | "en">,
): UseAirQualityState {
  const snapshot = ref<AirQualitySnapshot | null>(null);
  const loading = ref(false);

  async function refresh() {
    const loc = location.value;
    if (!loc) {
      snapshot.value = null;
      return;
    }
    loading.value = true;
    try {
      const fresh = await fetchAirQuality(loc, locale.value);
      snapshot.value = fresh;
    } catch {
      // Air-quality failures are tolerable: we simply keep whatever we had
      // (or null) so the UI hides the tile.
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => [location.value, locale.value] as const,
    ([loc]) => {
      if (!loc) {
        snapshot.value = null;
        return;
      }
      snapshot.value = readCachedAirQuality(loc, locale.value);
      void refresh();
    },
    { immediate: true },
  );

  return { snapshot, loading, refresh };
}
