const base = import.meta.env.BASE_URL;

/**
 * A single stop on a color scale, pairing a numeric shade weight with its hex value.
 */
export type ColorShade = { shade: number; hex: string };

/**
 * The WDL teal color scale, ordered from darkest (900) to lightest (50).
 * Used as the primary brand color across all WDL materials.
 */
export const tealScale: ColorShade[] = [
  { shade: 900, hex: "#205B69" },
  { shade: 800, hex: "#29778A" },
  { shade: 700, hex: "#3599B2" },
  { shade: 600, hex: "#44C5E4" },
  { shade: 500, hex: "#4BD8FA" },
  { shade: 400, hex: "#6FE0FB" },
  { shade: 300, hex: "#86E5FC" },
  { shade: 200, hex: "#ACEDFD" },
  { shade: 100, hex: "#C7F3FD" },
  { shade: 50, hex: "#EDFBFF" },
];

/**
 * The WDL cool-gray color scale, ordered from darkest (900) to lightest (50).
 * Used for backgrounds, borders, and neutral UI chrome.
 */
export const coolGrayScale: ColorShade[] = [
  { shade: 900, hex: "#0A0C12" },
  { shade: 800, hex: "#0D0F16" },
  { shade: 700, hex: "#10131C" },
  { shade: 600, hex: "#171B26" },
  { shade: 500, hex: "#242833" },
  { shade: 400, hex: "#3A3F4A" },
  { shade: 300, hex: "#696E7A" },
  { shade: 200, hex: "#9497A1" },
  { shade: 100, hex: "#C7C8CB" },
  { shade: 50, hex: "#E8E8E9" },
];

/**
 * A single typographic style token describing font, weight, size, and spacing
 * for a named usage context (e.g. "Headline 1" or "Body M").
 */
export type TypeToken = {
  usage: string;
  font: "Public Sans" | "Martian Mono";
  weight: number;
  weightLabel: string;
  lineHeight: number;
  letterSpacing: number;
  size: number;
};

/**
 * The Public Sans type scale, covering headings (H1-H5) and body sizes (L/M/S).
 * Public Sans is the primary humanist sans-serif face for prose and UI copy.
 */
export const publicSansScale: TypeToken[] = [
  { usage: "Headline 1", font: "Public Sans", weight: 700, weightLabel: "Bold", lineHeight: 0.9, letterSpacing: -2, size: 56 },
  { usage: "Headline 2", font: "Public Sans", weight: 600, weightLabel: "Semi Bold", lineHeight: 1.0, letterSpacing: -2, size: 48 },
  { usage: "Headline 3", font: "Public Sans", weight: 600, weightLabel: "Semi Bold", lineHeight: 1.0, letterSpacing: -2, size: 36 },
  { usage: "Headline 4", font: "Public Sans", weight: 600, weightLabel: "Semi Bold", lineHeight: 1.0, letterSpacing: -2, size: 24 },
  { usage: "Headline 5", font: "Public Sans", weight: 600, weightLabel: "Semi Bold", lineHeight: 1.2, letterSpacing: -2, size: 20 },
  { usage: "Body L", font: "Public Sans", weight: 400, weightLabel: "Regular", lineHeight: 1.5, letterSpacing: 0, size: 17 },
  { usage: "Body M", font: "Public Sans", weight: 400, weightLabel: "Regular", lineHeight: 1.5, letterSpacing: 0, size: 15 },
  { usage: "Body S", font: "Public Sans", weight: 400, weightLabel: "Regular", lineHeight: 1.5, letterSpacing: 0, size: 13 },
];

/**
 * The Martian Mono type scale, covering alternate headings (H1-H5 Alt) plus
 * code and accent/caption styles.
 * Martian Mono is the monospace face used for technical emphasis and code display.
 */
export const martianMonoScale: TypeToken[] = [
  { usage: "H1 Alt", font: "Martian Mono", weight: 600, weightLabel: "Semi Bold", lineHeight: 1.0, letterSpacing: -3, size: 54 },
  { usage: "H2 Alt", font: "Martian Mono", weight: 500, weightLabel: "Medium", lineHeight: 1.1, letterSpacing: -3, size: 46 },
  { usage: "H3 Alt", font: "Martian Mono", weight: 500, weightLabel: "Medium", lineHeight: 1.1, letterSpacing: -3, size: 34 },
  { usage: "H4 Alt", font: "Martian Mono", weight: 500, weightLabel: "Medium", lineHeight: 1.1, letterSpacing: -3, size: 22 },
  { usage: "H5 Alt", font: "Martian Mono", weight: 500, weightLabel: "Medium", lineHeight: 1.3, letterSpacing: -3, size: 18 },
  { usage: "Code", font: "Martian Mono", weight: 300, weightLabel: "Light", lineHeight: 1.4, letterSpacing: 0, size: 12 },
  { usage: "Accent / Caption", font: "Martian Mono", weight: 300, weightLabel: "Light", lineHeight: 1.4, letterSpacing: 0, size: 14 },
];

/**
 * Describes one approved logo variant, combining a human-readable name,
 * the path to its SVG asset, and guidance on appropriate usage contexts.
 */
export type LogoVariant = {
  name: "Teal + White" | "Teal + Black" | "All White" | "All Black";
  svg: string;
  usage: string;
};

/**
 * The four approved WDL logo variants, each suited to a distinct background
 * or printing context. Order matches the canonical brand spec.
 */
export const logoVariants: LogoVariant[] = [
  { name: "Teal + White", svg: `${base}assets/svg/full-cyan-logo-white-text.svg`, usage: "Main logo. Best for dark-themed website and documentation UI and marketing materials." },
  { name: "Teal + Black", svg: `${base}assets/svg/full-cyan-logo-black-text.svg`, usage: "Alternative for light backgrounds while preserving brand presence." },
  { name: "All White", svg: `${base}assets/svg/full-logo-white.svg`, usage: "For dark backgrounds and monochrome printing." },
  { name: "All Black", svg: `${base}assets/svg/full-logo-black.svg`, usage: "For light backgrounds and monochrome printing." },
];

/**
 * A downloadable logo asset, referencing both an SVG vector source and
 * a high-resolution PNG raster (4×) for contexts that cannot render SVG.
 */
export type LogoAsset = { name: string; svg: string; png: string };

/**
 * The full catalogue of downloadable WDL logo assets, covering icon-only and
 * full-lockup forms in every approved colour treatment.
 */
export const logoAssets: LogoAsset[] = [
  { name: "Icon", svg: `${base}assets/svg/icon.svg`, png: `${base}assets/png/icon@4x.png` },
  { name: "Logo (Cyan)", svg: `${base}assets/svg/logo-cyan.svg`, png: `${base}assets/png/logo-cyan@4x.png` },
  { name: "Logo (Black)", svg: `${base}assets/svg/logo-black.svg`, png: `${base}assets/png/logo-black@4x.png` },
  { name: "Logo (White)", svg: `${base}assets/svg/logo-white.svg`, png: `${base}assets/png/logo-white@4x.png` },
  { name: "Full Logo (Teal + White)", svg: `${base}assets/svg/full-cyan-logo-white-text.svg`, png: `${base}assets/png/full-cyan-logo-white-text@4x.png` },
  { name: "Full Logo (Teal + Black)", svg: `${base}assets/svg/full-cyan-logo-black-text.svg`, png: `${base}assets/png/full-cyan-logo-black-text@4x.png` },
  { name: "Full Logo (All White)", svg: `${base}assets/svg/full-logo-white.svg`, png: `${base}assets/png/full-logo-white@4x.png` },
  { name: "Full Logo (All Black)", svg: `${base}assets/svg/full-logo-black.svg`, png: `${base}assets/png/full-logo-black@4x.png` },
];

/**
 * A dot-grid pattern scale. The brand's dotted background comes in three
 * densities; each defines the dot `radius` and the `gap` (center-to-center
 * spacing) in pixels, plus guidance on when to use it.
 */
export type GridScale = {
  name: string;
  abbr: "lg" | "md" | "sm";
  radius: number;
  gap: number;
  usage: string;
};

/**
 * The three approved dot-grid densities. They differ only in dot size and
 * spacing, scaling the texture to the surface it sits behind; the dot color is
 * chosen per context (subtle behind the hero, brighter in documentation cards).
 */
export const gridScales: GridScale[] = [
  { name: "Large", abbr: "lg", radius: 2, gap: 8, usage: "Spacious, full-bleed backdrops like hero areas and large empty regions where the texture should read softly and breathe." },
  { name: "Medium", abbr: "md", radius: 1.5, gap: 6, usage: "The default. Section backgrounds and medium surfaces; the balanced baseline density used across most of the site." },
  { name: "Small", abbr: "sm", radius: 1, gap: 5, usage: "Compact, dense contexts like small cards, tight panels, and constrained UI components where a finer grain reads better." },
];

/**
 * The OpenWDL brand mission statement, summarising the design philosophy
 * of clarity, structure, and human-readability.
 */
export const mission =
  "The OpenWDL brand embodies clarity, structure, and efficiency, mirroring the core principles of workflow definition. Designed to be human-readable and writable, WDL enables scientists, engineers, and platform operators to create scalable, adaptable workflows with ease.";

/**
 * The canonical URL for the WDL brand repository on GitHub.
 * Used for download links and attribution throughout the guidelines site.
 */
export const repoUrl = "https://github.com/openwdl/brand";
