import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const stylesheet = (path: string) =>
  readFileSync(resolve(__dirname, path), "utf8");

it("collapses the About comparison and problem grid without overflow", () => {
  const css = stylesheet("../about/AboutPage.module.css");

  expect(css).toMatch(/\.sectionIntro\s*>\s*p:not\(\.eyebrow\)/);
  expect(css).toMatch(/\.today\s*>\s*p:not\(\.eyebrow\)/);
  expect(css).toMatch(/grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  expect(css).toMatch(/@media \(max-width:\s*860px\)[\s\S]*\.approachLayout[\s\S]*grid-template-columns:\s*1fr/);
  expect(css).toMatch(/@media \(max-width:\s*640px\)[\s\S]*\.problemGrid[\s\S]*grid-template-columns:\s*1fr/);
});

it("collapses the Community gallery from three columns to two and one", () => {
  const css = stylesheet("../community/CommunityPage.module.css");

  expect(css).toMatch(/\.hero\s*>\s*p:last-child/);
  expect(css).toMatch(/grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  expect(css).toMatch(/@media \(max-width:\s*900px\)[\s\S]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  expect(css).toMatch(/@media \(max-width:\s*640px\)[\s\S]*grid-template-columns:\s*1fr/);
});
