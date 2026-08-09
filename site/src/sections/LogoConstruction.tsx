import { logoAssets } from "../data/brand";
import { ChapterHeader } from "../components/ChapterHeader";
import styles from "./LogoConstruction.module.css";

/**
 * The Logo Construction section of the brand guidelines page.
 * Explains when to use the icon-only mark versus the full horizontal lockup,
 * rendering each variant sourced from the {@link logoAssets} catalogue.
 *
 * Two entries are displayed:
 * - "Icon", the standalone geometric mark for small UI contexts.
 * - "Full Logo (Teal + White)", icon + wordmark for headers and documents.
 */
export function LogoConstruction() {
  // Pull the two relevant assets by name; non-null assertion is safe because
  // both entries are always present in the logoAssets catalogue.
  const icon = logoAssets.find((a) => a.name === "Icon")!;
  const full = logoAssets.find((a) => a.name === "Full Logo (Teal + White)")!;

  return (
    <section id="logo-system" className={styles.section}>
      <ChapterHeader
        number="02"
        label="Logo system"
        title="A computational graph, simplified."
      >
        <p>
          The OpenWDL icon abstracts an acyclic computational graph into connected
          geometric forms. The custom wordmark pairs that structure with angular
          letterforms influenced by monospace and geometric type. Choose the form
          according to how much space and context the application provides.
        </p>
      </ChapterHeader>

      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Icon only</h3>
          <div className={styles.preview}>
            <img src={icon.svg} alt="OpenWDL icon" height={80} />
          </div>
          <p className={styles.note}>
            Use the standalone mark when the OpenWDL name already appears nearby
            or the available area cannot support the full lockup.
          </p>
          <ul className={styles.uses} aria-label="Icon-only uses">
            <li>Favicons</li>
            <li>Profile images</li>
            <li>Compact UI</li>
            <li>Watermarks</li>
          </ul>
        </div>

        <div className={styles.card}>
          <h3>Full logo</h3>
          <div className={styles.preview}>
            <img src={full.svg} alt="OpenWDL full logo" height={80} />
          </div>
          <p className={styles.note}>
            Use the horizontal icon-and-wordmark lockup whenever the identity
            needs to stand on its own.
          </p>
          <ul className={styles.uses} aria-label="Full-logo uses">
            <li>Website headers</li>
            <li>Documentation</li>
            <li>Presentations</li>
            <li>Promotional material</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
