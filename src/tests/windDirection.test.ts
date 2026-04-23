import { describe, expect, it } from "vitest";
import { windDirectionFromDegrees } from "@/domain/windDirection";

describe("windDirectionFromDegrees", () => {
  it("snaps exact cardinals", () => {
    expect(windDirectionFromDegrees(0).cardinal).toBe("N");
    expect(windDirectionFromDegrees(45).cardinal).toBe("NE");
    expect(windDirectionFromDegrees(90).cardinal).toBe("E");
    expect(windDirectionFromDegrees(135).cardinal).toBe("SE");
    expect(windDirectionFromDegrees(180).cardinal).toBe("S");
    expect(windDirectionFromDegrees(225).cardinal).toBe("SW");
    expect(windDirectionFromDegrees(270).cardinal).toBe("W");
    expect(windDirectionFromDegrees(315).cardinal).toBe("NW");
  });

  it("handles sector boundaries consistently", () => {
    expect(windDirectionFromDegrees(22.5).cardinal).toBe("NE");
    expect(windDirectionFromDegrees(22.49).cardinal).toBe("N");
    expect(windDirectionFromDegrees(67.5).cardinal).toBe("E");
    expect(windDirectionFromDegrees(337.5).cardinal).toBe("N");
  });

  it("normalizes negative or overflowing inputs", () => {
    expect(windDirectionFromDegrees(360).cardinal).toBe("N");
    expect(windDirectionFromDegrees(-45).cardinal).toBe("NW");
    expect(windDirectionFromDegrees(720).cardinal).toBe("N");
  });
});
