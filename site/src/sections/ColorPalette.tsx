import { tealScale, coolGrayScale } from "../data/brand";
import { ColorSwatch } from "../components/ColorSwatch";
import styles from "./ColorPalette.module.css";

/**
 * The Color Palette section of the brand guidelines page.
 * Renders two labeled grids, Teal (primary brand) and Cool Gray (neutral support), 
 * each containing ten {@link ColorSwatch} buttons sourced from the brand data module.
 * Clicking any swatch copies its hex value to the clipboard and shows a toast.
 */
export function ColorPalette() {
  return (
    <div className={styles.section}>
      <div className={styles.subhead}>
        <h3>Teal <span className={styles.tag}>Primary brand color</span></h3>
        <span>Click any swatch to copy its hex value</span>
      </div>
      <div className={styles.grid}>
        {tealScale.map((c) => (
          <ColorSwatch
            key={`teal-${c.shade}`}
            family="Teal"
            shade={c.shade}
            hex={c.hex}
          />
        ))}
      </div>

      <div className={styles.subhead}>
        <h3>Cool Gray <span className={styles.tag}>Supporting neutral palette</span></h3>
        <span>Click any swatch to copy its hex value</span>
      </div>
      <div className={styles.grid}>
        {coolGrayScale.map((c) => (
          <ColorSwatch
            key={`gray-${c.shade}`}
            family="Cool Gray"
            shade={c.shade}
            hex={c.hex}
          />
        ))}
      </div>
    </div>
  );
}
