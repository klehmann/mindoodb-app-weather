import { describe, expect, it } from "vitest";
import { classifyAqi, classifyEuropeanAqi, classifyUsAqi } from "@/domain/airQuality";

describe("classifyEuropeanAqi", () => {
  it("covers each band boundary", () => {
    expect(classifyEuropeanAqi(0).band).toBe("good");
    expect(classifyEuropeanAqi(19).band).toBe("good");
    expect(classifyEuropeanAqi(20).band).toBe("fair");
    expect(classifyEuropeanAqi(39).band).toBe("fair");
    expect(classifyEuropeanAqi(40).band).toBe("moderate");
    expect(classifyEuropeanAqi(59).band).toBe("moderate");
    expect(classifyEuropeanAqi(60).band).toBe("poor");
    expect(classifyEuropeanAqi(79).band).toBe("poor");
    expect(classifyEuropeanAqi(80).band).toBe("veryPoor");
    expect(classifyEuropeanAqi(99).band).toBe("veryPoor");
    expect(classifyEuropeanAqi(100).band).toBe("extreme");
    expect(classifyEuropeanAqi(500).band).toBe("extreme");
  });
});

describe("classifyUsAqi", () => {
  it("covers each band boundary", () => {
    expect(classifyUsAqi(0).band).toBe("good");
    expect(classifyUsAqi(50).band).toBe("good");
    expect(classifyUsAqi(51).band).toBe("moderate");
    expect(classifyUsAqi(100).band).toBe("moderate");
    expect(classifyUsAqi(101).band).toBe("sensitive");
    expect(classifyUsAqi(150).band).toBe("sensitive");
    expect(classifyUsAqi(151).band).toBe("unhealthy");
    expect(classifyUsAqi(200).band).toBe("unhealthy");
    expect(classifyUsAqi(201).band).toBe("veryUnhealthy");
    expect(classifyUsAqi(300).band).toBe("veryUnhealthy");
    expect(classifyUsAqi(301).band).toBe("hazardous");
    expect(classifyUsAqi(500).band).toBe("hazardous");
  });
});

describe("classifyAqi", () => {
  it("dispatches to the right scale", () => {
    expect(classifyAqi(25, "european").band).toBe("fair");
    expect(classifyAqi(25, "us").band).toBe("good");
  });

  it("treats null/NaN as good on both scales", () => {
    expect(classifyAqi(null, "european").band).toBe("good");
    expect(classifyAqi(null, "us").band).toBe("good");
  });
});
