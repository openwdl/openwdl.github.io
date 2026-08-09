import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Plugin } from "unified";

const CALLOUT_NAMES = new Set(["note", "tip", "warning", "danger"]);

/**
 * Local interface matching the shape of mdast directive nodes extended with
 * the `hName`/`hProperties` fields understood by `remark-to-hast`.
 * Avoids `any` while keeping the plugin self-contained.
 */
interface DirectiveNode {
  type: string;
  name: string;
  attributes?: Record<string, string | null | undefined> | null;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

/**
 * Remark plugin that transforms container directives into custom hast elements:
 *
 * - `:::note/tip/warning/danger` → `<callout variant="…">`
 * - `::::tabs`                   → `<docs-tabs>`
 * - `:::tab{label="…"}`         → `<docs-tab label="…">`
 *
 * Throws for unknown directives or a `tab` missing a non-empty label.
 * Leaf and text directives are also rejected.
 */
export const markdownDirectives: Plugin<[], Root> = () => (tree) => {
  visit(tree, (rawNode) => {
    const node = rawNode as unknown as DirectiveNode;

    if (node.type === "containerDirective") {
      const name = node.name;

      if (CALLOUT_NAMES.has(name)) {
        node.data = {
          hName: "div",
          hProperties: { "data-directive": "callout", "data-variant": name },
        };
        return;
      }

      if (name === "tabs") {
        node.data = { hName: "div", hProperties: { "data-directive": "docs-tabs" } };
        return;
      }

      if (name === "tab") {
        const label = node.attributes?.["label"] ?? "";
        if (!label) {
          throw new Error(`tab directive requires a non-empty label attribute`);
        }
        node.data = {
          hName: "div",
          hProperties: { "data-directive": "docs-tab", "data-label": label },
        };
        return;
      }

      throw new Error(`Unknown directive: "${name}"`);
    }

    if (node.type === "leafDirective" || node.type === "textDirective") {
      throw new Error(`Unknown directive: "${node.name}"`);
    }
  });
};
