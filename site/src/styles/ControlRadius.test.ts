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

describe("site action control radius", () => {
  it("uses the control token for site actions", () => {
    expectControlRadius("../sections/Hero.module.css", /\.primary,\s*\.secondary/);
    expectControlRadius("../sections/Downloads.module.css", /\.all/);
    expectControlRadius("../sections/DesignSystem.module.css", /\.storybookLink/);
    expectControlRadius("../components/LogoPreview.module.css", /\.presets button/);
    expectControlRadius("../components/ChapterNav.module.css", /\.toggle/);
    expectControlRadius("../docs/DocsDisclosure.module.css", /\.toggle/);
    expectControlRadius("../docs/DocsSearch.module.css", /\.trigger/);
    expectControlRadius("../docs/DocsSearch.module.css", /\.closeBtn/);
    expectControlRadius("../about/AboutPage.module.css", /\.action/);
    expectControlRadius(
      "../not-found/NotFoundPage.module.css",
      /\.primaryAction,\s*\.secondaryAction/,
    );
  });

  it("uses the control token for setup wizard actions", () => {
    const path = "../get-started/components/Wizard.module.css";
    expectControlRadius(path, /\.backButton/);
    expectControlRadius(path, /\.continueButton/);
    expectControlRadius(path, /\.changeAnswersButton/);
    expectControlRadius(path, /\.setupRequestLink/);
    expectControlRadius(path, /\.startOverButton/);
    expectControlRadius(path, /\.startOverConfirmButton,\s*\.startOverCancelButton/);
  });

  it("keeps content surfaces on their existing radius tokens", () => {
    expect(stylesheet("../community/CommunityPage.module.css"))
      .toMatch(/\.card\s*\{[^}]*border-radius:\s*var\(--radius\)/s);
  });
});
