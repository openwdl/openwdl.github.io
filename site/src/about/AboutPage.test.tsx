import { render, screen, within } from "@testing-library/react";
import { AboutPage } from "./AboutPage";

it("offers keyboard users a direct route to the main content", () => {
  render(<AboutPage />);

  expect(screen.getByRole("link", { name: "Skip to main content" }))
    .toHaveAttribute("href", "#main-content");
  expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  expect(screen.getByRole("main")).toHaveAttribute("data-page", "home");
  expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
});

it("explains the problem, WDL approach, history, and present", () => {
  render(<AboutPage />);

  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", {
    level: 1,
    name: "A human-readable description language for running workflows anywhere.",
  })).toBeInTheDocument();
  expect(screen.getByRole("heading", {
    level: 2,
    name: "In science, an analysis often outgrows the scripts that started it.",
  })).toBeInTheDocument();
  expect(screen.getByRole("heading", {
    level: 2,
    name: "Four principles guide WDL.",
  })).toBeInTheDocument();
  expect(screen.getByRole("heading", {
    level: 2,
    name: "From an internal tool to an open standard.",
  })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: "WDL today" }))
    .toBeInTheDocument();
});


it("diagnoses the four ways an analysis outgrows its scripts", () => {
  render(<AboutPage />);

  const heading = screen.getByRole("heading", {
    level: 2,
    name: "In science, an analysis often outgrows the scripts that started it.",
  });
  const section = heading.closest("section");

  expect(section).not.toBeNull();
  if (!section) {
    throw new Error("Workflow problem heading must be inside a section");
  }
  expect(section).toHaveTextContent(
    "Scripts are a natural place to begin. As an analysis grows, its dependencies, data flow, parallel work, and resource needs become harder to see, while the details needed to run it spread across scripts, inputs, and platform configuration.",
  );

  const articles = within(section).getAllByRole("article");
  expect(articles).toHaveLength(4);
  expect(within(articles[0]).getByRole("heading", {
    level: 3,
    name: "Hard to understand",
  })).toBeInTheDocument();
  expect(articles[0]).toHaveTextContent(
    "Dependencies and data flow are implied by command order, filenames, and local conventions.",
  );
  expect(within(articles[1]).getByRole("heading", {
    level: 3,
    name: "Hard to hand off",
  })).toBeInTheDocument();
  expect(articles[1]).toHaveTextContent(
    "The next person needs assumptions and context that the scripts do not carry with them.",
  );
  expect(within(articles[2]).getByRole("heading", {
    level: 3,
    name: "Hard to scale",
  })).toBeInTheDocument();
  expect(articles[2]).toHaveTextContent(
    "More inputs require custom loops, batching, and bookkeeping around each step.",
  );
  expect(within(articles[3]).getByRole("heading", {
    level: 3,
    name: "Hard to move",
  })).toBeInTheDocument();
  expect(articles[3]).toHaveTextContent(
    "Paths, queues, and installed software tie the analysis to one environment.",
  );

  const illustrations = articles.map((article) =>
    article.querySelector("svg[data-problem-illustration]"),
  );
  expect(illustrations.map((illustration) =>
    illustration?.getAttribute("data-problem-illustration"),
  )).toEqual(["understand", "hand-off", "scale", "move"]);
  for (const illustration of illustrations) {
    expect(illustration).toHaveAttribute("aria-hidden", "true");
    expect(illustration).toHaveAttribute("focusable", "false");
    expect(illustration).toHaveAttribute("viewBox", "0 0 64 44");
    expect(illustration?.querySelector("[stroke-dasharray]")).not.toBeNull();
  }
  expect(illustrations[2]?.querySelector("[data-scale-branches]"))
    .toHaveAttribute(
      "d",
      "M17 22h8M25 5v33M25 5h14M25 16h14M25 27h14M25 38h14",
    );
  const transferArrows = [illustrations[1], illustrations[3]].map(
    (illustration) => illustration?.querySelector("[data-transfer-arrow]"),
  );
  for (const arrow of transferArrows) {
    expect(arrow).toHaveAttribute(
      "d",
      "M29 22h6m-2.5-2.5L35 22l-2.5 2.5",
    );
    expect(arrow).not.toHaveAttribute("stroke-dasharray");
  }
});

it("presents the four WDL principles as equal pillars", () => {
  render(<AboutPage />);

  const heading = screen.getByRole("heading", {
    level: 2,
    name: "Four principles guide WDL.",
  });
  const section = heading.closest("section");
  expect(section).not.toBeNull();
  if (!section) {
    throw new Error("WDL principles heading must be inside a section");
  }

  expect(section).toHaveTextContent(
    "WDL is designed for the people who author analyses, the systems that execute them, and the community that evolves the standard. It describes workflow structure clearly, provides abstractions for common execution patterns, and leaves concrete run values and platform configuration to other tools.",
  );

  const articles = within(section).getAllByRole("article");
  expect(articles).toHaveLength(4);
  expect(articles.every((article) => !article.hasAttribute("data-principle")))
    .toBe(true);
  expect(articles[0]).toHaveTextContent(
    "Human-readable and writableA concise, declarative grammar helps software engineers, domain experts, and platform operators reason from the same workflow description.",
  );
  expect(articles[1]).toHaveTextContent(
    "Powerful abstractionsTyped inputs and outputs, explicit data dependencies, conditionals, scatter-gather, runtime requirements, containers, and imports express common workflow patterns directly.",
  );
  expect(articles[2]).toHaveTextContent(
    "PortabilityA task or workflow that conforms to the WDL specification can run on any platform supported by its execution engine. Editor integrations and portability lints help authors avoid environment-specific assumptions.",
  );
  expect(articles[3]).toHaveTextContent(
    "Open standardA public specification and open governance process let users and implementers inspect, discuss, and contribute to how the language evolves.",
  );
  expect(section).not.toHaveTextContent("The separation is the point.");
  expect(section).not.toHaveTextContent("Choose where it runs");
});

it("presents WDL source as the homepage product object", () => {
  const { container } = render(<AboutPage />);

  const primaryAction = screen.getByRole("link", {
    name: "Read the language guide",
  });
  const secondaryAction = screen.getByRole("link", {
    name: "View the specification",
  });
  expect(primaryAction).toHaveAttribute("href", "/docs/start/overview/");
  expect(primaryAction.className).toContain("Button_primary");
  expect(secondaryAction).toHaveAttribute(
    "href",
    "https://github.com/openwdl/wdl/blob/wdl-1.3/SPEC.md",
  );
  expect(secondaryAction.className).toContain("Button_secondary");

  expect(screen.getByText(
    "WDL is an openly governed language for describing tasks, inputs, dependencies, and runtime requirements. Different execution engines can interpret the same description on laptops, clusters, and cloud platforms.",
  )).toBeInTheDocument();

  expect(screen.getByText("Workflow Description Language", { exact: true })).toBeInTheDocument();

  expect(screen.getByText("Execution structure")).toBeInTheDocument();

  const source = screen.getByRole("region", { name: "Example WDL workflow" });
  expect(within(source).getByLabelText("WDL source code"))
    .toHaveAttribute("tabindex", "0");
  expect(within(source).getByText("workflow.wdl")).toBeInTheDocument();
  expect(source).toHaveTextContent("workflow example");
  expect(source).toHaveTextContent("Array[File] inputs");
  expect(source).toHaveTextContent("scatter (file in inputs)");
  expect(source).toHaveTextContent("call process");
  expect(source.querySelector("code")?.textContent).toContain(
    "call process { file }",
  );
  expect(source.querySelector("code")?.textContent).not.toContain(
    "call process {\n",
  );
  expect(source).toHaveTextContent("Array[File] results = process.result");
  expect(source.querySelector("code")?.textContent).toContain(
    "input {\n    Array[File] inputs\n  }",
  );
  expect(source.querySelector("code")?.textContent).toContain(
    "output {\n    Array[File] results = process.result\n  }",
  );
  expect(source.querySelector("code")?.textContent).toContain(
    "Array[File] inputs\n  }\n\n  scatter",
  );
  expect(source.querySelector("code")?.textContent).toContain(
    "call process { file }\n  }\n\n  output",
  );
  expect(source).not.toHaveTextContent("version");
  expect(source).not.toHaveTextContent("import");
  expect(source).not.toHaveTextContent("steps.process");
  expect(source).not.toHaveTextContent("input:");
  expect(source).not.toHaveTextContent("task process");
  expect(within(source).getByText("in", { exact: true }).className)
    .toContain("keyword");
  const sourceLines = source.querySelector("code")?.textContent?.trim().split("\n");
  expect(sourceLines).toHaveLength(13);
  const lineNumbers = source.querySelector("pre > span[aria-hidden='true']");
  expect(lineNumbers?.textContent?.trim().split("\n")).toEqual(
    Array.from({ length: 13 }, (_, index) => String(index + 1)),
  );

  const targets = screen.getByLabelText("Execution targets");
  expect(within(targets).getByText("Local")).toBeInTheDocument();
  expect(within(targets).getByText("HPC")).toBeInTheDocument();
  expect(within(targets).getByText("Cloud")).toBeInTheDocument();
  expect(screen.queryByLabelText("WDL characteristics")).not.toBeInTheDocument();

  const graph = container.querySelector('svg[aria-hidden="true"][focusable="false"]');
  expect(graph).toHaveAttribute("viewBox", "0 0 360 180");
  expect(graph).toHaveTextContent("inputs");
  expect(graph).toHaveTextContent("scatter");
  expect(graph).toHaveTextContent("process");
  expect(graph).toHaveTextContent("gather");
  expect(graph).toHaveTextContent("results");
  const graphLabels = Array.from(graph?.querySelectorAll("text") ?? []);
  for (const label of ["scatter", "gather"]) {
    expect(graphLabels.find((node) => node.textContent === label))
      .toHaveAttribute("y", "10");
  }
  const processNodes = container.querySelectorAll("[data-process-node]");
  expect(processNodes).toHaveLength(3);
  for (const node of processNodes) {
    expect(node.getAttribute("transform")).toMatch(/^translate\(133 /);
    expect(node.querySelector("rect")).toHaveAttribute("width", "94");
    expect(node.querySelector("text")).toHaveAttribute("x", "9");
  }
  const scatterEdges = Array.from(
    container.querySelectorAll("[data-scatter-edge]"),
    (edge) => edge.getAttribute("d"),
  );
  const gatherEdges = Array.from(
    container.querySelectorAll("[data-gather-edge]"),
    (edge) => edge.getAttribute("d"),
  );
  expect(scatterEdges).toEqual([
    "M73 90 C103 90 103 30 133 30",
    "M73 90 H133",
    "M73 90 C103 90 103 150 133 150",
  ]);
  expect(gatherEdges).toEqual([
    "M227 30 C257 30 257 90 287 90",
    "M227 90 H287",
    "M227 150 C257 150 257 90 287 90",
  ]);
});

it("uses sourced milestones and base-aware next steps", () => {
  render(<AboutPage />);

  const timeline = screen.getByLabelText("WDL history");
  const milestones = [
    ["2012", "Early workflow-description tooling work begins at the Broad Institute."],
    ["2015", "Cromwell and evolving WDL drafts establish the task-and-workflow model."],
    ["2017", "OpenWDL forms to steward WDL as an open, community-governed standard."],
    ["2018", "WDL 1.0 becomes the official specification."],
    ["2021", "WDL 1.1 adds standard runtime attributes, JSON I/O, and struct literals."],
    ["2024", "WDL 1.2 adds directories, multi-line strings, requirements, and hints."],
    ["2026", "WDL 1.3 adds enums, else-if branches, and dynamic retry resources."],
  ];
  for (const [year, description] of milestones) {
    expect(within(timeline).getByText(year)).toBeInTheDocument();
    expect(within(timeline).getByText(description)).toBeInTheDocument();
  }
  const today = screen.getByRole("heading", { level: 2, name: "WDL today" })
    .closest("section");
  expect(today).not.toBeNull();
  expect(within(today as HTMLElement).getAllByRole("link").map(
    (link) => link.textContent,
  )).toEqual([
    "WDL 1.3.0",
    "Start learning WDL",
    "Explore the WDL ecosystem",
  ]);
  expect(within(today as HTMLElement).getByRole("link", {
    name: "Explore the WDL ecosystem",
  }).className).toContain("Button_secondary");
  const startLearning = within(today as HTMLElement).getByRole("link", {
    name: "Start learning WDL",
  });
  expect(startLearning).toHaveAttribute("href", "/docs/start/your-first-workflow/");
  expect(startLearning.className).toContain("Button_primary");
  // The community page is unlinked from the site, so About no longer offers it.
  expect(within(today as HTMLElement).queryByRole("link", { name: "Meet the community" }))
    .toBeNull();
  // Each resource link carries a decorative glyph hidden from assistive tech by
  // the kit Button's aria-hidden icon wrapper.
  for (const name of ["Start learning WDL", "Explore the WDL ecosystem"]) {
    const icon = within(today as HTMLElement)
      .getByRole("link", { name })
      .querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon!.closest("[aria-hidden='true']")).not.toBeNull();
  }
  expect(screen.queryByRole("region", { name: "Next steps" })).not.toBeInTheDocument();
});

it("uses canonical chrome without a redundant About link", () => {
  render(<AboutPage />);

  expect(screen.queryByRole("link", { name: "About" })).not.toBeInTheDocument();
  expect(screen.getAllByRole("navigation")).toHaveLength(2);
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
});

it("renders h1 introduction before the Example WDL workflow source region", () => {
  render(<AboutPage />);
  const h1 = screen.getByRole("heading", { level: 1 });
  const source = screen.getByRole("region", { name: "Example WDL workflow" });
  // DOCUMENT_POSITION_FOLLOWING (4): source node follows h1 in document order
  expect(h1.compareDocumentPosition(source) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("renders the hero title as two intentional lines", () => {
  render(<AboutPage />);
  const h1 = screen.getByRole("heading", { level: 1 });

  expect(h1.children).toHaveLength(2);
  expect(h1.children[0]).toHaveTextContent(
    "A human-readable description language",
  );
  expect(h1.children[1]).toHaveTextContent(
    "for running workflows anywhere.",
  );
});
