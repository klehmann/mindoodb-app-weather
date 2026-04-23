/**
 * Fetch and cache a forecast for a single resolved location.
 *
 * On mount, if a cached forecast is available it is rendered
 * immediately; a fresh fetch then runs in the background and swaps the
 * data in once it arrives. This matches the iOS Weather behaviour where
 * data appears instantly on launch and is quietly refreshed.
 *
 * The composable handles its own loading and error state so the UI
 * layer can render a skeleton, an error card, or a ready card purely
 * from its reactive surface.
 *
 * @module app/useForecast
 */
import { computed, ref, watch, type Ref } from "vue";
import { fetchForecast, readCachedForecast } from "@/services/openMeteo";
import type { LocationForecast, ResolvedLocation } from "@/domain/types";
import type { Units } from "@/services/launchParams";

export interface UseForecastState {
  forecast: Ref<LocationForecast | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  /** `true` once we have displayed data, whether cached or fresh. */
  hasData: Ref<boolean>;
  /** Manually trigger a refetch; used by auto-refresh and the error retry button. */
  refresh: () => Promise<void>;
}

export function useForecast(
  location: Ref<ResolvedLocation | null>,
  units: Ref<Units>,
  locale: Ref<"de" | "en">,
): UseForecastState {
  const forecast = ref<LocationForecast | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasData = computed(() => forecast.value !== null);

  async function refresh() {
    const loc = location.value;
    if (!loc) {
      forecast.value = null;
      return;
    }
    loading.value = true;
    try {
      const fresh = await fetchForecast(loc, units.value, locale.value);
      forecast.value = fresh;
      error.value = null;
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Forecast fetch failed";
      // Keep previously shown data visible so a transient failure doesn't clear the card.
      if (!forecast.value) {
        error.value = message;
      } else {
        // Surface the error but keep the stale data visible.
        error.value = message;
      }
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => [location.value, units.value, locale.value] as const,
    ([loc]) => {
      if (!loc) {
        forecast.value = null;
        error.value = null;
        return;
      }
      const cached = readCachedForecast(loc, units.value, locale.value);
      forecast.value = cached;
      error.value = null;
      void refresh();
    },
    { immediate: true },
  );

  return { forecast, loading, error, hasData, refresh };
}
