import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MiniSearch from "minisearch";
import { docHref } from "./docHref";
import { DocsSearch } from "./DocsSearch";

const VALID_MANIFEST = JSON.stringify({ sections: {}, gzipBytes: 0 });

beforeEach(() => {
  vi.spyOn(global, "fetch").mockResolvedValue(
    new Response(VALID_MANIFEST, {
      headers: { "Content-Type": "application/json" },
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockSingleSearchResult(): void {
  const index = new MiniSearch({
    fields: ["title", "description", "text"],
    storeFields: ["title", "description", "text", "section", "url"],
  });
  index.add({
    id: "/docs/start/language/tasks/",
    title: "Tasks",
    description: "Define a portable unit of computation.",
    text: "A task defines a reusable unit of work.",
    section: "learn",
    url: "/docs/start/language/tasks/",
  });
  const manifest = JSON.stringify({
    sections: { learn: { filename: "section-learn.json", documentCount: 1 } },
    gzipBytes: 1024,
  });
  vi.mocked(global.fetch).mockImplementation(async (input) =>
    String(input).endsWith("manifest.json")
      ? new Response(manifest, { headers: { "Content-Type": "application/json" } })
      : new Response(JSON.stringify(index)),
  );
}

it("renders a search trigger button", () => {
  const { container } = render(<DocsSearch />);
  const trigger = screen.getByRole("button", { name: /search docs/i });
  expect(trigger).toHaveTextContent("Search documentation…");
  expect(container.querySelector("button > svg")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

it("does not fetch manifest before user interaction", () => {
  render(<DocsSearch />);
  expect(global.fetch).not.toHaveBeenCalled();
});

it("opens combobox on trigger click", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));
  expect(screen.getByRole("combobox")).toBeInTheDocument();
});

it("opens combobox on Cmd+K", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.keyboard("{Meta>}k{/Meta}");
  expect(screen.getByRole("combobox")).toBeInTheDocument();
});

it("opens combobox on Ctrl+K", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.keyboard("{Control>}k{/Control}");
  expect(screen.getByRole("combobox")).toBeInTheDocument();
});

it("closes on Escape and restores focus to trigger", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  const trigger = screen.getByRole("button", { name: /search docs/i });
  await user.click(trigger);
  expect(screen.getByRole("combobox")).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

it("closes on Escape when focus is outside the search dialog", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  const trigger = screen.getByRole("button", { name: /search docs/i });
  await user.click(trigger);

  trigger.focus();
  await user.keyboard("{Escape}");

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("shows a listbox for search results when open", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));
  expect(screen.getByRole("listbox")).toBeInTheDocument();
});

it("shows a useful prompt before the user starts typing", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));

  expect(screen.getByText("Type anything to search")).toBeInTheDocument();
  expect(screen.getByText("tasks")).toBeInTheDocument();
  expect(screen.getByText("scatter")).toBeInTheDocument();
  expect(screen.getByText("read_json")).toBeInTheDocument();

  await user.type(screen.getByRole("combobox"), "workflow");
  expect(screen.queryByText("Type anything to search")).not.toBeInTheDocument();
});

it("runs an example search when its suggestion is clicked", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));

  await user.click(screen.getByRole("button", { name: "scatter" }));

  expect(screen.getByRole("combobox")).toHaveValue("scatter");
  expect(screen.queryByText("Type anything to search")).not.toBeInTheDocument();
});

it("shows and highlights the matching context for each result", async () => {
  const index = new MiniSearch({
    fields: ["title", "description", "text"],
    storeFields: ["title", "description", "text", "section", "url"],
  });
  index.add({
    id: "/docs/start/language/tasks/",
    title: "Tasks",
    description: "Define a portable unit of computation.",
    text: "A task defines a reusable unit of work with typed inputs and outputs.",
    section: "learn",
    url: "/docs/start/language/tasks/",
  });

  const manifest = JSON.stringify({
    sections: { learn: { filename: "section-learn.json", documentCount: 1 } },
    gzipBytes: 1024,
  });
  vi.mocked(global.fetch).mockImplementation(async (input) => {
    const url = String(input);
    return url.endsWith("manifest.json")
      ? new Response(manifest, { headers: { "Content-Type": "application/json" } })
      : new Response(JSON.stringify(index));
  });

  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));
  await user.type(screen.getByRole("combobox"), "reusable");

  const result = await screen.findByRole("option");
  expect(result).toHaveTextContent(
    "A task defines a reusable unit of work with typed inputs and outputs.",
  );
  expect(result.querySelector("mark")).toHaveTextContent("reusable");
});

it("closes after selecting a result and restores the same search when reopened", async () => {
  mockSingleSearchResult();

  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));
  await user.type(screen.getByRole("combobox"), "reusable");

  const resultLink = await screen.findByRole("link", { name: /Tasks/ });
  resultLink.addEventListener("click", (event) => event.preventDefault());
  await user.click(resultLink);

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /search docs/i }));
  expect(screen.getByRole("combobox")).toHaveValue("reusable");
  expect(screen.getByRole("option")).toHaveTextContent("reusable");
});

it("keeps search open when a result is opened in a new tab", async () => {
  mockSingleSearchResult();
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));
  await user.type(screen.getByRole("combobox"), "reusable");

  const resultLink = await screen.findByRole("link", { name: /Tasks/ });
  resultLink.addEventListener("click", (event) => event.preventDefault());
  fireEvent.click(resultLink, { metaKey: true });

  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

// ── Issue 7: manifest fetch on every opening path ────────────────────────────

it("starts manifest fetch on trigger click", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("manifest.json"));
});

it("starts manifest fetch on Cmd+K", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.keyboard("{Meta>}k{/Meta}");
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("manifest.json"));
});

it("starts manifest fetch on Ctrl+K", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.keyboard("{Control>}k{/Control}");
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("manifest.json"));
});

// ── Issue 1: stale-result race prevention ────────────────────────────────────

it("does not surface an error from a superseded (stale) query", async () => {
  let resolveManifest!: (res: Response) => void;
  const delayedManifest = new Promise<Response>((resolve) => {
    resolveManifest = resolve;
  });
  vi.mocked(global.fetch).mockReturnValue(delayedManifest);

  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));

  const input = screen.getByRole("combobox");
  // Type "a" — gen=1; manifest fetch starts but is held pending.
  await user.type(input, "a");
  // Clear input — gen=2; invalidates the in-flight "a" query.
  await user.clear(input);

  // Reject the held manifest fetch to simulate a network error.
  resolveManifest(new Response("Error", { status: 503 }));
  await new Promise((r) => setTimeout(r, 0));
  await new Promise((r) => setTimeout(r, 0));

  // Stale "a" query error must NOT appear now that the input is empty.
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

// ── Issue 2: error surfacing and retry ───────────────────────────────────────

it("shows an accessible error when the manifest fetch fails", async () => {
  vi.mocked(global.fetch).mockResolvedValue(new Response("Error", { status: 500 }));

  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));

  await user.type(screen.getByRole("combobox"), "wdl");

  await screen.findByRole("alert");
  expect(screen.getByRole("alert")).toBeInTheDocument();
});

it("shows an accessible error when a chunk fetch fails", async () => {
  const chunkManifest = JSON.stringify({
    sections: { write: { filename: "section-write.json", documentCount: 3 } },
    gzipBytes: 1024,
  });
  vi.mocked(global.fetch)
    .mockResolvedValueOnce(
      new Response(chunkManifest, { headers: { "Content-Type": "application/json" } }),
    )
    .mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));

  await user.type(screen.getByRole("combobox"), "task");

  await screen.findByRole("alert");
  expect(screen.getByRole("alert")).toBeInTheDocument();
});

it("allows retry after a transient manifest failure", async () => {
  vi.mocked(global.fetch)
    .mockResolvedValueOnce(new Response("Error", { status: 503 })) // prefetch on click
    .mockResolvedValueOnce(new Response("Error", { status: 503 })) // first type
    .mockResolvedValue(
      new Response(VALID_MANIFEST, { headers: { "Content-Type": "application/json" } }),
    );

  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));

  const input = screen.getByRole("combobox");
  await user.type(input, "a");
  await screen.findByRole("alert");

  // Clear error by typing a new query — setError(null) fires at the top of handleChange.
  await user.clear(input);
  await user.type(input, "b");

  await waitFor(() => {
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// ── Issue 8: Tab/Shift+Tab focus containment within the modal dialog ─────────

it("traps Tab focus within the dialog", async () => {
  const user = userEvent.setup();
  render(<DocsSearch />);
  await user.click(screen.getByRole("button", { name: /search docs/i }));

  const input = screen.getByRole("combobox");
  const closeBtn = screen.getByRole("button", { name: /close search/i });

  // Input is focused on open.
  expect(input).toHaveFocus();

  // Tab moves focus to the close button.
  await user.keyboard("{Tab}");
  expect(closeBtn).toHaveFocus();

  // Suggestions remain keyboard-reachable.
  await user.keyboard("{Tab}");
  expect(screen.getByRole("button", { name: "tasks" })).toHaveFocus();
  await user.keyboard("{Tab}{Tab}");
  expect(screen.getByRole("button", { name: "read_json" })).toHaveFocus();

  // Tab from the final suggestion wraps back to the input.
  await user.keyboard("{Tab}");
  expect(input).toHaveFocus();

  // Shift+Tab from the first element wraps to the last.
  await user.keyboard("{Shift>}{Tab}{/Shift}");
  expect(screen.getByRole("button", { name: "read_json" })).toHaveFocus();
});

// ── Fix 3: manifest prefetch on trigger button focus ─────────────────────────

it("starts manifest prefetch on trigger focus without opening the dialog", () => {
  render(<DocsSearch />);
  const trigger = screen.getByRole("button", { name: /search docs/i });
  fireEvent.focus(trigger);
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("manifest.json"));
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
});

// ── Fix 2: docHref resolves paths relative to BASE_URL ───────────────────────

describe("docHref", () => {
  it("prepends /brand/ base to a root-relative path", () => {
    expect(docHref("/docs/start/language/tasks/", "/brand/")).toBe("/brand/docs/start/language/tasks/");
  });

  it("returns path unchanged when base is /", () => {
    expect(docHref("/docs/start/language/tasks/", "/")).toBe("/docs/start/language/tasks/");
  });
});
