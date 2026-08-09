import { describe, it, expect } from "vitest";
import { typeTokenToCss } from "./typeToken";
import { publicSansScale } from "../data/brand";

describe("typeTokenToCss", () => {
  it("formats Headline 1 as a CSS shorthand snippet", () => {
    const h1 = publicSansScale.find((t) => t.usage === "Headline 1")!;
    expect(typeTokenToCss(h1)).toBe(
      'font: 700 56px/0.9 "Public Sans"; letter-spacing: -2%;',
    );
  });

  it("omits negative-zero and renders 0% spacing correctly", () => {
    const bodyL = publicSansScale.find((t) => t.usage === "Body L")!;
    expect(typeTokenToCss(bodyL)).toBe(
      'font: 400 17px/1.5 "Public Sans"; letter-spacing: 0%;',
    );
  });
});
