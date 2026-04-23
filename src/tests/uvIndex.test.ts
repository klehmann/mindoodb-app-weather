import { describe, expect, it } from "vitest";
import { classifyUvIndex } from "@/domain/uvIndex";

describe("classifyUvIndex", () => {
  it("classifies UV bands at each threshold", () => {
    expect(classifyUvIndex(0).band).toBe("low");
    expect(classifyUvIndex(2.99).band).toBe("low");
    expect(classifyUvIndex(3).band).toBe("moderate");
    expect(classifyUvIndex(5.99).band).toBe("moderate");
    expect(classifyUvIndex(6).band).toBe("high");
    expect(classifyUvIndex(7.99).band).toBe("high");
    expect(classifyUvIndex(8).band).toBe("very-high");
    expect(classifyUvIndex(10.99).band).toBe("very-high");
    expect(classifyUvIndex(11).band).toBe("extreme");
    expect(classifyUvIndex(15).band).toBe("extreme");
  });

  it("treats null / NaN as low", () => {
    expect(classifyUvIndex(null).band).toBe("low");
    expect(classifyUvIndex(NaN).band).toBe("low");
    expect(classifyUvIndex(undefined).band).toBe("low");
  });
});
