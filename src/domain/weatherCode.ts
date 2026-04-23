/**
 * Mapping from WMO weather interpretation codes to our internal
 * `VisualState` enum plus i18n keys for the localized condition label.
 *
 * The WMO codes Open-Meteo returns are collapsed from ~30 values into
 * 6 visual states. The purpose of the collapse is twofold:
 *
 *  1. Background images: 6 states x day/night = 12 photos, which is a
 *     manageable art-direction budget.
 *  2. Condition phrasing: users don't need to see "slight drizzle" vs
 *     "moderate rain showers" at a glance -- a single "rain" label with
 *     the raw WMO code kept in the data for finer-grained i18n later is
 *     enough for the sample app.
 *
 * Reference: https://open-meteo.com/en/docs (section "WMO Weather
 * interpretation codes").
 *
 * @module domain/weatherCode
 */
import type { DayOrNight, VisualCondition, VisualState } from "@/domain/types";

/** Convert a WMO code to a visual state bucket. Unknown codes fall back to "cloudy". */
export function visualStateForCode(code: number): VisualState {
  if (code === 0 || code === 1) {
    return "clear";
  }
  if (code === 2) {
    return "partly-cloudy";
  }
  if (code === 3 || code === 45 || code === 48) {
    return "cloudy";
  }
  if (
    (code >= 51 && code <= 57) ||
    (code >= 61 && code <= 67) ||
    (code >= 80 && code <= 82)
  ) {
    return "rain";
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return "snow";
  }
  if (code === 95 || code === 96 || code === 99) {
    return "storm";
  }
  return "cloudy";
}

/**
 * Decide whether a given moment is day or night.
 *
 * @param isDay      Optional explicit flag (from `current.is_day`). Wins when provided.
 * @param timeIso    ISO timestamp of the moment in question.
 * @param sunriseIso Optional sunrise timestamp for the same calendar day.
 * @param sunsetIso  Optional sunset timestamp for the same calendar day.
 *
 * If only a sunrise/sunset pair is available, we compare the local
 * time-of-day portion of each ISO string. These strings come from
 * Open-Meteo with `timezone=auto`, so they are already local to the
 * location and we can string-compare them reliably.
 */
export function resolveDayOrNight(params: {
  isDay?: boolean;
  timeIso?: string;
  sunriseIso?: string;
  sunsetIso?: string;
}): DayOrNight {
  if (typeof params.isDay === "boolean") {
    return params.isDay ? "day" : "night";
  }
  if (params.timeIso && params.sunriseIso && params.sunsetIso) {
    const t = params.timeIso;
    if (t >= params.sunriseIso && t < params.sunsetIso) {
      return "day";
    }
    return "night";
  }
  // Unknown -> default to day. This only matters for daily rows far in
  // the future where the app's UI would otherwise render a moon icon
  // during the daytime column.
  return "day";
}

/** Compose a ready-to-use `VisualCondition` for the UI. */
export function toVisualCondition(code: number, period: DayOrNight): VisualCondition {
  const state = visualStateForCode(code);
  return {
    state,
    period,
    key: `${state}-${period}`,
    weatherCode: code,
  };
}

/**
 * Map a WMO code to an i18n key used by vue-i18n to render the localized
 * short condition label ("Sunny", "Partly cloudy", ...).
 *
 * A handful of codes get their own label for readability; everything else
 * falls back to the bucket label derived from `visualStateForCode`.
 */
export function conditionI18nKey(code: number): string {
  const direct: Record<number, string> = {
    0: "condition.clearSky",
    1: "condition.mainlyClear",
    2: "condition.partlyCloudy",
    3: "condition.overcast",
    45: "condition.fog",
    48: "condition.fog",
    51: "condition.drizzle",
    53: "condition.drizzle",
    55: "condition.drizzle",
    56: "condition.freezingDrizzle",
    57: "condition.freezingDrizzle",
    61: "condition.rainLight",
    63: "condition.rain",
    65: "condition.rainHeavy",
    66: "condition.freezingRain",
    67: "condition.freezingRain",
    71: "condition.snowLight",
    73: "condition.snow",
    75: "condition.snowHeavy",
    77: "condition.snowGrains",
    80: "condition.rainShowers",
    81: "condition.rainShowers",
    82: "condition.rainShowersViolent",
    85: "condition.snowShowers",
    86: "condition.snowShowers",
    95: "condition.thunderstorm",
    96: "condition.thunderstormHail",
    99: "condition.thunderstormHail",
  };
  if (code in direct) {
    return direct[code]!;
  }
  return `condition.state.${visualStateForCode(code)}`;
}
