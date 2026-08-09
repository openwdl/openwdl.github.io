// @vitest-environment node
import { gzipSync } from "node:zlib";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import MiniSearch from "minisearch";
import {
  buildSearchRecords,
  writeSearchChunks,
  type SearchRecord,
} from "./search";
import type { CompiledDocPage } from "./types";

const tasksPage: CompiledDocPage = {
  title: "Tasks",
  description: "Define a portable unit of computation.",
  slug: "/docs/start/language/tasks/",
  section: "write",
  group: "Language guide",
  order: 40,
  kind: "guide",
  legacy: [],
  sourcePath: "write/tasks.md",
  body: "## Inputs\n\nContent here.\n\n## Outputs\n\nMore content.",
  headings: [
    { depth: 2, id: "inputs", text: "Inputs" },
    { depth: 2, id: "outputs", text: "Outputs" },
  ],
};

const pages: CompiledDocPage[] = [tasksPage];

let output: string;

beforeEach(async () => {
  output = await mkdtemp(join(tmpdir(), "openwdl-search-"));
});

it("indexes headings with direct fragment URLs", () => {
  const records = buildSearchRecords([tasksPage]);
  expect(records).toContainEqual(
    expect.objectContaining({
      title: "Inputs",
      url: "/docs/start/language/tasks/#inputs",
      section: "write",
    }),
  );
});

it("indexes the page itself with its canonical URL", () => {
  const records = buildSearchRecords([tasksPage]);
  expect(records).toContainEqual(
    expect.objectContaining({
      title: "Tasks",
      url: "/docs/start/language/tasks/",
      section: "write",
    }),
  );
});

it("indexes body text in heading records instead of duplicating it on the page record", () => {
  const records = buildSearchRecords([tasksPage]);
  const pageRecord = records.find((r) => r.url === "/docs/start/language/tasks/");
  const inputsRecord = records.find((r) => r.url.endsWith("#inputs"));

  expect(pageRecord?.text).toBe("");
  expect(inputsRecord?.text).not.toMatch(/^#/m);
  expect(inputsRecord?.text).toContain("Content here");
});

it("indexes each heading with only the text in its section", () => {
  const page: CompiledDocPage = {
    ...tasksPage,
    body:
      "## Inputs\n\nInput context.\n\n### Optional inputs\n\nNested context.\n\n## Outputs\n\nOutput context.",
    headings: [
      { depth: 1, id: "tasks", text: "Tasks" },
      { depth: 2, id: "inputs", text: "Inputs" },
      { depth: 3, id: "optional-inputs", text: "Optional inputs" },
      { depth: 2, id: "outputs", text: "Outputs" },
    ],
  };

  const records = buildSearchRecords([page]);
  const inputs = records.find((record) => record.url.endsWith("#inputs"));
  const optionalInputs = records.find((record) =>
    record.url.endsWith("#optional-inputs"),
  );

  expect(inputs?.text).toContain("Input context");
  expect(inputs?.text).toContain("Nested context");
  expect(inputs?.text).not.toContain("Output context");
  expect(optionalInputs?.text).toContain("Nested context");
  expect(optionalInputs?.text).not.toContain("Output context");
});

it("does not duplicate the page title as a heading result", () => {
  const page: CompiledDocPage = {
    ...tasksPage,
    headings: [
      { depth: 1, id: "tasks", text: "Tasks" },
      ...tasksPage.headings,
    ],
  };

  const records = buildSearchRecords([page]);

  expect(records).not.toContainEqual(
    expect.objectContaining({ url: "/docs/start/language/tasks/#tasks" }),
  );
});

it("keeps the compressed complete index at or below 500 KB", async () => {
  const chunks = await writeSearchChunks(pages, output);
  const bytes = chunks.reduce(
    (sum, chunk) => sum + gzipSync(Buffer.from(chunk, "utf8")).byteLength,
    0,
  );
  expect(bytes).toBeLessThanOrEqual(500 * 1024);
});

it("writes manifest.json with section metadata", async () => {
  await writeSearchChunks(pages, output);
  const manifest = JSON.parse(await readFile(join(output, "manifest.json"), "utf8"));
  expect(manifest.sections.write.documentCount).toBeGreaterThan(0);
  expect(manifest.sections.write.filename).toBe("section-write.json");
  expect(manifest.gzipBytes).toBeGreaterThan(0);
});

it("writes per-section chunk files", async () => {
  await writeSearchChunks(pages, output);
  const chunk = await readFile(join(output, "section-write.json"), "utf8");
  const parsed = JSON.parse(chunk);
  expect(parsed).toBeDefined();
});

it("stores searchable body text so result snippets can show matching context", async () => {
  await writeSearchChunks(pages, output);
  const chunk = await readFile(join(output, "section-write.json"), "utf8");
  const index = MiniSearch.loadJSON<SearchRecord>(chunk, {
    fields: ["title", "description", "text"],
    storeFields: ["title", "description", "text", "section", "url"],
  });

  const [result] = index.search("content");
  expect(result?.text).toContain("Content here");
});
