import { useState } from "react";
import { FiDownload, FiFileText } from "react-icons/fi";
import { logoAssets } from "../data/brand";
import { buildAssetZip } from "../lib/zip";
import { DownloadButton } from "@openwdl/ui";
import { ChapterHeader } from "../components/ChapterHeader";
import styles from "./Downloads.module.css";

/**
 * Extracts the final path segment (filename) from a URL string.
 *
 * Used to derive a sensible `download` attribute value from asset URLs such as
 * `/brand/assets/svg/icon.svg` → `"icon.svg"`.
 *
 * @param url  Any URL or path string.
 * @returns    The last `/`-delimited segment, falling back to `"asset"` when
 *             the URL is empty or ends with a slash.
 */
function basename(url: string): string {
  return url.split("/").pop() ?? "asset";
}

/**
 * The Downloads section of the OpenWDL brand-guidelines site.
 *
 * Renders one card per logo asset (sourced from `logoAssets` in `data/brand`)
 * with individual SVG and PNG download links. A "Download all (zip)" button
 * fetches every asset at click time and triggers a single zip download so
 * visitors can grab the full asset pack in one action.
 *
 * The zip is built on demand via `buildAssetZip` to avoid eagerly downloading
 * large PNGs on page load.
 *
 * @returns A JSX `<section>` element with id `"downloads"`.
 */
export function Downloads(): JSX.Element {
  // `busy` prevents double-clicks while a zip is being assembled.
  const [busy, setBusy] = useState(false);

  /**
   * Handles the "Download all (zip)" button click.
   * Collects every SVG and PNG URL, packs them into a zip via `buildAssetZip`,
   * then triggers a browser download via a temporary object URL.
   */
  async function downloadAll() {
    setBusy(true);
    try {
      // Flatten all assets: each logo contributes both an SVG and a PNG entry.
      const all = logoAssets.flatMap((a) => [
        { name: basename(a.svg), url: a.svg },
        { name: basename(a.png), url: a.png },
      ]);
      const blob = await buildAssetZip(all);

      // Create a temporary object URL and trigger a download via a hidden link.
      // The link must be in the DOM for the programmatic click to work in Safari.
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = "openwdl-brand-assets.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Revoke immediately afterwards to avoid leaking memory.
      URL.revokeObjectURL(href);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="downloads" className={styles.section}>
      <ChapterHeader
        number="07"
        label="Downloads"
        title="Use the source assets."
      >
        <p>
          Download the complete package or select an individual logo form and
          color treatment. Every asset is available as a scalable SVG and a
          high-resolution PNG.
        </p>
      </ChapterHeader>

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <span>
            {logoAssets.length} asset sets · {logoAssets.length * 2} individual files
          </span>
          <button type="button" className={styles.all} onClick={downloadAll} disabled={busy}>
            <FiDownload aria-hidden="true" />
            {busy ? "Preparing…" : "Download all assets (.zip)"}
          </button>
        </div>

        <div className={styles.grid}>
          {logoAssets.map((a) => {
            const onLight = a.name.includes("Black");
            return (
            <div key={a.name} className={styles.card}>
              <div
                className={styles.preview}
                style={{ background: onLight ? "var(--gray-50)" : "var(--gray-800)" }}
              >
                <img src={a.svg} alt={a.name} height={40} />
              </div>
              <span className={styles.name}>{a.name}</span>
              <div className={styles.actions}>
                <DownloadButton href={a.svg} filename={basename(a.svg)}>SVG</DownloadButton>
                <DownloadButton href={a.png} filename={basename(a.png)}>PNG</DownloadButton>
              </div>
            </div>
            );
          })}
        </div>

        <div className={styles.guidance}>
          <div>
            <h3>Choose SVG for production</h3>
            <p>Use the vector source for websites, documentation, presentations, and print.</p>
          </div>
          <div>
            <h3>Choose PNG for compatibility</h3>
            <p>Use the high-resolution raster where the destination cannot accept vector artwork.</p>
          </div>
        </div>

        <a
          className={styles.pdf}
          href={`${import.meta.env.BASE_URL}brand-guidelines.pdf`}
          download
        >
          <FiFileText aria-hidden="true" />
          Download archived PDF
        </a>
      </div>
    </section>
  );
}
