import { useState } from "react";
import { logoVariants } from "../data/brand";
import { recommendVariant } from "../lib/logoVariant";
import { DownloadButton } from "@openwdl/ui";
import styles from "./LogoPreview.module.css";

/**
 * An interactive logo preview that recommends the best WDL logo variant for
 * any background color the user chooses.
 *
 * Renders a color-picker input alongside "Dark" and "Light" preset buttons.
 * As the background changes, `recommendVariant` is called to determine whether
 * "Teal + White" or "Teal + Black" best serves legibility, and the corresponding
 * logo SVG is rendered live against the chosen background.
 *
 * @returns A JSX element containing the preview stage and controls.
 */
export function LogoPreview(): JSX.Element {
  // Default to the canonical dark brand background (#0A0C12 = cool-gray-900).
  const [bg, setBg] = useState("#0A0C12");

  // Determine the recommended variant name based on the current background luminance.
  const recommended = recommendVariant(bg);

  // Look up the full variant object (including svg path) by the recommended name.
  const variant = logoVariants.find((v) => v.name === recommended)!;

  // Filename for the download attribute, derived from the variant's SVG URL.
  const filename = variant.svg.split("/").pop() ?? "openwdl-logo.svg";

  return (
    <div className={styles.wrap}>
      {/* Stage: renders the recommended logo SVG against the chosen background color. */}
      <div className={styles.stage} style={{ background: bg }}>
        <img src={variant.svg} alt={`OpenWDL logo, ${variant.name}`} height={64} />
      </div>

      <div className={styles.controls}>
        {/* Color picker label, aria-label matches the test query "Background color". */}
        <label className={styles.label}>
          Background color
          <input
            type="color"
            aria-label="Background color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
          />
        </label>

        {/* Preset buttons for the two most common brand contexts. */}
        <div className={styles.presets}>
          <button type="button" onClick={() => setBg("#0A0C12")}>Dark</button>
          <button type="button" onClick={() => setBg("#E8E8E9")}>Light</button>
        </div>

        {/* data-testid="recommended" is queried by the test to assert the variant name. */}
        <p>
          Recommended variant: <strong data-testid="recommended">{recommended}</strong>
        </p>

        {/* Download the currently recommended variant's SVG. */}
        <DownloadButton href={variant.svg} filename={filename}>
          Download SVG
        </DownloadButton>
      </div>
    </div>
  );
}
