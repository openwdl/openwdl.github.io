import { describe, it, expect, vi } from "vitest";
import JSZip from "jszip";
import { buildAssetZip } from "./zip";

describe("buildAssetZip", () => {
  it("fetches each asset and packs it into a zip", async () => {
    // Match the `typeof fetch` parameter shape so the mock is assignable to
    // buildAssetZip's `fetcher` argument under `tsc` (vitest's esbuild does not
    // type-check, but the production `tsc -b` build does).
    const fetcher = vi.fn(async (input: RequestInfo | URL) =>
      ({ blob: async () => new Blob([`data:${String(input)}`]) }) as unknown as Response,
    );
    const blob = await buildAssetZip(
      [
        { name: "icon.svg", url: "/brand/assets/svg/icon.svg" },
        { name: "logo-cyan.svg", url: "/brand/assets/svg/logo-cyan.svg" },
      ],
      fetcher,
    );
    expect(fetcher).toHaveBeenCalledTimes(2);

    const reloaded = await JSZip.loadAsync(blob);
    expect(Object.keys(reloaded.files).sort()).toEqual(["icon.svg", "logo-cyan.svg"]);
  });
});
