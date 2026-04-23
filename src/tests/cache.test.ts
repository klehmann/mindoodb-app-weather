import { beforeEach, describe, expect, it } from "vitest";
import {
  buildCacheKey,
  cacheDelete,
  cacheGet,
  cacheSet,
  formatCoordinateKey,
  normalizeQueryKey,
} from "@/services/cache";

describe("buildCacheKey", () => {
  it("builds a fully-qualified key with scope + version + id", () => {
    expect(buildCacheKey("geocode", 1, "berlin")).toBe("weather-app:geocode:v1:berlin");
  });
});

describe("formatCoordinateKey", () => {
  it("rounds to 3 decimal places to make near-equal coordinates share a cache entry", () => {
    expect(formatCoordinateKey(52.52001, 13.40499)).toBe("52.520_13.405");
    expect(formatCoordinateKey(52.52002, 13.40498)).toBe("52.520_13.405");
  });

  it("produces distinct keys for meaningfully different coordinates", () => {
    expect(formatCoordinateKey(52.52, 13.405)).not.toBe(formatCoordinateKey(52.52, 13.41));
  });
});

describe("normalizeQueryKey", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeQueryKey("  Karlsruhe,  Germany ")).toBe("karlsruhe, germany");
  });
});

describe("cacheGet / cacheSet / cacheDelete", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("round-trips a value", () => {
    cacheSet("geocode", 1, "berlin", { lat: 52.52, lon: 13.4 });
    const entry = cacheGet<{ lat: number; lon: number }>("geocode", 1, "berlin");
    expect(entry?.data).toEqual({ lat: 52.52, lon: 13.4 });
    expect(typeof entry?.ts).toBe("number");
  });

  it("returns null for a missing key", () => {
    expect(cacheGet("geocode", 1, "nowhere")).toBeNull();
  });

  it("returns null for corrupt JSON", () => {
    window.localStorage.setItem(buildCacheKey("geocode", 1, "corrupt"), "{{{");
    expect(cacheGet("geocode", 1, "corrupt")).toBeNull();
  });

  it("ignores entries missing required fields", () => {
    window.localStorage.setItem(buildCacheKey("geocode", 1, "partial"), JSON.stringify({ ts: 1 }));
    expect(cacheGet("geocode", 1, "partial")).toBeNull();
  });

  it("scopes by version so a bump invalidates old data", () => {
    cacheSet("forecast", 1, "point", { a: 1 });
    expect(cacheGet("forecast", 2, "point")).toBeNull();
    expect(cacheGet("forecast", 1, "point")?.data).toEqual({ a: 1 });
  });

  it("deletes a key", () => {
    cacheSet("geocode", 1, "berlin", { x: 1 });
    cacheDelete("geocode", 1, "berlin");
    expect(cacheGet("geocode", 1, "berlin")).toBeNull();
  });
});
