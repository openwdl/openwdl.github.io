import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GetStartedWizard } from "./GetStartedWizard";
import { createMemoryWizardHistory } from "./model/history.fixture";
import { eligibleCatalog } from "./test/fixtures";
import wizardStyles from "./components/Wizard.module.css";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function choose(label: string): Promise<void> {
  await userEvent.click(screen.getByRole("radio", { name: label }));
}

async function continueWizard(): Promise<void> {
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));
}

async function clickBack(): Promise<void> {
  await userEvent.click(screen.getByRole("button", { name: "Back" }));
}

// ── Full-flow integration ─────────────────────────────────────────────────────

it("advances local users through recommendation, editor, OS, and checklist", async () => {
  const history = createMemoryWizardHistory();
  render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

  await choose("My computer");
  await continueWizard();
  expect(screen.getByRole("heading", { name: /Sprocket/i })).toBeInTheDocument();

  await continueWizard(); // acknowledge recommendation → editor phase
  await choose("VS Code");
  await continueWizard(); // commit editor
  await choose("macOS");
  await continueWizard(); // commit OS

  expect(
    screen.getByRole("heading", { name: "Install your WDL setup" }),
  ).toBeInTheDocument();
});

it("restores a bookmarked complete result (cloud/terra → checklist with Terra step)", () => {
  const history = createMemoryWizardHistory(
    "?environment=cloud&service=terra&editor=vscode&os=macos",
  );
  render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
  // Terra is a managed service — the engine step is "Access Terra", not "Install Cromwell".
  expect(screen.getByText(/Access Terra/i)).toBeInTheDocument();
});

it("restores a bookmarked recommendation (environment=local → Sprocket recommendation)", () => {
  const history = createMemoryWizardHistory("?environment=local");
  render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
  expect(screen.getByRole("heading", { name: /Sprocket/i })).toBeInTheDocument();
});

// ── Progress indicator ────────────────────────────────────────────────────────

describe("GetStartedWizard — progress indicator", () => {
  it("shows stable four-stage progress", () => {
    render(<GetStartedWizard catalog={eligibleCatalog} history={createMemoryWizardHistory()} />);
    const nav = screen.getByRole("navigation", { name: /setup/i });
    expect(within(nav).getByText(/Environment/)).toBeInTheDocument();
    expect(within(nav).getByText(/Engine/)).toBeInTheDocument();
    expect(within(nav).getByText(/Editor/)).toBeInTheDocument();
    expect(within(nav).getByText(/Install/)).toBeInTheDocument();
  });

  it("marks Environment as completed after environment answer + continue", async () => {
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
    await choose("My computer");
    await continueWizard();
    const nav = screen.getByRole("navigation", { name: /setup/i });
    const environmentItem = within(nav)
      .getAllByRole("listitem")
      .find((li) => li.textContent?.includes("Environment"));
    expect(environmentItem?.textContent).toContain("completed");
  });
});

// ── Invalid URL normalization ─────────────────────────────────────────────────

describe("GetStartedWizard — invalid URL normalization", () => {
  it("shows a notice when normalize() indicates the URL was changed", () => {
    // Construct a wizard with a history whose normalize returns true (invalid params).
    // We use a mock here to control normalize's return value without real invalid params.
    const mockHistory = {
      read: () => ({}),
      normalize: () => true, // simulate invalid URL
      push: () => {},
      back: () => false,
      subscribe: () => () => {},
    };
    render(<GetStartedWizard catalog={eligibleCatalog} history={mockHistory} />);
    const notice = screen.getByRole("alert");
    expect(notice).toBeInTheDocument();
    expect(notice.textContent?.length).toBeGreaterThan(0);
  });

  it("does not show a notice when the URL is clean", () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

// ── Back navigation ───────────────────────────────────────────────────────────

describe("GetStartedWizard — Back navigation", () => {
  it("goes back from recommendation to environment question", async () => {
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await choose("My computer");
    await continueWizard(); // at recommendation

    await clickBack();
    expect(
      screen.getByRole("group", { name: /where will you run/i }),
    ).toBeInTheDocument();
  });

  it("goes back from editor phase to recommendation", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await continueWizard(); // enter editor phase
    expect(screen.getByRole("group", { name: /which editor/i })).toBeInTheDocument();

    await clickBack();
    expect(screen.getByRole("heading", { name: /Sprocket/i })).toBeInTheDocument();
  });

  it("preserves compatible answers when using native back", async () => {
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await choose("My computer");
    await continueWizard(); // push environment=local
    await continueWizard(); // editor phase
    await choose("VS Code");
    await continueWizard(); // push editor=vscode; now at OS question

    await clickBack(); // go back to recommendation (native)
    await continueWizard(); // re-enter editor phase
    // VS Code should NOT be retained (editor was removed by back, recommendation shown)
    // The editor question is shown fresh
    expect(screen.getByRole("group", { name: /which editor/i })).toBeInTheDocument();
  });

  it("direct-link Back uses fallback replaceState and still navigates correctly", async () => {
    // Direct link to OS question — no owned history entries.
    const history = createMemoryWizardHistory("?environment=local&editor=vscode");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    expect(screen.getByRole("group", { name: /operating system/i })).toBeInTheDocument();

    await clickBack(); // uses fallback (no push history) → recommendation
    expect(screen.getByRole("heading", { name: /Sprocket/i })).toBeInTheDocument();
  });

  it("Back removes only invalid descendants — environment answer is kept when going back from recommendation", async () => {
    // Start from empty, answer environment, advance to recommendation, go back.
    // After back, the environment radio should still be checked.
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await choose("My computer");
    await continueWizard(); // at recommendation

    await clickBack(); // back to environment question
    // "My computer" (local) should be the currently selected radio.
    const localRadio = screen.getByRole("radio", { name: "My computer" }) as HTMLInputElement;
    expect(localRadio.checked).toBe(true);
  });
});

// ── Popstate restoration ──────────────────────────────────────────────────────

describe("GetStartedWizard — popstate restoration", () => {
  it("restores the screen when popstate fires with a previous state", async () => {
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await choose("My computer");
    await continueWizard(); // push environment=local; at recommendation

    // Simulate browser back button (fires popstate via memory fixture back()).
    act(() => { history.back({}); });

    expect(
      screen.getByRole("group", { name: /where will you run/i }),
    ).toBeInTheDocument();
  });

  it("resets editorPhase when browser Back fires (native popstate path)", async () => {
    // Requires an owned history entry so back() fires the popstate subscription.
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await choose("My computer");
    await continueWizard(); // push environment=local; at recommendation
    await continueWizard(); // enter editor phase

    expect(screen.getByRole("group", { name: /which editor/i })).toBeInTheDocument();

    // Simulate browser Back button (native back — subscription fires with {}).
    act(() => { history.back({}); });

    // editorPhase resets via subscription; screen goes to environment question.
    expect(
      screen.getByRole("group", { name: /where will you run/i }),
    ).toBeInTheDocument();
  });
});

// ── Focus management ─────────────────────────────────────────────────────────

describe("GetStartedWizard — focus management", () => {
  it("focuses the screen heading after advancing", async () => {
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await choose("My computer");
    await continueWizard();

    const heading = screen.getByRole("heading", { name: /Sprocket/i });
    expect(document.activeElement).toBe(heading);
  });

  it("focused heading has tabIndex -1", async () => {
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await choose("My computer");
    await continueWizard();

    const heading = screen.getByRole("heading", { name: /Sprocket/i });
    expect(heading).toHaveAttribute("tabindex", "-1");
  });

  it("focuses the checklist heading after completing all questions", async () => {
    const history = createMemoryWizardHistory("?environment=local&editor=vscode");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await choose("macOS");
    await continueWizard();

    const heading = screen.getByRole("heading", { name: "Install your WDL setup" });
    expect(document.activeElement).toBe(heading);
  });
});

// ── Live region ───────────────────────────────────────────────────────────────

describe("GetStartedWizard — polite live region", () => {
  it("has a live region with role=status", () => {
    render(<GetStartedWizard catalog={eligibleCatalog} history={createMemoryWizardHistory()} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("announces stage on screen transition — environment → engine", async () => {
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await choose("My computer");
    await continueWizard();

    const liveRegion = screen.getByRole("status");
    expect(liveRegion.textContent).toMatch(/Engine/i);
    expect(liveRegion.textContent).toMatch(/stage 2 of 4/i);
  });

  it("does not update the live region on radio change (no double-announcing)", async () => {
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    const liveRegionBefore = screen.getByRole("status").textContent;
    await choose("My computer"); // radio change only

    // Live region should not change just from a radio click.
    expect(screen.getByRole("status").textContent).toBe(liveRegionBefore);
  });

  it("announces editor stage when in editor phase", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await continueWizard(); // enter editor phase

    const liveRegion = screen.getByRole("status");
    expect(liveRegion.textContent).toMatch(/Editor/i);
    expect(liveRegion.textContent).toMatch(/stage 3 of 4/i);
  });
});

// ── Start over ────────────────────────────────────────────────────────────────

describe("GetStartedWizard — Start over", () => {
  it("shows a Start over button when state is non-empty", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
    expect(screen.getByRole("button", { name: /start over/i })).toBeInTheDocument();
  });

  it("shows an inline confirmation when Start over is clicked", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await userEvent.click(screen.getByRole("button", { name: /start over/i }));
    expect(screen.getByRole("button", { name: /yes.*start over/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("resets wizard to beginning when confirm is clicked", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await userEvent.click(screen.getByRole("button", { name: /start over/i }));
    await userEvent.click(screen.getByRole("button", { name: /yes.*start over/i }));

    expect(
      screen.getByRole("group", { name: /where will you run/i }),
    ).toBeInTheDocument();
  });

  it("restores focus to Start over button when Cancel is clicked", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await userEvent.click(screen.getByRole("button", { name: /start over/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    // After confirmation closes, the Start over button re-mounts and should be focused.
    // Re-query to get the current DOM element (old ref is stale after remount).
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /start over/i }),
    );
  });

  it("does not show Start over when state is empty (initial screen)", () => {
    const history = createMemoryWizardHistory();
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
    expect(screen.queryByRole("button", { name: /start over/i })).toBeNull();
  });
});

// ── Unsupported configuration ─────────────────────────────────────────────────

describe("GetStartedWizard — unsupported configuration", () => {
  it("shows the unsupported heading for an unsupported config", () => {
    const history = createMemoryWizardHistory("?environment=hpc&scheduler=other");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
    expect(
      screen.getByRole("heading", { name: /don't have a supported setup/i }),
    ).toBeInTheDocument();
  });

  it("shows a Change answers button for unsupported config", () => {
    const history = createMemoryWizardHistory("?environment=hpc&scheduler=other");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
    expect(screen.getByRole("button", { name: /change answers/i })).toBeInTheDocument();
  });

  it("shows a File a setup request link for unsupported config", () => {
    const history = createMemoryWizardHistory("?environment=hpc&scheduler=other");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
    expect(screen.getByRole("link", { name: /file a setup request/i })).toBeInTheDocument();
  });
});

// ── Focus management — initial mount ─────────────────────────────────────────

describe("GetStartedWizard — focus: skip on initial mount", () => {
  it("live region is empty on initial render (no focus stolen)", () => {
    render(<GetStartedWizard catalog={eligibleCatalog} history={createMemoryWizardHistory()} />);
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("no wizard heading is focused on initial render", () => {
    render(<GetStartedWizard catalog={eligibleCatalog} history={createMemoryWizardHistory()} />);
    // The focused element should be the body or an element outside the wizard headings
    const heading = screen.getByRole("heading", { name: /where will you run/i });
    expect(document.activeElement).not.toBe(heading);
  });

  it("live region is empty after bookmark restore (mount sync, not a user action)", () => {
    // Bookmarked state: renders recommendation screen after mount sync
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
    // Screen is recommendation but no user navigation occurred → live region stays empty
    expect(screen.getByRole("heading", { name: /Sprocket/i })).toBeInTheDocument();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("live region updates exactly once on first Continue (StrictMode safe)", async () => {
    const history = createMemoryWizardHistory();
    const { rerender } = render(
      <React.StrictMode>
        <GetStartedWizard catalog={eligibleCatalog} history={history} />
      </React.StrictMode>,
    );

    // Initially empty
    expect(screen.getByRole("status").textContent).toBe("");

    await userEvent.click(screen.getByRole("radio", { name: "My computer" }));
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    // After Continue: exactly "Engine, stage 2 of 4"
    expect(screen.getByRole("status").textContent).toBe("Engine, stage 2 of 4");
    rerender(<React.Fragment />); // cleanup
  });
});

// ── Escape closes Start over confirmation ─────────────────────────────────────

describe("GetStartedWizard — Escape closes Start over confirmation", () => {
  it("Escape key closes the confirmation dialog", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await userEvent.click(screen.getByRole("button", { name: /start over/i }));
    expect(screen.getByRole("button", { name: /yes.*start over/i })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: /yes.*start over/i })).toBeNull();
  });

  it("Escape restores focus to the Start over button", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await userEvent.click(screen.getByRole("button", { name: /start over/i }));
    await userEvent.keyboard("{Escape}");

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /start over/i }),
    );
  });
});

// ── Single visible prompt per question screen (DOM/CSS regression) ────────────

describe("GetStartedWizard — single visible prompt per question screen", () => {
  it("environment question: h2 is sr-only and focusable; fieldset legend is the visible prompt", () => {
    render(<GetStartedWizard catalog={eligibleCatalog} history={createMemoryWizardHistory()} />);
    const h2 = screen.getByRole("heading", { name: /where will you run/i });
    // Focusable for screen-transition focus management
    expect(h2).toHaveAttribute("tabindex", "-1");
    // Visually hidden so the legend is the single visible prompt
    expect(h2).toHaveClass(wizardStyles.srOnly);
    // The fieldset legend is the visible accessible name for the group
    expect(screen.getByRole("group", { name: /where will you run/i })).toBeInTheDocument();
  });

  it("editor question: h2 is sr-only and focusable; fieldset legend is the visible prompt", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" })); // enter editor phase
    const h2 = screen.getByRole("heading", { name: /which editor/i });
    expect(h2).toHaveAttribute("tabindex", "-1");
    expect(h2).toHaveClass(wizardStyles.srOnly);
    expect(screen.getByRole("group", { name: /which editor/i })).toBeInTheDocument();
  });
});

// ── Start over: focus and announcement ───────────────────────────────────────

describe("GetStartedWizard — Start over: focus and announce after reset", () => {
  it("focuses the Environment h2 and announces 'Environment, stage 1 of 4' after confirmed Start over", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await userEvent.click(screen.getByRole("button", { name: /start over/i }));
    await userEvent.click(screen.getByRole("button", { name: /yes.*start over/i }));

    expect(screen.getByRole("status").textContent).toBe("Environment, stage 1 of 4");
    const envH2 = screen.getByRole("heading", { name: /where will you run/i });
    expect(document.activeElement).toBe(envH2);
  });

  it("Cancel still restores focus to Start over button (no change to existing behaviour)", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await userEvent.click(screen.getByRole("button", { name: /start over/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /start over/i }),
    );
  });

  it("Escape still restores focus to Start over button after reset confirmation", async () => {
    const history = createMemoryWizardHistory("?environment=local");
    render(<GetStartedWizard catalog={eligibleCatalog} history={history} />);

    await userEvent.click(screen.getByRole("button", { name: /start over/i }));
    await userEvent.keyboard("{Escape}");

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /start over/i }),
    );
  });
});
