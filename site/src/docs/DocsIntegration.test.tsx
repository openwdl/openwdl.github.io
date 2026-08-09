import { vi } from "vitest";

/**
 * Integration tests for the docs routing layer.
 *
 * Verifies that SiteApp composes the correct docs component for every route
 * kind and that the resulting DOM satisfies the accessibility contract that the
 * static prerenderer depends on: an <article> landmark and a skip link.
 *
 * vi.mock is hoisted above all imports by Vitest so the generated module is
 * replaced before any import in this file executes.
 */
vi.mock("../generated/docs.generated", () => ({
  DOC_PAGES: [
    {
      title: "Overview",
      description: "Learn about WDL.",
      slug: "/docs/start/overview/",
      section: "learn",
      group: "Overview",
      order: 10,
      kind: "guide",
      legacy: [],
      sourcePath: "learn/overview.md",
      body: "## Values\n\nContent.\n",
      headings: [{ depth: 2, id: "values", text: "Values" }],
    },
    {
      title: "Tasks",
      description: "Define a portable unit of computation.",
      slug: "/docs/start/language/tasks/",
      section: "learn",
      group: "Language guide",
      order: 40,
      kind: "guide",
      legacy: [],
      sourcePath: "write/tasks.md",
      body: "## Inputs\n\nContent.\n",
      headings: [{ depth: 2, id: "inputs", text: "Inputs" }],
    },
    {
      title: "Workflows",
      description: "Compose tasks.",
      slug: "/docs/start/language/workflows/",
      section: "learn",
      group: "Language guide",
      order: 50,
      kind: "guide",
      legacy: [],
      sourcePath: "write/workflows.md",
      body: "## Overview\n\nContent.\n",
      headings: [{ depth: 2, id: "overview", text: "Overview" }],
    },
  ],
}));

import { render, screen } from "@testing-library/react";
import { SiteApp } from "../SiteApp";

// ── docs-index route ──────────────────────────────────────────────────────────

describe("SiteApp docs-index route", () => {
  it("redirects to the base-aware Overview page", () => {
    const replaceLocation = vi.fn();
    render(<SiteApp routeId="docs:index" replaceLocation={replaceLocation} />);
    expect(replaceLocation).toHaveBeenCalledWith("/docs/start/overview/");
    expect(screen.getByRole("link", { name: /continue to the new page/i }))
      .toHaveAttribute("href", "/docs/start/overview/");
  });
});

// ── docs-page route ───────────────────────────────────────────────────────────

describe("SiteApp docs-page route", () => {
  it("renders an article landmark", () => {
    render(<SiteApp routeId="docs:/docs/start/language/tasks/" />);
    expect(document.body.innerHTML).toContain("<article");
  });

  it("renders a skip link targeting main content", () => {
    render(<SiteApp routeId="docs:/docs/start/language/tasks/" />);
    expect(screen.getByRole("link", { name: /skip to main content/i }))
      .toHaveAttribute("href", "#main-content");
  });

  it("renders mobile responsive disclosure buttons", () => {
    render(<SiteApp routeId="docs:/docs/start/language/tasks/" />);
    expect(screen.getByRole("button", { name: /docs menu/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /on this page/i })).toBeInTheDocument();
  });

  it("renders only one article and one main landmark", () => {
    render(<SiteApp routeId="docs:/docs/start/language/tasks/" />);
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });
});

// ── brand route ───────────────────────────────────────────────────────────────

describe("SiteApp brand-route integration", () => {
  it("renders the brand page when routeId is brand", () => {
    render(<SiteApp routeId="brand" />);
    expect(
      screen.getByRole("heading", { level: 1, name: /human-readable/i }),
    ).toBeInTheDocument();
  });
});
