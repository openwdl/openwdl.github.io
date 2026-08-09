// @vitest-environment node
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { compileDocs } from "./compile";
import { parseStdlibFunctions } from "./stdlib";
import type { StdlibFunction } from "./types";

// Resolve from this file, not `process.cwd()`: the suite runs with cwd `site/`
// while a focused `vitest --root site` run has cwd at the repository root.
const siteRoot = fileURLToPath(new URL("../..", import.meta.url));
const contentRoot = join(siteRoot, "src", "content", "docs");
const stdlibRoot = join(contentRoot, "stdlib");
const files = ["array", "file", "map", "numeric", "string", "string-array", "enum", "other"];

async function readFunctions(name: string): Promise<StdlibFunction[]> {
  const markdown = await readFile(join(stdlibRoot, `${name}.md`), "utf8");
  return parseStdlibFunctions(matter(markdown).content);
}

describe("standard-library parser", () => {
  it("parses the real library with expected groups and edge cases", async () => {
    const groups = await Promise.all(files.map(readFunctions));
    expect(groups.flat()).toHaveLength(55);
    expect(Object.fromEntries(files.map((name, index) => [name, groups[index].length]))).toEqual({
      array: 10,
      file: 22,
      map: 6,
      numeric: 5,
      string: 4,
      "string-array": 5,
      enum: 1,
      other: 2,
    });
    expect(groups[1].find((fn) => fn.name === "size")?.signatures).toHaveLength(3);
    expect(groups[6].find((fn) => fn.name === "value")?.signatures).toEqual([]);
    expect(groups.flat().every((fn) => fn.example.length > 0)).toBe(true);

    const versions = new Map(
      groups.flat().filter((fn) => fn.version).map((fn) => [fn.name, fn.version]),
    );
    expect(Object.fromEntries(versions)).toEqual({
      contains: "v1.2",
      chunk: "v1.2",
      join_paths: "v1.2",
      contains_key: "v1.2",
      values: "v1.2",
      find: "v1.2",
      matches: "v1.2",
      split: "v1.3",
    });
    expect(groups.flat().filter((fn) => fn.version).every((fn) => fn.description.length > 0)).toBe(true)

    const wrapped = groups.flat().find((fn) => fn.name === "basename");
    expect(wrapped?.params[0].text).toContain("working directory");
    expect(wrapped?.params[0].text).not.toContain("\n");
  });

  it("keeps function anchors aligned with compiled heading IDs", async () => {
    const result = await compileDocs({
      contentRoot,
      generatedFile: join(siteRoot, "src", "generated", "docs.generated.ts"),
      searchRoot: join(siteRoot, "public", "search"),
    });
    for (const page of result.pages.filter((candidate) => candidate.section === "stdlib")) {
      const headingIds = new Set(page.headings.filter((heading) => heading.depth === 2).map((heading) => heading.id));
      expect(page.functions?.every((fn) => headingIds.has(fn.anchor))).toBe(true);
    }
  });
});
