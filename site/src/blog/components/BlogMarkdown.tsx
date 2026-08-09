import { Children, useState } from "react";
import type { Element as HastElement, Text as HastText } from "hast";
import Markdown, { type Components, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { FiInfo, FiLink } from "react-icons/fi";
import { Code, CodeBlock, copyText, useToast } from "@openwdl/ui";

/** Props for {@link BlogMarkdown}. */
export interface BlogMarkdownProps {
  /** The raw Markdown body of the post (front matter already stripped). */
  body: string;
  /** Additional class name applied to the root element. */
  className?: string;
}

const LANGUAGE_CLASS_PREFIX = "language-";

/**
 * Returns the concatenated text of a hast element's direct text children.
 * Fenced code blocks only ever contain text children, so this recovers the
 * exact source text without needing a full serializer.
 */
function collectText(node: HastElement): string {
  return node.children
    .filter((child): child is HastText => child.type === "text")
    .map((child) => child.value)
    .join("");
}

/**
 * Finds the `language-*` class on a fenced code element and returns the
 * language id, or `undefined` when the block has no declared language.
 */
function getLanguage(node: HastElement): string | undefined {
  const classNames = node.properties?.className;
  const classList = Array.isArray(classNames) ? classNames : [];
  const languageClass = classList.find(
    (name): name is string => typeof name === "string" && name.startsWith(LANGUAGE_CLASS_PREFIX),
  );
  return languageClass?.slice(LANGUAGE_CLASS_PREFIX.length);
}

/**
 * Renders a fenced code block (`<pre><code>`) with the shared `CodeBlock`,
 * deriving the language from the inner code element's `language-*` class
 * and trimming the single trailing newline every fenced block carries.
 */
function PreBlock({ node }: JSX.IntrinsicElements["pre"] & ExtraProps) {
  const codeNode = node?.children.find(
    (child): child is HastElement => child.type === "element" && child.tagName === "code",
  );

  if (!codeNode) {
    return null;
  }

  const raw = collectText(codeNode);
  const code = raw.endsWith("\n") ? raw.slice(0, -1) : raw;

  return (
    <div className="blog-code-breakout">
      <CodeBlock code={code} lang={getLanguage(codeNode)} />
    </div>
  );
}

/** Renders inline `` `code` `` spans with the shared `Code` component. */
function InlineCode({ node, ...props }: JSX.IntrinsicElements["code"] & ExtraProps) {
  void node;
  return <Code {...props} />;
}

/** Returns the plain text nested inside a heading's hast node. */
function collectDescendantText(node: HastElement): string {
  return node.children.map((child) => {
    if (child.type === "text") {
      return child.value;
    }
    if (child.type === "element") {
      return collectDescendantText(child);
    }
    return "";
  }).join("");
}

type HeadingProps = JSX.IntrinsicElements["h2"] & ExtraProps & {
  level: 2 | 3;
};

/** Renders a Markdown section heading with a hover/focus copy-link control. */
function SectionHeading({ level, node, children, id, ...props }: HeadingProps) {
  const toast = useToast();
  const [pointerSuppressed, setPointerSuppressed] = useState(false);
  const Tag = level === 2 ? "h2" : "h3";
  const label = node ? collectDescendantText(node) : "section";

  return (
    <div
      className={`blog-heading blog-heading-${level}`}
      data-copy-suppressed={pointerSuppressed || undefined}
      onMouseLeave={() => setPointerSuppressed(false)}
    >
      <Tag id={id} {...props}>{children}</Tag>
      {id && (
        <button
          type="button"
          className="blog-heading-copy"
          aria-label={`Copy link to ${label}`}
          onClick={async (event) => {
            const pointerActivation = event.detail > 0;
            const url = new URL(window.location.href);
            url.hash = id;
            try {
              await copyText(url.href);
              if (pointerActivation) {
                setPointerSuppressed(true);
              }
              toast("Copied link");
            } catch {
              toast("Copy failed, check clipboard permissions");
            }
          }}
        >
          <FiLink aria-hidden="true" focusable="false" />
        </button>
      )}
    </div>
  );
}

/** Preserves list semantics when article CSS replaces native bullets. */
function UnorderedList({ node, ...props }: JSX.IntrinsicElements["ul"] & ExtraProps) {
  void node;
  return <ul role="list" {...props} />;
}

/** Adds a decorative information gutter to Markdown callout notes. */
function Blockquote({
  node,
  children,
  ...props
}: JSX.IntrinsicElements["blockquote"] & ExtraProps) {
  void node;
  return (
    <blockquote {...props}>
      <span className="blog-note-icon" aria-hidden="true">
        <FiInfo />
      </span>
      <div className="blog-note-content">{children}</div>
    </blockquote>
  );
}

/**
 * Rewrites an image's Markdown `/blog-assets/`-rooted path so it resolves
 * under the site's configurable Vite base (e.g. `/brand/`), leaving every
 * other URL (external images, other absolute paths) untouched.
 */
function resolveImageSrc(src: string): string {
  if (!src.startsWith("/blog-assets/")) {
    return src;
  }
  return `${import.meta.env.BASE_URL}${src.slice(1)}`;
}

/** Renders a Markdown image, applying {@link resolveImageSrc} to its `src`. */
function MarkdownImage({ node, src, ...props }: JSX.IntrinsicElements["img"] & ExtraProps) {
  void node;
  return <img src={typeof src === "string" ? resolveImageSrc(src) : src} {...props} />;
}

/**
 * Renders a Markdown paragraph, wrapping it as a `<figure>` whenever it
 * contains an image. A trailing caption — any other non-whitespace inline
 * content the Markdown places alongside the image, such as `*Fig 1*` on
 * the next line — becomes a `<figcaption>`; a lone image gets a caption-less
 * figure instead of an empty one.
 */
function Paragraph({ node, children }: JSX.IntrinsicElements["p"] & ExtraProps) {
  const childNodes = node?.children ?? [];
  const imageIndex = childNodes.findIndex(
    (child) => child.type === "element" && child.tagName === "img",
  );

  if (imageIndex === -1) {
    return <p>{children}</p>;
  }

  const renderedChildren = Children.toArray(children);
  const image = renderedChildren[imageIndex];
  const hasCaption = childNodes.some((child, index) => {
    if (index === imageIndex) {
      return false;
    }
    return !(child.type === "text" && child.value.trim() === "");
  });

  if (!hasCaption) {
    return <figure>{image}</figure>;
  }

  const caption = renderedChildren.filter((_child, index) => index !== imageIndex);

  return (
    <figure>
      {image}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

const components: Components = {
  pre: PreBlock,
  code: InlineCode,
  h2: (props) => <SectionHeading level={2} {...props} />,
  h3: (props) => <SectionHeading level={3} {...props} />,
  ul: UnorderedList,
  blockquote: Blockquote,
  img: MarkdownImage,
  p: Paragraph,
};

/**
 * Renders a blog post's Markdown body: GitHub-flavored Markdown with
 * heading anchors (matching {@link extractTableOfContents}'s ids), fenced
 * code via the shared `CodeBlock`, inline code via the shared `Code`, and
 * `/blog-assets/` images resolved under the configured Vite base. Raw HTML
 * in the source is never executed — there is no `rehype-raw` plugin.
 */
export function BlogMarkdown({ body, className }: BlogMarkdownProps) {
  return (
    <div className={className}>
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
        {body}
      </Markdown>
    </div>
  );
}
