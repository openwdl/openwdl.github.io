import { describe, it, expect } from "vitest";
import { relativeLuminance, recommendVariant } from "./logoVariant";

describe("relativeLuminance", () => {
  it("is ~0 for black and ~1 for white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 2);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 2);
  });
});

describe("recommendVariant", () => {
  it("recommends Teal + White on the dark brand background", () => {
    expect(recommendVariant("#0A0C12")).toBe("Teal + White");
  });
  it("recommends Teal + Black on a light background", () => {
    expect(recommendVariant("#E8E8E9")).toBe("Teal + Black");
  });
});
