/**
 * Content type definitions for compiled OpenWDL documentation pages.
 */

/** Top-level documentation sections. */
export type DocSection = "learn" | "write" | "run" | "reference";

/** Page kind for navigation and display treatment. */
export type DocKind = "tutorial" | "guide" | "pattern" | "reference";

/** Validated frontmatter fields for a documentation page. */
export interface DocFrontmatter {
  title: string;
  description: string;
  slug: "/docs/" | `/docs/${string}/`;
  section: DocSection;
  group: string;
  order: number;
  kind: DocKind;
  minutes?: number;
  legacy: string[];
  headingAliases?: Record<string, string>;
  hidden?: boolean;
}

/** A single heading extracted from a page body. */
export interface DocHeadingPart {
  type: "text" | "code";
  value: string;
}

export interface DocHeading {
  depth: 1 | 2 | 3;
  id: string;
  text: string;
  parts?: DocHeadingPart[];
}

/** A fully compiled documentation page with extracted metadata. */
export interface CompiledDocPage extends DocFrontmatter {
  sourcePath: string;
  body: string;
  headings: DocHeading[];
  previous?: string;
  next?: string;
}

/** Options passed to compileDocs(). */
export interface CompileDocsOptions {
  contentRoot: string;
  generatedFile: string;
  searchRoot: string;
}

/** Output of compileDocs(). */
export interface CompiledDocs {
  pages: CompiledDocPage[];
  legacyRoutes: Record<string, string>;
}
