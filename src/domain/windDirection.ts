/**
 * Convert a meteorological wind direction in degrees to one of the
 * eight cardinal / ordinal abbreviations plus an i18n key.
 *
 * The input follows meteorological convention: 0° is wind coming *from*
 * the north, 90° from the east, etc.
 *
 *   N   = [348.75, 360] ∪ [0, 11.25)
 *   NE  = [33.75, 78.75)  -- wait, we use the 8-way rosette so 22.5°
 *
 * The rosette uses 45° sectors centred on the eight compass points,
 * i.e. each sector spans ±22.5° around N, NE, E, SE, S, SW, W, NW.
 *
 * @module domain/windDirection
 */

export type WindCardinal = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

export interface WindDirection {
  cardinal: WindCardinal;
  i18nKey: string;
  /** Original bearing in degrees, normalized to [0, 360). */
  degrees: number;
}

const ORDER: WindCardinal[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export function windDirectionFromDegrees(degrees: number): WindDirection {
  const normalized = ((degrees % 360) + 360) % 360;
  // Each sector is 45° wide centred on its compass point. Shift by +22.5°
  // so the sector boundaries align with half-sectors, then divide by 45.
  const sector = Math.floor(((normalized + 22.5) % 360) / 45);
  const cardinal = ORDER[sector]!;
  return {
    cardinal,
    i18nKey: `wind.direction.${cardinal}`,
    degrees: normalized,
  };
}
