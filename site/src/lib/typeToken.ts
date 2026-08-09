import type { TypeToken } from "../data/brand";

/**
 * Converts a `TypeToken` into a ready-to-paste CSS snippet containing the
 * `font` shorthand and a `letter-spacing` declaration.
 *
 * The output format is intentionally compact so it can be dropped directly
 * into an inline style block or a CSS rule:
 *
 * ```
 * font: 700 56px/0.9 "Public Sans"; letter-spacing: -2%;
 * ```
 *
 * @param token - The type token to serialise.
 * @returns A CSS string with `font` shorthand and `letter-spacing`.
 */
export function typeTokenToCss(token: TypeToken): string {
  // Construct the CSS font shorthand: weight size/lineHeight "font family"
  // Then append letter-spacing as a percentage value.
  return `font: ${token.weight} ${token.size}px/${token.lineHeight} "${token.font}"; letter-spacing: ${token.letterSpacing}%;`;
}
