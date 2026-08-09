import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import type * as OpenWdlUi from "@openwdl/ui";
import type {
  CompiledDocPage,
  StdlibFunction,
  StdlibIndexEntry,
} from "../../scripts/docs/types";
import { DocsPage } from "./DocsPage";
import { StdlibPage } from "./StdlibPage";

// The kit's `CodeBlock` highlights through a lazily imported shiki instance.
// These tests assert the disclosure, not the highlighting, and every `await`
// with a real one mounted lands its state update outside `act`.
vi.mock("@openwdl/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof OpenWdlUi>()),
  CodeBlock: ({ code }: { code: string }) => <pre>{code}</pre>,
}));

/**
 * Cross-page index stand-in. `select_first` lives on the Array page (the page
 * under test), `sub` and `size` live elsewhere, which is what the cross-page
 * results have to surface.
 */
vi.mock("../generated/docs.generated", () => ({
  DOC_PAGES: [],
  STDLIB_INDEX: [
    {
      name: "range",
      anchor: "range",
      version: null,
      signatures: ["Array[Int] range(Int)"],
      description: "Creates an array of the given length.",
      summary: "Creates an array of the given length.",
      params: [],
      returns: [],
      example: "",
      pageSlug: "/docs/stdlib/array/",
      pageTitle: "Array functions",
      group: "Array",
    },
    {
      name: "sub",
      anchor: "sub",
      version: null,
      signatures: ["String sub(String, String, String)"],
      description: "Replaces every substring matching a regular expression.",
      summary: "Replaces every substring matching a regular expression.",
      params: [],
      returns: [],
      example: "",
      pageSlug: "/docs/stdlib/string/",
      pageTitle: "String functions",
      group: "String",
    },
    {
      name: "size",
      anchor: "size",
      version: null,
      signatures: [
        "Float size(File|File?, [String])",
        "Float size(Directory|Directory?, [String])",
        "Float size(X|X?, [String])",
      ],
      description: "Determines the size of a file or directory.",
      summary: "Determines the size of a file or directory.",
      params: [],
      returns: [],
      example: "Float bytes = size(\"foo.txt\")",
      pageSlug: "/docs/stdlib/file/",
      pageTitle: "File functions",
      group: "File",
    },
  ] satisfies StdlibIndexEntry[],
}));

const range: StdlibFunction = {
  name: "range",
  anchor: "range",
  version: null,
  signatures: ["Array[Int] range(Int)"],
  description:
    "Creates an array of the given length containing sequential integers starting from 0. The length must be >= `0`.",
  summary: "Creates an array of the given length containing sequential integers starting from 0.",
  params: [{ type: "Int", text: "The length of array to create." }],
  returns: [{ type: null, text: "An `Array[Int]` containing integers `0..(N-1)`." }],
  example: "Array[Int] indexes = range(5)",
};

const contains: StdlibFunction = {
  name: "contains",
  anchor: "contains",
  version: "v1.2",
  signatures: ["Boolean contains(Array[P], P)", "Boolean contains(Array[P?], P?)"],
  description: "Tests whether the given array contains the given value.",
  summary: "Tests whether the given array contains the given value.",
  params: [{ type: null, text: "**`Array[P]`**: an array of any primitive type." }],
  returns: [{ type: null, text: "`true` when the value is present." }],
  example: "Boolean has_name = contains(samples, name)",
};

const selectFirst: StdlibFunction = {
  name: "select_first",
  anchor: "select_first",
  version: null,
  signatures: ["X select_first(Array[X?]+)"],
  description: "Selects the first non-`None` value from an array of optional values.",
  summary: "Selects the first non-`None` value from an array of optional values.",
  params: [{ type: "Array[X?]+", text: "Non-empty `Array` of optional values." }],
  returns: [{ type: null, text: "The first non-`None` value." }],
  example: "Int result = select_first([maybe_five])",
};

const arrayPage: CompiledDocPage = {
  title: "Array functions",
  description: "Standard library functions for array operations.",
  slug: "/docs/stdlib/array/",
  section: "stdlib",
  group: "Standard library",
  order: 50,
  kind: "reference",
  legacy: ["/docs/reference/stdlib/array/"],
  sourcePath: "reference/stdlib/array.md",
  body: "# Array Functions\n",
  headings: [
    { depth: 1, id: "array-functions", text: "Array Functions" },
    { depth: 2, id: "range", text: "range" },
    { depth: 2, id: "contains", text: "contains" },
    { depth: 2, id: "select_first", text: "select_first" },
  ],
  functions: [range, contains, selectFirst],
};

/** Every rendered function card, in document order. */
function cards(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll("article"));
}

const search = () => screen.getByLabelText("Filter functions");

// ── Cards ───────────────────────────────────────────────────────────────────

it("renders exactly one card per function", () => {
  const { container } = render(<StdlibPage page={arrayPage} />);
  expect(cards(container)).toHaveLength(3);
});

it("makes the signature the card headline", () => {
  render(<StdlibPage page={arrayPage} />);
  const headings = screen.getAllByRole("heading", { level: 2 });
  expect(headings[0]).toHaveTextContent("Array[Int] range(Int)");
});

it("stacks every signature of a multi-signature function in its headline", () => {
  render(<StdlibPage page={arrayPage} />);
  const heading = screen.getAllByRole("heading", { level: 2 })[1];
  expect(heading).toHaveTextContent("Boolean contains(Array[P], P)");
  expect(heading).toHaveTextContent("Boolean contains(Array[P?], P?)");
});

it("shows the availability badge on the function's own card", () => {
  const { container } = render(<StdlibPage page={arrayPage} />);
  const containsCard = container.querySelector("#contains");
  expect(containsCard).not.toBeNull();
  expect(within(containsCard as HTMLElement).getByText("v1.2")).toBeInTheDocument();
  // Unversioned functions stay silent rather than carrying a "1.0" badge.
  const rangeCard = container.querySelector("#range") as HTMLElement;
  expect(within(rangeCard).queryByTitle(/Added in WDL/)).toBeNull();
});

it("keeps the anchor ids matching the original heading ids", () => {
  const { container } = render(<StdlibPage page={arrayPage} />);
  for (const heading of arrayPage.headings.filter((h) => h.depth === 2)) {
    expect(container.querySelector(`#${heading.id}`)).not.toBeNull();
  }
});

it("renders parameters and returns as definition lists, not numbered lists", () => {
  const { container } = render(<StdlibPage page={arrayPage} />);
  const rangeCard = container.querySelector("#range") as HTMLElement;
  expect(rangeCard.querySelectorAll("ol")).toHaveLength(0);
  expect(within(rangeCard).getByText("Int")).toBeInTheDocument();
  expect(within(rangeCard).getByText("returns")).toBeInTheDocument();
});

it("renders inline code and strong runs from the parsed prose", () => {
  const { container } = render(<StdlibPage page={arrayPage} />);
  const containsCard = container.querySelector("#contains") as HTMLElement;
  expect(containsCard.querySelector("strong code")).toHaveTextContent("Array[P]");
  expect(containsCard.textContent).not.toContain("**");
});

// ── Example disclosure ──────────────────────────────────────────────────────

it("opens the example on the first card only", () => {
  const { container } = render(<StdlibPage page={arrayPage} />);
  const disclosures = Array.from(container.querySelectorAll("details"));
  expect(disclosures).toHaveLength(3);
  expect(disclosures.map((d) => d.open)).toEqual([true, false, false]);
});

it("draws the disclosure chevron rather than using a glyph", () => {
  const { container } = render(<StdlibPage page={arrayPage} />);
  const summary = container.querySelector("summary") as HTMLElement;
  expect(summary.querySelector("svg path")).not.toBeNull();
});

it("keeps a manually expanded example open while the filter re-renders", async () => {
  const user = userEvent.setup();
  const { container } = render(<StdlibPage page={arrayPage} />);
  const containsCard = container.querySelector("#contains") as HTMLElement;
  await user.click(within(containsCard).getByText("Example"));
  expect(containsCard.querySelector("details")?.open).toBe(true);

  await user.type(search(), "contains");
  expect(
    (container.querySelector("#contains") as HTMLElement).querySelector("details")?.open,
  ).toBe(true);
});

// ── Search ──────────────────────────────────────────────────────────────────

it("reports the function count before any filtering", () => {
  render(<StdlibPage page={arrayPage} />);
  expect(screen.getByRole("status")).toHaveTextContent("3 functions on this page");
});

it("narrows the visible cards as you type", async () => {
  const user = userEvent.setup();
  const { container } = render(<StdlibPage page={arrayPage} />);
  await user.type(search(), "select");
  expect(cards(container).map((card) => card.id)).toEqual(["select_first"]);
});

it("matches on signature text as well as name", async () => {
  const user = userEvent.setup();
  const { container } = render(<StdlibPage page={arrayPage} />);
  await user.type(search(), "Boolean");
  expect(cards(container).map((card) => card.id)).toEqual(["contains"]);
});

it("announces the live result count through a polite status region", async () => {
  const user = userEvent.setup();
  render(<StdlibPage page={arrayPage} />);
  const status = screen.getByRole("status");
  expect(status).toHaveAttribute("aria-live", "polite");
  await user.type(search(), "range");
  expect(status).toHaveTextContent("1 of 3 on this page");
});

it("hides the signature pills while a filter is active", async () => {
  const user = userEvent.setup();
  render(<StdlibPage page={arrayPage} />);
  expect(screen.getByRole("navigation", { name: "Functions on this page" })).toBeInTheDocument();
  await user.type(search(), "range");
  expect(
    screen.queryByRole("navigation", { name: "Functions on this page" }),
  ).not.toBeInTheDocument();
});

it("surfaces matches that live on another stdlib page as a separate group", async () => {
  const user = userEvent.setup();
  render(<StdlibPage page={arrayPage} />);
  await user.type(search(), "size");

  const group = screen.getByRole("region", { name: "On other standard library pages" });
  const link = within(group).getByRole("link");
  expect(link).toHaveAttribute("href", "/docs/stdlib/file/#size");
  expect(link).toHaveTextContent("size");
  expect(link).toHaveTextContent("Float size(File|File?, [String])");
  expect(link).toHaveTextContent("File functions");
});

it("never repeats the current page's own functions in the cross-page group", async () => {
  const user = userEvent.setup();
  render(<StdlibPage page={arrayPage} />);
  await user.type(search(), "range");
  expect(
    screen.queryByRole("region", { name: "On other standard library pages" }),
  ).not.toBeInTheDocument();
});

it("renders an empty state when nothing matches anywhere", async () => {
  const user = userEvent.setup();
  const { container } = render(<StdlibPage page={arrayPage} />);
  await user.type(search(), "nonexistent_function");
  expect(cards(container)).toHaveLength(0);
  expect(screen.getByText(/No function matches/)).toHaveTextContent("nonexistent_function");
  expect(screen.getByRole("status")).toHaveTextContent("0 of 3 on this page");
});

it("restores every card when the empty state's clear button is pressed", async () => {
  const user = userEvent.setup();
  const { container } = render(<StdlibPage page={arrayPage} />);
  await user.type(search(), "nonexistent_function");
  await user.click(screen.getByRole("button", { name: "Clear the filter" }));
  expect(cards(container)).toHaveLength(3);
});

// ── Degenerate data ─────────────────────────────────────────────────────────

it("falls back to a name-only headline for a function with no signature", () => {
  const enumPage: CompiledDocPage = {
    ...arrayPage,
    slug: "/docs/stdlib/enum/",
    title: "Enum functions",
    headings: [{ depth: 2, id: "value", text: "value" }],
    functions: [
      {
        name: "value",
        anchor: "value",
        version: null,
        signatures: [],
        description: "Returns the underlying value associated with an enum choice.",
        summary: "Returns the underlying value associated with an enum choice.",
        params: [{ type: "Enum", text: "an enum choice of any enum type." }],
        returns: [{ type: null, text: "The choice's associated value." }],
        example: "enum Color { Red = \"#FF0000\" }",
      },
    ],
  };
  render(<StdlibPage page={enumPage} />);
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("value");
});

it("omits the description paragraph and the disclosure when either is empty", () => {
  const sparse: CompiledDocPage = {
    ...arrayPage,
    functions: [{ ...range, description: "", summary: "", example: "" }],
  };
  const { container } = render(<StdlibPage page={sparse} />);
  expect(container.querySelectorAll("p")).toHaveLength(1); // the status region only
  expect(container.querySelector("details")).toBeNull();
});

// ── Routing from DocsPage ───────────────────────────────────────────────────

it("DocsPage renders stdlib pages as cards, keeping title and pagination", () => {
  const { container } = render(<DocsPage page={arrayPage} pages={[arrayPage]} />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Array functions");
  expect(screen.getByLabelText("Filter functions")).toBeInTheDocument();
  expect(container.querySelector("#contains")).not.toBeNull();
  expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
});

it("DocsPage still renders markdown for non-stdlib sections", () => {
  const learnPage: CompiledDocPage = {
    ...arrayPage,
    title: "Tasks",
    slug: "/docs/start/language/tasks/",
    section: "learn",
    group: "Language guide",
    body: "## Inputs\n\nSpecify inputs to a task.\n",
    headings: [{ depth: 2, id: "inputs", text: "Inputs" }],
    functions: undefined,
  };
  render(<DocsPage page={learnPage} pages={[learnPage]} />);
  expect(screen.getByText("Specify inputs to a task.")).toBeInTheDocument();
  expect(screen.queryByLabelText("Filter functions")).not.toBeInTheDocument();
});

// ── Prerendering ────────────────────────────────────────────────────────────

it("renders to static markup with every anchor, so prerendered deep links land", () => {
  const html = renderToString(<StdlibPage page={arrayPage} />);
  expect(html).toContain('id="range"');
  expect(html).toContain('id="contains"');
  expect(html).toContain('id="select_first"');
  expect(html).toContain("Array[Int]");
});
