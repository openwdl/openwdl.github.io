import { gridScales, type GridScale } from "../data/brand";
import { ChapterHeader } from "../components/ChapterHeader";
import styles from "./Grid.module.css";

// Dots between grid lines. Odd, so dots align exactly at the intersections.
const CELL_DOTS = 9;
// Documentation previews use a brighter dot than the hero so the pattern reads
// clearly on the card surface (the hero itself stays subtle via --dot-color).
const PREVIEW_DOT = "var(--gray-300)";

/**
 * Renders one styled card for a single dot-grid scale: a live preview of the
 * dotted-line grid filling a shared stage, the numeric spec, and guidance on
 * when to use it.
 *
 * @param scale - The grid scale (name, abbreviation, radius, gap, usage).
 */
function GridCard({ scale }: { scale: GridScale }) {
  const cell = `${scale.gap * CELL_DOTS}px`;
  const dot = `radial-gradient(circle, ${PREVIEW_DOT} ${scale.radius}px, transparent ${scale.radius}px)`;
  return (
    <div className={styles.card}>
      <div
        className={styles.preview}
        style={{
          // Two layers: horizontal dotted lines, then vertical dotted lines.
          backgroundImage: `${dot}, ${dot}`,
          backgroundSize: `${scale.gap}px ${cell}, ${cell} ${scale.gap}px`,
        }}
      />
      <div className={styles.meta}>
        <h4>
          {scale.name} <span className={styles.abbr}>{scale.abbr}</span>
        </h4>
        <p className={styles.spec}>
          {scale.radius}px radius, {scale.gap}px gap
        </p>
        <p className={styles.usage}>{scale.usage}</p>
      </div>
    </div>
  );
}

/**
 * The Grid section of the brand-guidelines site. Documents the three dot-grid
 * pattern densities (large, medium, small) as side-by-side cards, each
 * previewing the pattern and explaining when to use it.
 *
 * @returns A JSX `<section>` element with id `"grid"`.
 */
export function Grid(): JSX.Element {
  return (
    <section id="grid-texture" className={styles.section}>
      <ChapterHeader
        number="05"
        label="Grid and texture"
        title="Use the dotted grid to add structure, not noise."
      >
        <p>
          Choose a scale according to the surface, keep its contrast low behind
          content, and use one density within a composition. Each specimen below
          shows the texture at its actual relative density.
        </p>
      </ChapterHeader>
      <div className={styles.cards}>
        {gridScales.map((scale) => (
          <GridCard key={scale.abbr} scale={scale} />
        ))}
      </div>
    </section>
  );
}
