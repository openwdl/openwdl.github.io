import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

function expectControlRadius(path: string, selector: RegExp) {
  expect(stylesheet(path)).toMatch(
    new RegExp(`${selector.source}\\s*\\{[^}]*border-radius:\\s*var\\(--radius-control\\)`, "s"),
  );
}

/**
 * Stylesheets whose action controls are now kit `Button`s. The kit owns the
 * control radius, so these files must not re-declare control chrome of their
 * own — a reappearing `--radius-control` here means a hand-rolled button crept
 * back in.
 */
const migratedToKitButton = [
  "../about/AboutPage.module.css",
  "../not-found/NotFoundPage.module.css",
  "../blog/BlogPostPage.module.css",
];

describe("site action control radius", () => {
  it("uses the control token for the remaining hand-rolled actions", () => {
    expectControlRadius("../docs/DocsSearch.module.css", /\.trigger/);
    expectControlRadius("../docs/DocsSearch.module.css", /\.closeBtn/);
  });

  it("leaves control chrome to the kit Button where actions were migrated", () => {
    for (const path of migratedToKitButton) {
      expect(stylesheet(path)).not.toContain("--radius-control");
    }
  });

  it("keeps content surfaces on their existing radius tokens", () => {
    expect(stylesheet("../community/CommunityPage.module.css"))
      .toMatch(/\.card\s*\{[^}]*border-radius:\s*var\(--radius\)/s);
  });
});
