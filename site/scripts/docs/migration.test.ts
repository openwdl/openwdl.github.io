// @vitest-environment node
import { readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { compileDocs } from "./compile";

const siteRoot = fileURLToPath(new URL("../..", import.meta.url));
const contentRoot = join(siteRoot, "src", "content", "docs");
const generatedFile = join(siteRoot, "src", "generated", "docs.generated.ts");
const searchRoot = join(siteRoot, "public", "search");

const EXPECTED_SOURCE_PATHS = [
  "overview.md",
  "getting-started/quickstart.md",
  "getting-started/ecosystem.md",
  "getting-started/getting-help.md",
  "getting-started/contributing.md",
  "language-guide/variables.md",
  "language-guide/structs.md",
  "language-guide/enumerations.md",
  "language-guide/tasks.md",
  "language-guide/workflows.md",
  "language-guide/imports.md",
  "language-guide/versions.md",
  "design-patterns/linear-chaining/index.md",
  "design-patterns/multiple-io/index.md",
  "design-patterns/branch-and-merge/index.md",
  "design-patterns/task-aliasing/index.md",
  "design-patterns/conditional-statement/index.md",
  "design-patterns/scatter-gather/index.md",
  "reference/upgrade-guide.md",
  "reference/stdlib/numeric.md",
  "reference/stdlib/string.md",
  "reference/stdlib/file.md",
  "reference/stdlib/string-array.md",
  "reference/stdlib/array.md",
  "reference/stdlib/map.md",
  "reference/stdlib/enum.md",
  "reference/stdlib/other.md",
] as const;

const EXPECTED_SLUGS = [
  "/docs/start/overview/",
  "/docs/start/your-first-workflow/",
  "/docs/start/getting-help/",
  "/docs/start/contributing/",
  "/docs/start/ecosystem/",
  "/docs/start/language/variables/",
  "/docs/start/language/structs/",
  "/docs/start/language/enumerations/",
  "/docs/start/language/tasks/",
  "/docs/start/language/workflows/",
  "/docs/start/language/imports/",
  "/docs/start/language/versions/",
  "/docs/start/patterns/linear-chaining/",
  "/docs/start/patterns/multiple-io/",
  "/docs/start/patterns/branch-and-merge/",
  "/docs/start/patterns/task-aliasing/",
  "/docs/start/patterns/conditional-statement/",
  "/docs/start/patterns/scatter-gather/",
  "/docs/reference/upgrade-guide/",
  "/docs/reference/stdlib/numeric/",
  "/docs/reference/stdlib/string/",
  "/docs/reference/stdlib/file/",
  "/docs/reference/stdlib/string-array/",
  "/docs/reference/stdlib/array/",
  "/docs/reference/stdlib/map/",
  "/docs/reference/stdlib/enum/",
  "/docs/reference/stdlib/other/",
] as const;

interface SourceJson {
  repository: string;
  commit: string;
  migrations: Record<string, string>;
}

it("SOURCE.json lists all 27 source paths exactly once", async () => {
  const raw = await readFile(join(contentRoot, "SOURCE.json"), "utf8");
  const source = JSON.parse(raw) as SourceJson;

  expect(source.repository).toBe("openwdl/docs");
  expect(source.commit).toMatch(/^[0-9a-f]{40}$/);

  const migratedSourcePaths = Object.keys(source.migrations);
  expect(migratedSourcePaths.sort()).toEqual([...EXPECTED_SOURCE_PATHS].sort());
});

it("SOURCE.json commit is the exact provenance SHA", async () => {
  const raw = await readFile(join(contentRoot, "SOURCE.json"), "utf8");
  const source = JSON.parse(raw) as SourceJson;
  expect(source.commit).toBe("f2c60b74b7c1e4e77ac3de65721de4e113ccb3fb");
});

it("all 27 target markdown files exist", async () => {
  const raw = await readFile(join(contentRoot, "SOURCE.json"), "utf8");
  const source = JSON.parse(raw) as SourceJson;

  await Promise.all(
    Object.values(source.migrations).map((target) =>
      access(join(contentRoot, target)),
    ),
  );
});

it("compiles all 27 pages with no errors", async () => {
  const result = await compileDocs({ contentRoot, generatedFile, searchRoot });
  expect(result.pages).toHaveLength(27);
});

it("every expected slug is present", async () => {
  const result = await compileDocs({ contentRoot, generatedFile, searchRoot });
  const slugs = result.pages.map((p) => p.slug).sort();
  expect(slugs).toEqual([...EXPECTED_SLUGS].sort());
});

it("places all learning groups under Getting Started in navigation order", async () => {
  const result = await compileDocs({ contentRoot, generatedFile, searchRoot });
  const gettingStartedTitles = result.pages
    .filter((page) => page.section === "learn")
    .map((page) => page.title);
  expect(gettingStartedTitles).toEqual([
    "Overview",
    "Your first workflow",
    "Getting help",
    "Ecosystem",
    "Contributing",
    "Variables",
    "Structs",
    "Enumerations",
    "Tasks",
    "Workflows",
    "Imports",
    "Versions",
    "Linear chaining",
    "Multiple I/O",
    "Branch and merge",
    "Task aliasing",
    "Conditional statement",
    "Scatter-gather",
  ]);
});

it("first-workflow page uses the renamed heading", async () => {
  const body = await readFile(join(contentRoot, "learn", "your-first-workflow.md"), "utf8");
  expect(body).toContain("# Your first workflow");
  expect(body).not.toContain("# Quickstart");
});

it("no duplicate slugs across all pages", async () => {
  const result = await compileDocs({ contentRoot, generatedFile, searchRoot });
  const slugs = result.pages.map((p) => p.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});

it("header images exist for all design patterns", async () => {
  const patterns = [
    "linear-chaining",
    "multiple-io",
    "branch-and-merge",
    "task-aliasing",
    "conditional-statement",
    "scatter-gather",
  ];
  await Promise.all(
    patterns.map((p) =>
      access(join(siteRoot, "public", "docs", "patterns", p, "header.png")),
    ),
  );
});

/** Strip fenced code blocks and inline code spans to isolate prose. */
function stripCode(markdown: string): string {
  const lines = markdown.split("\n");
  let inFence = false;
  const prose = lines.filter((line) => {
    if (/^```/.test(line) || /^~~~/.test(line)) {
      inFence = !inFence;
      return false;
    }
    return !inFence;
  });
  return prose.join("\n").replace(/`[^`\n]+`/g, "");
}

it("no raw HTML tags in migrated Markdown pages", async () => {
  const raw = await readFile(join(contentRoot, "SOURCE.json"), "utf8");
  const source = JSON.parse(raw) as SourceJson;

  for (const target of Object.values(source.migrations)) {
    const content = await readFile(join(contentRoot, target), "utf8");
    const prose = stripCode(matter(content).content);
    expect(prose, `raw HTML tag found in ${target}`).not.toMatch(
      /<[a-zA-Z][^>]*>/,
    );
  }
});

it("ecosystem page lists all expected engines with links", async () => {
  const body = await readFile(join(contentRoot, "run", "ecosystem.md"), "utf8");

  const engines: [string, string][] = [
    ["AWS HealthOmics", "https://docs.aws.amazon.com/omics/"],
    ["Cromwell", "https://github.com/broadinstitute/cromwell"],
    ["dxCompiler", "https://github.com/dnanexus/dxCompiler"],
    ["miniwdl", "https://github.com/chanzuckerberg/miniwdl"],
    ["Sprocket", "https://github.com/stjude-rust-labs/sprocket"],
    ["Terra", "https://terra.bio/"],
    ["Toil", "https://toil.ucsc-cgl.org"],
  ];
  for (const [name, url] of engines) {
    expect(body, `engine "${name}" missing from ecosystem page`).toContain(name);
    expect(body, `link for "${name}" missing from ecosystem page`).toContain(url);
  }
});

it("ecosystem page lists miniwdl as supporting WDL v1.2", async () => {
  const body = await readFile(join(contentRoot, "run", "ecosystem.md"), "utf8");

  expect(body).toMatch(/\| \[miniwdl\]\[miniwdl-engine\] \| Binary \| v1\.2 \|/);
});

it("ecosystem page lists only WDL v1.1 for dxCompiler", async () => {
  const body = await readFile(join(contentRoot, "run", "ecosystem.md"), "utf8");

  expect(body).toMatch(/\| \[dxCompiler\]\[dxcompiler\] \| Binary \| v1\.1 \|/);
  expect(body).not.toMatch(/\[dxCompiler\][^\n]*v2\.0/);
});

it("ecosystem page lists the official Sprocket editor plugins", async () => {
  const body = await readFile(join(contentRoot, "run", "ecosystem.md"), "utf8");

  expect(body).toContain("https://github.com/stjude-rust-labs/sprocket-intellij");
  expect(body).toContain("https://github.com/stjude-rust-labs/sprocket-zed");
});

it("uses the same JetBrains IDEs label for Winstanley and Sprocket", async () => {
  const body = await readFile(join(contentRoot, "run", "ecosystem.md"), "utf8");

  expect(body).toMatch(
    /\| \[Winstanly WDL\]\s+\| [★☆] \| JetBrains IDEs\s+\|/,
  );
});

it("labels active development status for IDE integrations and development tools", async () => {
  const body = await readFile(join(contentRoot, "run", "ecosystem.md"), "utf8");
  const lines = body.split("\n");
  const expectedStatuses: [string, "★" | "☆"][] = [
    ["[Sprocket][sprocket] (LSP)", "★"],
    ["[wdl-mode]", "☆"],
    ["[poly-wdl]", "☆"],
    ["[Sprocket for IntelliJ]", "★"],
    ["[Winstanly WDL]", "☆"],
    ["[wdl-sublime]", "☆"],
    ["[sprocket.nvim]", "★"],
    ["[wdl-vim]", "☆"],
    ["[Sprocket][sprocket-vscode]", "★"],
    ["[Syntax Highlighter]", "☆"],
    ["[Sprocket for Zed]", "★"],
    ["[wdl-tests]", "☆"],
    ["[wdl-aid]", "☆"],
    ["[pytest-workflow]", "☆"],
    ["[wdl-atlas]", "★"],
    ["[wdldoc]", "☆"],
    ["[wdl-packager]", "☆"],
    ["[pytest-wdl]", "☆"],
    ["[spectool]", "★"],
  ];

  expect(body.match(/\| Name \| Active\\\* \|/g)).toHaveLength(2);
  const normalizedBody = body.replace(/\s+/g, " ");
  expect(
    normalizedBody.match(/A filled star \(★\) marks a project with a commit or release/g),
  ).toHaveLength(2);
  expect(
    normalizedBody.match(/Archived and deprecated projects receive an unfilled star/g),
  ).toHaveLength(2);

  for (const [marker, expected] of expectedStatuses) {
    const row = lines.find((line) => line.includes(marker));
    expect(row, `missing ecosystem row for ${marker}`).toBeDefined();
    expect(row?.split("|")[2]?.trim(), `wrong status for ${marker}`).toBe(expected);
  }
});

it("no relative .md links in migrated Markdown pages", async () => {
  const raw = await readFile(join(contentRoot, "SOURCE.json"), "utf8");
  const source = JSON.parse(raw) as SourceJson;

  for (const target of Object.values(source.migrations)) {
    const content = await readFile(join(contentRoot, target), "utf8");
    const body = matter(content).content;
    // Inline links: [text](something.md) — excluding external https:// URLs
    expect(body, `relative .md inline link found in ${target}`).not.toMatch(
      /\[[^\]]*\]\((?!https?:\/\/)[^)]*\.md(?:#[^)]*)?\)/,
    );
    // Reference-style definitions: [ref]: something.md — excluding external URLs
    expect(body, `relative .md reference definition found in ${target}`).not.toMatch(
      /^\[[^\]]+\]:\s+(?!https?:\/\/)[^\s]*\.md/m,
    );
  }
});

it("quickstart headingAlias is present in your-first-workflow page", async () => {
  const content = await readFile(
    join(contentRoot, "learn", "your-first-workflow.md"),
    "utf8",
  );
  const { data } = matter(content);
  expect(data.headingAliases).toBeDefined();
  expect(data.headingAliases).toMatchObject({ quickstart: "your-first-workflow" });
});

it("uses a non-keyword parameter name in the Tasks metadata example", async () => {
  const body = await readFile(join(contentRoot, "write", "tasks.md"), "utf8");

  expect(body).toContain("source_file: {");
  expect(body).not.toMatch(/^\s+in:\s*\{/m);
});

it("uses WDL 1.3 call bodies without the legacy input label", async () => {
  const raw = await readFile(join(contentRoot, "SOURCE.json"), "utf8");
  const source = JSON.parse(raw) as SourceJson;
  const legacyCallInputs =
    /\bcall\s+[A-Za-z_][A-Za-z0-9_.]*(?:\s+as\s+[A-Za-z_][A-Za-z0-9_]*)?\s*\{\s*input\s*:/;
  const reservedCallInput =
    /\bcall\s+[A-Za-z_][A-Za-z0-9_.]*(?:\s+as\s+[A-Za-z_][A-Za-z0-9_]*)?\s*\{[^}]*\bin\s*=/;

  for (const target of Object.values(source.migrations)) {
    const body = await readFile(join(contentRoot, target), "utf8");
    expect(body, `legacy call input label found in ${target}`).not.toMatch(
      legacyCallInputs,
    );
    expect(body, `reserved call input found in ${target}`).not.toMatch(
      reservedCallInput,
    );
  }
});

it("uses the singular input keyword for WDL input sections", async () => {
  const raw = await readFile(join(contentRoot, "SOURCE.json"), "utf8");
  const source = JSON.parse(raw) as SourceJson;

  for (const target of Object.values(source.migrations)) {
    const body = await readFile(join(contentRoot, target), "utf8");
    expect(body, `invalid inputs section found in ${target}`).not.toMatch(
      /^\s*inputs\s*\{/m,
    );
  }
});

it("formats camel-cased pattern identifiers as code literals in prose", async () => {
  const raw = await readFile(join(contentRoot, "SOURCE.json"), "utf8");
  const source = JSON.parse(raw) as SourceJson;
  const unformattedIdentifier =
    /(?<!`)\b(?:step|task|sample)[A-Z][A-Za-z0-9_]*(?!`)/;

  for (const target of Object.values(source.migrations).filter((path) =>
    path.includes("/patterns/"),
  )) {
    const body = await readFile(join(contentRoot, target), "utf8");
    const prose = body.replace(/```[\s\S]*?```/g, "");
    expect(prose, `unformatted code identifier found in ${target}`).not.toMatch(
      unformattedIdentifier,
    );
  }
});

it("all local #fragment and /docs/.../#fragment links resolve to real headings or declared aliases", async () => {
  const result = await compileDocs({ contentRoot, generatedFile, searchRoot });

  // Build a map from slug → valid anchor set (heading IDs ∪ headingAliases keys).
  const anchorsBySlug = new Map<string, Set<string>>();
  for (const page of result.pages) {
    const anchors = new Set<string>(page.headings.map((h) => h.id));
    if (page.headingAliases) {
      for (const key of Object.keys(page.headingAliases)) {
        anchors.add(key);
      }
    }
    anchorsBySlug.set(page.slug, anchors);
  }

  // Build a map from sourcePath → slug so we can resolve cross-page links.
  const slugBySourcePath = new Map<string, string>();
  for (const page of result.pages) {
    slugBySourcePath.set(page.sourcePath, page.slug);
  }

  // Inline link: [text](target) where target may be #fragment or /docs/.../#fragment.
  const INLINE_LINK_RE = /\[(?:[^\]]*)\]\(([^)]+)\)/g;
  // Reference-style definition: [label]: target
  const REF_DEF_RE = /^\[[^\]]+\]:\s+(\S+)/gm;

  const failures: string[] = [];

  for (const page of result.pages) {
    const sourcePath = page.sourcePath;
    const body = page.body;

    const checkLink = (rawTarget: string): void => {
      // Strip any trailing angle brackets and whitespace (rare edge case in ref defs).
      const target = rawTarget.replace(/^<|>$/g, "").trim();

      // Skip external links.
      if (/^https?:\/\//.test(target)) return;

      let slug: string;
      let fragment: string;

      if (target.startsWith("#")) {
        // Local fragment on the same page.
        slug = page.slug;
        fragment = target.slice(1);
      } else if (target.startsWith("/docs/") && target.includes("#")) {
        // Cross-page fragment.
        const hashIdx = target.indexOf("#");
        // Normalise to trailing-slash slug form.
        const rawSlug = target.slice(0, hashIdx);
        slug = rawSlug.endsWith("/") ? rawSlug : rawSlug + "/";
        fragment = target.slice(hashIdx + 1);
      } else {
        return; // Not a fragment link we need to check.
      }

      const anchors = anchorsBySlug.get(slug as string);
      if (!anchors) {
        failures.push(
          `${sourcePath}: target page "${slug}" not found (link: ${target})`,
        );
        return;
      }
      if (!anchors.has(fragment)) {
        failures.push(
          `${sourcePath}: unresolved fragment "#${fragment}" on page "${slug}" (link: ${target})`,
        );
      }
    };

    // Check inline links.
    let m: RegExpExecArray | null;
    INLINE_LINK_RE.lastIndex = 0;
    while ((m = INLINE_LINK_RE.exec(body)) !== null) {
      checkLink(m[1]);
    }

    // Check reference-style definitions.
    REF_DEF_RE.lastIndex = 0;
    while ((m = REF_DEF_RE.exec(body)) !== null) {
      checkLink(m[1]);
    }
  }

  expect(failures, failures.join("\n")).toHaveLength(0);
});
