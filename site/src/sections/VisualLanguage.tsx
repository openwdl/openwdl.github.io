import { ChapterHeader } from "../components/ChapterHeader";
import { ColorPalette } from "./ColorPalette";
import { Typography } from "./Typography";
import styles from "./VisualLanguage.module.css";

/** Complete color and typography reference presented as one visual-language chapter. */
export function VisualLanguage() {
  return (
    <section id="visual-language" className={styles.section}>
      <ChapterHeader
        number="04"
        label="Color and typography"
        title="One primary palette. Two typefaces."
      >
        <p>
          Teal identifies OpenWDL and marks emphasis. Cool Gray supplies
          backgrounds, borders, neutral text, and interface structure. Public
          Sans carries headings and prose; Martian Mono carries code, compact
          labels, captions, and technical accents.
        </p>
      </ChapterHeader>
      <div className={styles.content}>
        <Typography />
        <ColorPalette />
      </div>
    </section>
  );
}
