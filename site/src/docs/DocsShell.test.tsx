import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CompiledDocPage } from "../../scripts/docs/types";
import { DocsShell } from "./DocsShell";

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
  body: "## Inputs\n\nContent.\n",
  headings: [{ depth: 2, id: "inputs", text: "Inputs" }],
};

const pages: CompiledDocPage[] = [tasksPage];

const sectionPages: CompiledDocPage[] = [
  {
    ...tasksPage,
    title: "Overview",
    slug: "/docs/start/overview/",
    section: "learn",
    group: "Overview",
  },
  tasksPage,
  {
    ...tasksPage,
    title: "Ecosystem",
    slug: "/docs/start/ecosystem/",
    section: "learn",
    group: "Overview",
  },
  {
    ...tasksPage,
    title: "Upgrade guide",
    slug: "/docs/reference/upgrade-guide/",
    section: "reference",
    group: "Guides",
  },
];

it("renders the Documentation sections navigation", () => {
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );
  expect(
    screen.getByRole("navigation", { name: "Documentation sections" }),
  ).toBeInTheDocument();
});

it("places the documentation site on its own page surface", () => {
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );

  const sections = screen.getByRole("navigation", {
    name: "Documentation sections",
  });
  expect(sections.parentElement?.className).toContain("page");
  expect(within(sections.parentElement as HTMLElement).getByRole("main"))
    .toHaveAttribute("id", "main-content");
});

it("places the search control in the section navigation", () => {
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );

  const sections = screen.getByRole("navigation", {
    name: "Documentation sections",
  });
  expect(
    within(sections).getByRole("button", { name: "Search docs" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("OpenWDL Docs")).not.toBeInTheDocument();
});

it("links Getting Started and Reference without separate Learn WDL or Run sections", () => {
  render(
    <DocsShell page={tasksPage} pages={sectionPages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );

  const sections = screen.getByRole("navigation", {
    name: "Documentation sections",
  });
  expect(
    within(sections).getByRole("link", { name: "Getting started" }),
  ).toHaveAttribute(
    "href",
    "/docs/start/overview/",
  );
  expect(
    within(sections).getByRole("link", { name: "Reference" }),
  ).toHaveAttribute("href", "/docs/reference/upgrade-guide/");
  expect(within(sections).queryByRole("link", { name: "Learn" })).toBeNull();
  expect(within(sections).queryByRole("link", { name: "Run" })).toBeNull();
  expect(within(sections).queryByRole("link", { name: "Learn WDL" })).toBeNull();
  expect(within(sections).queryByRole("link", { name: "Patterns" })).toBeNull();
  expect(within(sections).queryByRole("link", { name: "Ecosystem" })).toBeNull();
});

it("renders the Documentation pages navigation", () => {
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );
  expect(
    screen.getByRole("navigation", { name: "Documentation pages" }),
  ).toBeInTheDocument();
});

it("renders the On this page navigation", () => {
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );
  expect(
    screen.getByRole("navigation", { name: "On this page" }),
  ).toBeInTheDocument();
});

it("renders a skip link to main content", () => {
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );
  expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute(
    "href",
    "#main-content",
  );
});

it("renders mobile disclosure buttons for docs menu and on this page", () => {
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );
  expect(
    screen.getByRole("button", { name: /docs menu/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /on this page/i }),
  ).toBeInTheDocument();
});

it("places mobile controls before both collapsible panels and the article", () => {
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );

  const controls = screen.getByRole("button", { name: /docs menu/i })
    .parentElement?.parentElement;
  const nav = screen.getByRole("navigation", { name: "Documentation pages" });
  const toc = screen.getByRole("navigation", { name: "On this page" });
  const main = screen.getByRole("main");

  expect(controls?.compareDocumentPosition(nav)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  expect(nav.compareDocumentPosition(toc)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(toc.compareDocumentPosition(main)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

it("clicking Docs menu updates aria-expanded and nav data-open", async () => {
  const user = userEvent.setup();
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );
  const button = screen.getByRole("button", { name: /docs menu/i });
  expect(button).toHaveAttribute("aria-expanded", "false");

  await user.click(button);

  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(
    screen.getByRole("navigation", { name: "Documentation pages" }),
  ).toHaveAttribute("data-open", "true");
});

it("clicking On this page updates aria-expanded and toc data-open", async () => {
  const user = userEvent.setup();
  render(
    <DocsShell page={tasksPage} pages={pages}>
      <h1>Tasks</h1>
    </DocsShell>,
  );
  const button = screen.getByRole("button", { name: /on this page/i });
  expect(button).toHaveAttribute("aria-expanded", "false");

  await user.click(button);

  expect(button).toHaveAttribute("aria-expanded", "true");
  expect(
    screen.getByRole("navigation", { name: "On this page" }),
  ).toHaveAttribute("data-open", "true");
});
