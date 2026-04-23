/**
 * Classify an air-quality index value into a qualitative band for display.
 *
 * Two scales are supported: European AQI (0..100+) and US AQI (0..500+).
 * Thresholds follow the official definitions:
 *
 * European AQI:
 *   0-20   good
 *   20-40  fair
 *   40-60  moderate
 *   60-80  poor
 *   80-100 very poor
 *   100+   extremely poor
 *
 * US AQI:
 *   0-50     good
 *   51-100   moderate
 *   101-150  unhealthy for sensitive groups
 *   151-200  unhealthy
 *   201-300  very unhealthy
 *   301+     hazardous
 *
 * Both return a normalized `band` identifier plus an `i18nKey` for
 * localized labelling.
 *
 * @module domain/airQuality
 */

export type AqiBand =
  | "good"
  | "fair"
  | "moderate"
  | "poor"
  | "veryPoor"
  | "extreme"
  | "sensitive"
  | "unhealthy"
  | "veryUnhealthy"
  | "hazardous";

export interface AqiBandInfo {
  band: AqiBand;
  i18nKey: string;
}

export function classifyEuropeanAqi(value: number | null | undefined): AqiBandInfo {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { band: "good", i18nKey: "aqi.band.good" };
  }
  if (value < 20) {
    return { band: "good", i18nKey: "aqi.band.good" };
  }
  if (value < 40) {
    return { band: "fair", i18nKey: "aqi.band.fair" };
  }
  if (value < 60) {
    return { band: "moderate", i18nKey: "aqi.band.moderate" };
  }
  if (value < 80) {
    return { band: "poor", i18nKey: "aqi.band.poor" };
  }
  if (value < 100) {
    return { band: "veryPoor", i18nKey: "aqi.band.veryPoor" };
  }
  return { band: "extreme", i18nKey: "aqi.band.extremelyPoor" };
}

export function classifyUsAqi(value: number | null | undefined): AqiBandInfo {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { band: "good", i18nKey: "aqi.band.good" };
  }
  if (value <= 50) {
    return { band: "good", i18nKey: "aqi.band.good" };
  }
  if (value <= 100) {
    return { band: "moderate", i18nKey: "aqi.band.moderate" };
  }
  if (value <= 150) {
    return { band: "sensitive", i18nKey: "aqi.band.sensitive" };
  }
  if (value <= 200) {
    return { band: "unhealthy", i18nKey: "aqi.band.unhealthy" };
  }
  if (value <= 300) {
    return { band: "veryUnhealthy", i18nKey: "aqi.band.veryUnhealthy" };
  }
  return { band: "hazardous", i18nKey: "aqi.band.hazardous" };
}

/** Pick the right classifier for a given scale. */
export function classifyAqi(value: number | null | undefined, scale: "european" | "us"): AqiBandInfo {
  return scale === "european" ? classifyEuropeanAqi(value) : classifyUsAqi(value);
}
