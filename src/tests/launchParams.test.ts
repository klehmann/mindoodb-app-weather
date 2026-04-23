import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCATION_QUERIES,
  parseLaunchParams,
  parseLocationsString,
  parseRefreshInterval,
  parseUnits,
} from "@/services/launchParams";

describe("parseLocationsString", () => {
  it("returns an empty array for falsy input", () => {
    expect(parseLocationsString(undefined)).toEqual([]);
    expect(parseLocationsString(null)).toEqual([]);
    expect(parseLocationsString("")).toEqual([]);
  });

  it("splits on semicolons and trims each entry", () => {
    expect(parseLocationsString("Berlin, Germany;Karlsruhe, Germany;Washington, USA")).toEqual([
      "Berlin, Germany",
      "Karlsruhe, Germany",
      "Washington, USA",
    ]);
  });

  it("ignores empty entries from trailing/double semicolons and whitespace", () => {
    expect(parseLocationsString(";; Berlin ; ; Karlsruhe ;;")).toEqual(["Berlin", "Karlsruhe"]);
  });

  it("de-duplicates case-insensitively while keeping original casing", () => {
    expect(parseLocationsString("Berlin; berlin; BERLIN ;Karlsruhe")).toEqual(["Berlin", "Karlsruhe"]);
  });

  it("treats internal whitespace differences as duplicates", () => {
    expect(parseLocationsString("Berlin, Germany; Berlin,  Germany")).toEqual(["Berlin, Germany"]);
  });
});

describe("parseUnits", () => {
  it("defaults to metric", () => {
    expect(parseUnits(undefined)).toBe("metric");
    expect(parseUnits(null)).toBe("metric");
    expect(parseUnits("")).toBe("metric");
    expect(parseUnits("metric")).toBe("metric");
  });

  it("accepts imperial synonyms", () => {
    expect(parseUnits("imperial")).toBe("imperial");
    expect(parseUnits("IMPERIAL")).toBe("imperial");
    expect(parseUnits("us")).toBe("imperial");
    expect(parseUnits("english")).toBe("imperial");
  });

  it("falls back to metric for unknown values", () => {
    expect(parseUnits("weird")).toBe("metric");
  });
});

describe("parseRefreshInterval", () => {
  it("defaults to 0 for invalid or empty input", () => {
    expect(parseRefreshInterval(undefined)).toBe(0);
    expect(parseRefreshInterval("")).toBe(0);
    expect(parseRefreshInterval("abc")).toBe(0);
    expect(parseRefreshInterval("-5")).toBe(0);
  });

  it("rounds non-integer inputs to the nearest minute", () => {
    expect(parseRefreshInterval("5")).toBe(5);
    expect(parseRefreshInterval("5.4")).toBe(5);
    expect(parseRefreshInterval("5.6")).toBe(6);
  });

  it("clamps to 1440 to prevent pathological schedules", () => {
    expect(parseRefreshInterval("99999")).toBe(1440);
  });
});

describe("parseLaunchParams", () => {
  it("falls back to the default location when given null/undefined", () => {
    expect(parseLaunchParams(undefined)).toEqual({
      locationQueries: [...DEFAULT_LOCATION_QUERIES],
      units: "metric",
      refreshIntervalMinutes: 0,
    });
    expect(parseLaunchParams(null)).toEqual({
      locationQueries: [...DEFAULT_LOCATION_QUERIES],
      units: "metric",
      refreshIntervalMinutes: 0,
    });
  });

  it("falls back to the default location when locations is empty or missing", () => {
    expect(parseLaunchParams({})).toEqual({
      locationQueries: [...DEFAULT_LOCATION_QUERIES],
      units: "metric",
      refreshIntervalMinutes: 0,
    });
    expect(parseLaunchParams({ locations: "" })).toEqual({
      locationQueries: [...DEFAULT_LOCATION_QUERIES],
      units: "metric",
      refreshIntervalMinutes: 0,
    });
    expect(parseLaunchParams({ locations: ";; ;;" })).toEqual({
      locationQueries: [...DEFAULT_LOCATION_QUERIES],
      units: "metric",
      refreshIntervalMinutes: 0,
    });
  });

  it("parses a realistic params record", () => {
    expect(
      parseLaunchParams({
        locations: "Berlin, Germany;Karlsruhe, Germany;Washington, USA",
        units: "imperial",
        refreshIntervalMinutes: "30",
      }),
    ).toEqual({
      locationQueries: ["Berlin, Germany", "Karlsruhe, Germany", "Washington, USA"],
      units: "imperial",
      refreshIntervalMinutes: 30,
    });
  });

  it("ignores unknown keys without error", () => {
    expect(parseLaunchParams({ locations: "Berlin", foo: "bar" } as Record<string, string>)).toEqual({
      locationQueries: ["Berlin"],
      units: "metric",
      refreshIntervalMinutes: 0,
    });
  });
});
