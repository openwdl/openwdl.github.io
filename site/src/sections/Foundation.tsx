import { ChapterHeader } from "../components/ChapterHeader";
import styles from "./Foundation.module.css";

const principles = [
  {
    title: "Readable",
    copy: "Use direct language, legible type, and hierarchy that makes the next step obvious.",
  },
  {
    title: "Structured",
    copy: "Build pages and interfaces from shared rules rather than isolated treatments.",
  },
  {
    title: "Portable",
    copy: "Preserve recognition across websites, documents, presentations, and software.",
  },
];

/** Foundation chapter connecting the visual system to properties of WDL. */
export function Foundation() {
  return (
    <section id="foundation" className={styles.section}>
      <ChapterHeader
        number="01"
        label="Foundation"
        title="The visual system follows the language."
      >
        <p>
          OpenWDL describes data-processing workflows in a syntax intended for
          people to read and write. Its visual system applies the same priorities
          to communication: clear hierarchy, repeatable structure, and consistent
          behavior across media.
        </p>
      </ChapterHeader>
      <div className={styles.principles}>
        {principles.map(({ title, copy }) => (
          <article key={title} className={styles.card}>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
