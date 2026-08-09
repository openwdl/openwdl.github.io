import { render, screen, within } from "@testing-library/react";
import type { CompiledDocPage } from "../../scripts/docs/types";
import { DocsPage } from "./DocsPage";

const tasksPage: CompiledDocPage = {
  title: "Tasks",
  description: "Define a portable unit of computation.",
  slug: "/docs/start/language/tasks/",
  section: "learn",
  group: "Language guide",
  order: 40,
  kind: "guide",
  legacy: [],
  sourcePath: "write/tasks.md",
  body: "## Inputs\n\nSpecify inputs to a task.\n",
  previous: "/docs/start/language/variables/",
  next: "/docs/start/language/workflows/",
  headings: [
    { depth: 2, id: "inputs", text: "Inputs" },
  ],
};

const pages: CompiledDocPage[] = [
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
    body: "## Values\n\nProject values.\n",
    next: "/docs/start/language/variables/",
    headings: [{ depth: 2, id: "values", text: "Values" }],
  },
  {
    title: "Variables",
    description: "Declare values.",
    slug: "/docs/start/language/variables/",
    section: "learn",
    group: "Language guide",
    order: 10,
    kind: "guide",
    legacy: [],
    sourcePath: "write/variables.md",
    body: "## Declarations\n\nDeclare values.\n",
    previous: "/docs/start/overview/",
    next: "/docs/start/language/tasks/",
    headings: [{ depth: 2, id: "declarations", text: "Declarations" }],
  },
  tasksPage,
  {
    title: "Workflows",
    description: "Compose tasks into workflows.",
    slug: "/docs/start/language/workflows/",
    section: "learn",
    group: "Language guide",
    order: 50,
    kind: "guide",
    legacy: [],
    sourcePath: "write/workflows.md",
    body: "## Overview\n\nWorkflows chain tasks.\n",
    previous: "/docs/start/language/tasks/",
    headings: [{ depth: 2, id: "overview", text: "Overview" }],
  },
];

it("renders the structured reference landmarks", () => {
  render(<DocsPage page={tasksPage} pages={pages} />);
  expect(
    screen.getByRole("navigation", { name: "Documentation sections" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("navigation", { name: "Documentation pages" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("navigation", { name: "On this page" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 1, name: "Tasks" }),
  ).toBeInTheDocument();
});

it("renders the page title as the h1", () => {
  render(<DocsPage page={tasksPage} pages={pages} />);
  const h1s = screen.getAllByRole("heading", { level: 1 });
  expect(h1s).toHaveLength(1);
  expect(h1s[0]).toHaveTextContent("Tasks");
});

it("preserves canonical and legacy anchors on the shell title", () => {
  const page: CompiledDocPage = {
    ...tasksPage,
    headings: [
      { depth: 1, id: "tasks", text: "Tasks" },
      ...tasksPage.headings,
    ],
    headingAliases: { "legacy-tasks": "tasks" },
  };

  const { container } = render(<DocsPage page={page} pages={[page]} />);

  expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("id", "tasks");
  expect(container.querySelector("#legacy-tasks")).toBeInTheDocument();
});

it("marks the current page in the docs navigation", () => {
  render(<DocsPage page={tasksPage} pages={pages} />);
  const nav = screen.getByRole("navigation", { name: "Documentation pages" });
  const currentLink = nav.querySelector('[aria-current="page"]');
  expect(currentLink).toBeInTheDocument();
  expect(currentLink).toHaveTextContent("Tasks");
});

it("renders the canonical skip link targeting main content", () => {
  render(<DocsPage page={tasksPage} pages={pages} />);
  const skip = screen.getByRole("link", { name: /skip to main content/i });
  expect(skip).toHaveAttribute("href", "#main-content");
});

it("renders collapsed section, group, and page breadcrumbs", () => {
  render(<DocsPage page={tasksPage} pages={pages} />);

  const breadcrumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
  expect(
    Array.from(breadcrumbs.querySelectorAll("li"), (item) => item.textContent),
  ).toEqual(["Getting started", "Language guide", "Tasks"]);
  expect(within(breadcrumbs).getByRole("link", { name: "Getting started" })).toHaveAttribute(
    "href",
    "/docs/start/overview/",
  );
  expect(within(breadcrumbs).getByText("Tasks", {
    selector: '[aria-current="page"]',
  }))
    .toBeInTheDocument();

  render(<DocsPage page={pages[0]} pages={pages} />);
  const overviewBreadcrumbs = screen.getAllByRole("navigation", {
    name: "Breadcrumb",
  })[1];
  expect(
    Array.from(overviewBreadcrumbs.querySelectorAll("li"), (item) => item.textContent),
  ).toEqual(["Getting started", "Overview"]);
});

it("renders globally ordered previous and next page links", () => {
  render(<DocsPage page={tasksPage} pages={pages} />);

  const pagination = screen.getByRole("navigation", {
    name: "Documentation pagination",
  });
  expect(
    screen.getByRole("link", { name: "Previous Variables" }),
  ).toHaveAttribute("href", "/docs/start/language/variables/");
  expect(
    screen.getByRole("link", { name: "Next Workflows" }),
  ).toHaveAttribute("href", "/docs/start/language/workflows/");
  expect(pagination).toBeInTheDocument();
});
