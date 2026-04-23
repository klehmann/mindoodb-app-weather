/**
 * Locale-aware, unit-aware formatters for numeric values displayed in the UI.
 *
 * Each formatter takes a pre-unit-converted number (Open-Meteo already
 * respects our `temperature_unit`, `wind_speed_unit`, and
 * `precipitation_unit` query params) and only decides on digit precision
 * and the unit suffix.
 *
 * Visibility is special: Open-Meteo always returns it in metres, so we
 * derive km or miles locally.
 *
 * @module domain/formatting
 */
import type { Units } from "@/services/launchParams";

/** Round a temperature to the nearest whole degree and append the unit symbol. */
export function formatTemperature(value: number, units: Units): string {
  const rounded = Math.round(value);
  return `${rounded}°`;
}

/** Render the full "12°" or "55°F" style temperature with unit. */
export function formatTemperatureWithUnit(value: number, units: Units): string {
  const rounded = Math.round(value);
  return units === "imperial" ? `${rounded}°F` : `${rounded}°C`;
}

/** Render wind speed without excess precision. */
export function formatWindSpeed(value: number, units: Units): string {
  const rounded = Math.round(value);
  return units === "imperial" ? `${rounded} mph` : `${rounded} km/h`;
}

/** Render precipitation amount in mm or inches. */
export function formatPrecipitation(value: number, units: Units): string {
  if (units === "imperial") {
    return `${value.toFixed(2)} in`;
  }
  return `${value.toFixed(1)} mm`;
}

/** Render a percentage value (e.g. humidity, precipitation probability). */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Render pressure in hPa (metric) or inHg (imperial, converted from hPa). */
export function formatPressure(hpa: number, units: Units): string {
  if (units === "imperial") {
    const inHg = hpa * 0.02953;
    return `${inHg.toFixed(2)} inHg`;
  }
  return `${Math.round(hpa)} hPa`;
}

/**
 * Render visibility. The API returns metres; we convert to km (metric) or
 * miles (imperial) and round to one decimal.
 */
export function formatVisibility(metres: number, units: Units): string {
  if (units === "imperial") {
    const miles = metres / 1609.344;
    return `${miles.toFixed(1)} mi`;
  }
  const km = metres / 1000;
  return `${km.toFixed(1)} km`;
}

/** Format a difference like `+2°` or `-3°`. */
export function formatSignedDegrees(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) {
    return "0°";
  }
  return rounded > 0 ? `+${rounded}°` : `${rounded}°`;
}
