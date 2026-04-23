/**
 * Classify a UV index value into a WHO-aligned qualitative band.
 *
 * Thresholds (WHO Global Solar UV Index):
 *
 * |  Range | Band        |
 * |--------|-------------|
 * |   0-2  | Low         |
 * |   3-5  | Moderate    |
 * |   6-7  | High        |
 * |   8-10 | Very high   |
 * |  11+   | Extreme     |
 *
 * The returned `i18nKey` is used by vue-i18n to render a localized
 * label; the returned `band` is retained as a stable identifier the UI
 * can use for styling (e.g. accent colors).
 *
 * @module domain/uvIndex
 */

export type UvBand = "low" | "moderate" | "high" | "very-high" | "extreme";

export interface UvBandInfo {
  band: UvBand;
  i18nKey: string;
}

export function classifyUvIndex(uv: number | null | undefined): UvBandInfo {
  if (uv === null || uv === undefined || !Number.isFinite(uv)) {
    return { band: "low", i18nKey: "uv.band.low" };
  }
  if (uv < 3) {
    return { band: "low", i18nKey: "uv.band.low" };
  }
  if (uv < 6) {
    return { band: "moderate", i18nKey: "uv.band.moderate" };
  }
  if (uv < 8) {
    return { band: "high", i18nKey: "uv.band.high" };
  }
  if (uv < 11) {
    return { band: "very-high", i18nKey: "uv.band.veryHigh" };
  }
  return { band: "extreme", i18nKey: "uv.band.extreme" };
}
