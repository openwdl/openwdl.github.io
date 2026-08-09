/**
 * Computes the relative luminance of a hex color as defined by WCAG 2.1.
 *
 * Relative luminance is a perceptual measure of a color's brightness, ranging
 * from 0 (absolute black) to 1 (absolute white). It is used here to decide
 * which logo variant will be legible against a given background.
 *
 * @param hex - A 6-digit hex color string, with or without the leading `#`
 *              (e.g. "#0A0C12" or "0A0C12").
 * @returns A luminance value in the range [0, 1].
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(hex: string): number {
  // Strip the leading '#' so we can slice raw hex pairs.
  const v = hex.replace("#", "");

  // WCAG linearisation: sRGB values below 0.03928 are treated as linear,
  // others are gamma-expanded with the standard power curve (γ = 2.4).
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };

  // Parse each channel from the hex string and linearise it.
  const r = toLin(parseInt(v.slice(0, 2), 16));
  const g = toLin(parseInt(v.slice(2, 4), 16));
  const b = toLin(parseInt(v.slice(4, 6), 16));

  // WCAG luminance weights reflect human sensitivity to each channel
  // (green most, blue least).
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Recommends the most legible WDL logo variant for a given background color.
 *
 * Dark backgrounds (luminance below 0.5) suit the "Teal + White" logo,
 * while light backgrounds suit "Teal + Black". The 0.5 threshold is the
 * midpoint of the luminance range and provides a reliable perceptual split.
 *
 * @param backgroundHex - A 6-digit hex color string describing the background
 *                        (e.g. "#0A0C12").
 * @returns `"Teal + White"` for dark backgrounds, `"Teal + Black"` for light ones.
 */
export function recommendVariant(
  backgroundHex: string,
): "Teal + White" | "Teal + Black" {
  // Luminance < 0.5 → dark background → use the white-text variant for contrast.
  return relativeLuminance(backgroundHex) < 0.5 ? "Teal + White" : "Teal + Black";
}
