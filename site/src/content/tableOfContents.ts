import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Heading } from "mdast";

/** A plain or inline-code fragment of a table-of-contents label. */
export interface TocLabelPart {
  value: string;
  code: boolean;
}

/**
 * A single Markdown heading collected into the article's table of contents.
 * Only depth-two (`##`) and depth-three (`###`) headings are surfaced;
 * deeper or shallower headings are skipped but still consume a slot in the
 * shared slug counter (see {@link extractTableOfContents}).
 */
export interface TocItem {
  depth: 2 | 3;
  id: string;
  label: string;
  labelParts?: readonly TocLabelPart[];
}

/**
 * Parses raw Markdown and extracts its depth-two and depth-three headings
 * into a flat table of contents, in document order.
 *
 * Every heading in the document — not only depth two/three ones — is run
 * through a single `GithubSlugger` instance in document order, exactly as
 * `rehype-slug` does when it assigns heading `id`s at render time. This
 * keeps duplicate-heading suffixes (e.g. `language`, `language-1`) in sync
 * between this statically-extracted TOC and the `id`s actually rendered on
 * the headings, even when a duplicate lives at a depth this TOC omits.
 *
 * This runs once per article body ahead of render (not during it), so the
 * TOC never depends on React's render order or commit phase.
 *
 * Parsing uses `remarkGfm`, matching the `remarkGfm`-enabled pipeline
 * `BlogMarkdown` renders with. Without it, GFM-only syntax (strikethrough,
 * autolink literals, tables, etc.) would parse as literal text here — e.g.
 * `~~Old~~ New` would keep its `~~` markers in the extracted label instead
 * of resolving to `Old New` the way the rendered heading (and `rehype-slug`,
 * which slugs the post-remark-rehype hast tree) actually does — silently
 * diverging the static TOC from the rendered heading ids/text.
 */
export function extractTableOfContents(markdown: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];

  visit(tree, "heading", (node: Heading) => {
    const label = toString(node);
    const id = slugger.slug(label);

    if (node.depth === 2 || node.depth === 3) {
      const hasInlineCode = node.children.some((child) => child.type === "inlineCode");
      const labelParts = hasInlineCode
        ? node.children.map((child) => ({
            value: toString(child),
            code: child.type === "inlineCode",
          }))
        : undefined;
      items.push({ depth: node.depth, id, label, ...(labelParts && { labelParts }) });
    }
  });

  return items;
}
