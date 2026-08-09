import JSZip from "jszip";

/**
 * Fetches each asset by URL and packs all the resulting blobs into a single
 * ZIP archive, returned as a `Blob`.
 *
 * Accepts an optional `fetcher` parameter so the function is fully testable
 * without network access, pass a fake `fetch`-compatible function in tests
 * to avoid real HTTP requests.
 *
 * @param assets  Array of `{ name, url }` objects; `name` becomes the filename
 *                inside the zip, `url` is fetched to obtain the file contents.
 * @param fetcher A `fetch`-compatible function used to retrieve each asset.
 *                Defaults to the global `fetch`, making it a drop-in for
 *                browser usage while remaining injectable for unit tests.
 * @returns A `Promise` that resolves to a `Blob` containing the ZIP archive.
 */
export async function buildAssetZip(
  assets: { name: string; url: string }[],
  fetcher: typeof fetch = fetch,
): Promise<Blob> {
  const zip = new JSZip();

  // Fetch all assets concurrently to minimise total download time.
  await Promise.all(
    assets.map(async ({ name, url }) => {
      const res = await fetcher(url);
      // Store each blob under its declared filename within the zip root.
      zip.file(name, await res.blob());
    }),
  );

  return zip.generateAsync({ type: "blob" });
}
