import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "@openwdl/ui";
import { BlogMarkdown } from "./BlogMarkdown";

describe("BlogMarkdown", () => {
  it("slugs headings the same way rehype-slug does", () => {
    render(
      <ToastProvider>
        <BlogMarkdown body={"## Language Ergonomics\n"} />
      </ToastProvider>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Language Ergonomics" }))
      .toHaveAttribute("id", "language-ergonomics");
  });

  it("copies a heading's full section URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const expectedUrl = new URL(window.location.href);
    expectedUrl.hash = "language-ergonomics";

    render(
      <ToastProvider>
        <BlogMarkdown body={"## Language Ergonomics\n"} />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", {
      name: "Copy link to Language Ergonomics",
    }));

    expect(writeText).toHaveBeenCalledWith(expectedUrl.href);
    expect(await screen.findByRole("status")).toHaveTextContent("Copied link");
  });

  it("renders fenced code with the shared CodeBlock, stripping the trailing newline", () => {
    const body = "```wdl\nversion 1.3\n\nworkflow x {}\n```\n";
    render(<BlogMarkdown body={body} />);

    expect(screen.getByText("wdl")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
    const code = screen.getByText((_content, element) =>
      element?.tagName === "CODE" && element.textContent === "version 1.3\n\nworkflow x {}");
    expect(code).toBeInTheDocument();
  });

  it("renders inline code with the shared Code component, not the CodeBlock chrome", () => {
    render(<BlogMarkdown body={"Use the `split` function.\n"} />);

    const code = screen.getByText("split");
    expect(code.tagName).toBe("CODE");
    expect(code.closest("pre")).toBeNull();
    expect(screen.queryByRole("button", { name: "Copy code" })).toBeNull();
  });

  it("renders links to their target", () => {
    render(<BlogMarkdown body={"See the [spec](https://example.com/spec).\n"} />);
    expect(screen.getByRole("link", { name: "spec" })).toHaveAttribute("href", "https://example.com/spec");
  });

  it("preserves unordered-list semantics for Safari and VoiceOver", () => {
    render(<BlogMarkdown body={"- First item\n- Second item\n"} />);
    expect(screen.getByRole("list")).toHaveAttribute("role", "list");
  });

  it("renders a decorative information icon in blockquote notes", () => {
    const { container } = render(
      <BlogMarkdown body={"> **Compatibility note**\n>\n> Compatible content.\n"} />,
    );

    const note = screen.getByText("Compatibility note").closest("blockquote");
    expect(note).not.toBeNull();
    expect(container.querySelector("blockquote > .blog-note-icon"))
      .toHaveAttribute("aria-hidden", "true");
  });

  it("rewrites /blog-assets/ image paths under the configured Vite base and preserves alt text", () => {
    render(<BlogMarkdown body={"![A diagram](/blog-assets/diagram.png)\n"} />);
    const image = screen.getByAltText("A diagram");
    expect(image).toHaveAttribute("src", `${import.meta.env.BASE_URL}blog-assets/diagram.png`);
  });

  it("leaves external image URLs untouched", () => {
    render(<BlogMarkdown body={"![External](https://example.com/pic.png)\n"} />);
    expect(screen.getByAltText("External")).toHaveAttribute("src", "https://example.com/pic.png");
  });

  it("wraps an image with a figcaption only when the Markdown supplies caption text", () => {
    const body = [
      "![Fig 1](/blog-assets/demographics.png)",
      "*Fig 1*",
      "",
      "![Solo](/blog-assets/solo.png)",
      "",
    ].join("\n");
    render(<BlogMarkdown body={body} />);

    const captioned = screen.getByAltText("Fig 1").closest("figure");
    expect(captioned).not.toBeNull();
    expect(within(captioned as HTMLElement).getByText("Fig 1", { selector: "figcaption *" }))
      .toBeInTheDocument();

    const solo = screen.getByAltText("Solo").closest("figure");
    expect(solo).not.toBeNull();
    expect((solo as HTMLElement).querySelector("figcaption")).toBeNull();
  });
});
