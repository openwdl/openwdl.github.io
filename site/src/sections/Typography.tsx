import { publicSansScale, martianMonoScale } from "../data/brand";
import { TypeRow } from "../components/TypeRow";
import styles from "./Typography.module.css";

/**
 * The Typography section of the WDL brand-guidelines page.
 *
 * Renders both the Public Sans and Martian Mono type scales as interactive
 * tables. Each row is a `TypeRow` that shows a live sample and lets the user
 * copy the corresponding CSS shorthand to the clipboard.
 */
export function Typography() {
  return (
    <div className={styles.section}>
      <div className={styles.subhead}>
        <h3>Public Sans</h3>
        <span>{publicSansScale.length} approved styles · Copy CSS from any row</span>
      </div>
      {/* Iterate over every token in the Public Sans scale */}
      <div className={styles.table}>
        {publicSansScale.map((t) => (
          <TypeRow key={t.usage} token={t} />
        ))}
      </div>

      <div className={styles.subhead}>
        <h3>Martian Mono</h3>
        <span>{martianMonoScale.length} approved styles · Copy CSS from any row</span>
      </div>
      {/* Iterate over every token in the Martian Mono scale */}
      <div className={styles.table}>
        {martianMonoScale.map((t) => (
          <TypeRow key={t.usage} token={t} />
        ))}
      </div>
    </div>
  );
}
