import type { TypeToken } from "../data/brand";
import { typeTokenToCss } from "../lib/typeToken";
import { CopyButton } from "@openwdl/ui";
import styles from "./TypeRow.module.css";

/**
 * Renders a single row in the typography scale table.
 *
 * Each row shows a live text sample rendered with the token's actual font
 * properties, followed by a set of metadata columns (font family, weight,
 * line-height, letter-spacing, size) and a `CopyButton` that writes the
 * token's CSS shorthand to the clipboard.
 *
 * @param token - The type token whose properties populate the row.
 */
export function TypeRow({ token }: { token: TypeToken }) {
  return (
    <div className={styles.row}>
      {/* Live sample rendered with the token's own font properties */}
      <span
        className={styles.sample}
        style={{
          fontFamily: `"${token.font}"`,
          fontWeight: token.weight,
          fontSize: `${token.size}px`,
          lineHeight: token.lineHeight,
          // Percent letter-spacing is relative to font size; CSS needs a length, so convert to em.
          letterSpacing: `${token.letterSpacing / 100}em`,
        }}
      >
        {token.usage}
      </span>
      {/* Metadata columns, hidden on narrow viewports via CSS */}
      <span className={styles.meta}>{token.font}</span>
      <span className={styles.meta}>{token.weightLabel}</span>
      {/* Convert the fractional lineHeight to a percentage for readability */}
      <span className={styles.meta}>{Math.round(token.lineHeight * 100)}%</span>
      <span className={styles.meta}>{token.letterSpacing}%</span>
      <span className={`${styles.meta} ${styles.size}`}>{token.size}px</span>
      <CopyButton value={typeTokenToCss(token)} label={`${token.usage} CSS`} />
    </div>
  );
}
