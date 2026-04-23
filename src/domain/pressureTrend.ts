/**
 * Derive a coarse pressure trend -- `rising`, `falling`, or `steady` --
 * from the last few hourly samples.
 *
 * We look at the most recent sample and the sample three hours earlier
 * (or the oldest sample we have, if the series is shorter). A delta of
 * more than 0.5 hPa over that window is classified as a trend; anything
 * smaller counts as steady. This roughly follows weather-station
 * practice of using a 3-hourly tendency.
 *
 * @module domain/pressureTrend
 */

export type PressureTrend = "rising" | "falling" | "steady";

export interface PressureTrendResult {
  trend: PressureTrend;
  /** Difference between the most recent and reference sample, in hPa. */
  deltaHpa: number;
}

/**
 * @param samples  Hourly pressure series, oldest first. Must contain at least
 *                 one data point, otherwise `steady` is returned.
 * @param nowIndex Optional index of the "now" sample. When omitted, the last
 *                 element of the array is used.
 * @param hoursBack Number of hours to look back. Defaults to 3.
 */
export function computePressureTrend(
  samples: ReadonlyArray<number | null>,
  nowIndex?: number,
  hoursBack: number = 3,
): PressureTrendResult {
  if (!samples.length) {
    return { trend: "steady", deltaHpa: 0 };
  }
  const end = nowIndex ?? samples.length - 1;
  const clampedEnd = Math.max(0, Math.min(end, samples.length - 1));
  const startGuess = clampedEnd - hoursBack;
  const start = Math.max(0, startGuess);

  const current = samples[clampedEnd];
  const prior = samples[start];

  if (current === null || current === undefined || prior === null || prior === undefined) {
    return { trend: "steady", deltaHpa: 0 };
  }

  const delta = current - prior;
  if (delta > 0.5) {
    return { trend: "rising", deltaHpa: delta };
  }
  if (delta < -0.5) {
    return { trend: "falling", deltaHpa: delta };
  }
  return { trend: "steady", deltaHpa: delta };
}
