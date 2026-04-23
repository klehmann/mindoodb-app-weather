import { describe, expect, it } from "vitest";
import { computePressureTrend } from "@/domain/pressureTrend";

describe("computePressureTrend", () => {
  it("returns steady for an empty series", () => {
    expect(computePressureTrend([]).trend).toBe("steady");
  });

  it("detects rising pressure", () => {
    const series = [1008, 1008.4, 1009, 1009.3, 1010];
    const result = computePressureTrend(series, series.length - 1, 3);
    expect(result.trend).toBe("rising");
    expect(result.deltaHpa).toBeGreaterThan(0);
  });

  it("detects falling pressure", () => {
    const series = [1015, 1014, 1013, 1012.6, 1012];
    const result = computePressureTrend(series, series.length - 1, 3);
    expect(result.trend).toBe("falling");
    expect(result.deltaHpa).toBeLessThan(0);
  });

  it("classifies small changes as steady", () => {
    const series = [1015, 1015.1, 1015.2, 1015.3];
    expect(computePressureTrend(series, series.length - 1, 3).trend).toBe("steady");
  });

  it("handles null samples gracefully", () => {
    const series: Array<number | null> = [null, 1015, 1016, 1017];
    const result = computePressureTrend(series, 0, 3);
    expect(result.trend).toBe("steady");
  });

  it("clamps the lookback window to the start of the series", () => {
    const series = [1010, 1011, 1012];
    expect(computePressureTrend(series, 2, 10).trend).toBe("rising");
  });
});
