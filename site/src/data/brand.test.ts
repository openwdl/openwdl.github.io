import { describe, it, expect } from "vitest";
import {
  tealScale,
  coolGrayScale,
  publicSansScale,
  martianMonoScale,
  logoVariants,
} from "./brand";

const HEX = /^#[0-9A-F]{6}$/;

describe("brand color scales", () => {
  it("teal has 10 shades from 900 to 50 with valid hex", () => {
    expect(tealScale).toHaveLength(10);
    expect(tealScale[0]).toEqual({ shade: 900, hex: "#205B69" });
    expect(tealScale.at(-1)).toEqual({ shade: 50, hex: "#EDFBFF" });
    tealScale.forEach((c) => expect(c.hex).toMatch(HEX));
  });

  it("cool gray has 10 shades from 900 to 50 with valid hex", () => {
    expect(coolGrayScale).toHaveLength(10);
    expect(coolGrayScale[0]).toEqual({ shade: 900, hex: "#0A0C12" });
    expect(coolGrayScale.at(-1)).toEqual({ shade: 50, hex: "#E8E8E9" });
    coolGrayScale.forEach((c) => expect(c.hex).toMatch(HEX));
  });
});

describe("type scales", () => {
  it("public sans headline 1 is bold 56px", () => {
    const h1 = publicSansScale.find((t) => t.usage === "Headline 1");
    expect(h1).toMatchObject({ weight: 700, size: 56, lineHeight: 0.9, letterSpacing: -2 });
  });

  it("martian mono code is light 12px", () => {
    const code = martianMonoScale.find((t) => t.usage === "Code");
    expect(code).toMatchObject({ weight: 300, size: 12, lineHeight: 1.4, letterSpacing: 0 });
  });
});

describe("logo variants", () => {
  it("has the four approved variants in order", () => {
    expect(logoVariants.map((v) => v.name)).toEqual([
      "Teal + White",
      "Teal + Black",
      "All White",
      "All Black",
    ]);
  });
});
