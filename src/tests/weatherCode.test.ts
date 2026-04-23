import { describe, expect, it } from "vitest";
import {
  conditionI18nKey,
  resolveDayOrNight,
  toVisualCondition,
  visualStateForCode,
} from "@/domain/weatherCode";

describe("visualStateForCode", () => {
  it("maps clear codes", () => {
    expect(visualStateForCode(0)).toBe("clear");
    expect(visualStateForCode(1)).toBe("clear");
  });

  it("maps partly cloudy", () => {
    expect(visualStateForCode(2)).toBe("partly-cloudy");
  });

  it("maps overcast/fog to cloudy", () => {
    expect(visualStateForCode(3)).toBe("cloudy");
    expect(visualStateForCode(45)).toBe("cloudy");
    expect(visualStateForCode(48)).toBe("cloudy");
  });

  it("maps all rain variants", () => {
    for (const code of [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]) {
      expect(visualStateForCode(code)).toBe("rain");
    }
  });

  it("maps all snow variants", () => {
    for (const code of [71, 73, 75, 77, 85, 86]) {
      expect(visualStateForCode(code)).toBe("snow");
    }
  });

  it("maps thunderstorm variants", () => {
    for (const code of [95, 96, 99]) {
      expect(visualStateForCode(code)).toBe("storm");
    }
  });

  it("falls back to cloudy for unknown codes", () => {
    expect(visualStateForCode(123)).toBe("cloudy");
  });
});

describe("resolveDayOrNight", () => {
  it("uses explicit isDay flag when provided", () => {
    expect(resolveDayOrNight({ isDay: true })).toBe("day");
    expect(resolveDayOrNight({ isDay: false })).toBe("night");
  });

  it("compares against sunrise/sunset when no explicit flag is given", () => {
    expect(
      resolveDayOrNight({
        timeIso: "2026-04-23T10:00",
        sunriseIso: "2026-04-23T06:30",
        sunsetIso: "2026-04-23T20:00",
      }),
    ).toBe("day");

    expect(
      resolveDayOrNight({
        timeIso: "2026-04-23T22:00",
        sunriseIso: "2026-04-23T06:30",
        sunsetIso: "2026-04-23T20:00",
      }),
    ).toBe("night");
  });

  it("defaults to day when nothing is known", () => {
    expect(resolveDayOrNight({})).toBe("day");
  });
});

describe("toVisualCondition", () => {
  it("composes a visual condition from code + period", () => {
    expect(toVisualCondition(2, "night")).toEqual({
      state: "partly-cloudy",
      period: "night",
      key: "partly-cloudy-night",
      weatherCode: 2,
    });
  });
});

describe("conditionI18nKey", () => {
  it("maps well-known codes to their own keys", () => {
    expect(conditionI18nKey(0)).toBe("condition.clearSky");
    expect(conditionI18nKey(95)).toBe("condition.thunderstorm");
  });

  it("falls back to the visual-state bucket key for unknown codes", () => {
    expect(conditionI18nKey(7)).toBe("condition.state.cloudy");
  });
});
