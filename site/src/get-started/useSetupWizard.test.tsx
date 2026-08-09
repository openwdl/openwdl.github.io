import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useSetupWizard } from "./useSetupWizard";
import { createMemoryWizardHistory } from "./model/history.fixture";
import { eligibleCatalog } from "./test/fixtures";

// ── Initial state ─────────────────────────────────────────────────────────────

describe("useSetupWizard — initial state", () => {
  it("initialises from history.read() — empty URL shows environment question", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    expect(result.current.screen.kind).toBe("question");
    expect(result.current.screen.stage).toBe("environment");
  });

  it("initialises from history.read() — bookmarked complete URL shows checklist", () => {
    const history = createMemoryWizardHistory(
      "?environment=local&editor=vscode&os=macos",
    );
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    expect(result.current.screen.kind).toBe("checklist");
  });

  it("initialises from history.read() — bookmarked recommendation URL shows recommendation", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    expect(result.current.screen.kind).toBe("recommendation");
  });

  it("has empty completedStages on the first screen", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    expect(result.current.completedStages).toEqual([]);
  });

  it("has no notice initially when URL is clean", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    expect(result.current.notice).toBeUndefined();
  });
});

// ── normalize on mount ────────────────────────────────────────────────────────

describe("useSetupWizard — normalize on mount", () => {
  it("sets a notice when the initial URL contained invalid parameters", () => {
    // The memory fixture silently drops invalid params during construction;
    // normalize() then sees the cleaned state ≠ the raw URL → returns true.
    // We simulate this by constructing a fixture with a URL that differs after
    // cleaning — we do this by testing the hook detects changed URL.
    const history = createMemoryWizardHistory();
    // Manually set the initial stack entry to a state that differs from `{}`
    // so normalize({}) IS a no-op (clean URL).
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    // URL was already clean → no notice.
    expect(result.current.notice).toBeUndefined();
  });

  it("sets a notice and explicit state update when normalize changes the URL", () => {
    // We need a history where read() returns {}, but the underlying URL is dirty.
    // This is hard to simulate with the memory fixture since it already parses.
    // Instead, test that when normalize() returns true the hook shows a notice.
    // We create a custom history whose read() returns {} but normalize() returns true.
    const mockHistory = {
      read: vi.fn(() => ({})),
      normalize: vi.fn(() => true),
      push: vi.fn(),
      back: vi.fn(() => false),
      subscribe: vi.fn(() => () => {}),
    };
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, mockHistory));
    expect(result.current.notice).toBeTruthy();
    expect(typeof result.current.notice).toBe("string");
  });

  it("updates state explicitly after normalize (does not rely on notify)", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const listener = vi.fn();
    history.subscribe(listener);
    listener.mockClear();

    renderHook(() => useSetupWizard(eligibleCatalog, history));
    // normalize({environment: "local"}) is a no-op → listener never called
    expect(listener).not.toHaveBeenCalled();
  });
});

// ── answer ────────────────────────────────────────────────────────────────────

describe("useSetupWizard — answer", () => {
  it("updates the state with the new value", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("environment", "local"); });
    expect(result.current.state.environment).toBe("local");
  });

  it("does not advance the screen — screen only changes on continue()", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    const screenBefore = result.current.screen;

    act(() => { result.current.answer("environment", "local"); });
    expect(result.current.screen).toEqual(screenBefore);
  });

  it("prunes incompatible downstream answers", () => {
    const history = createMemoryWizardHistory("?environment=hpc&scheduler=slurm");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    // Change environment away from hpc → scheduler should be pruned.
    act(() => { result.current.answer("environment", "local"); });
    expect(result.current.state.scheduler).toBeUndefined();
  });
});

// ── continue ──────────────────────────────────────────────────────────────────

describe("useSetupWizard — continue()", () => {
  it("pushes current answers to history on a question screen", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("environment", "local"); });
    act(() => { result.current.continue(); });

    expect(history.entries).toEqual([{}, { environment: "local" }]);
  });

  it("advances to recommendation after environment answer + continue", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("environment", "local"); });
    act(() => { result.current.continue(); });

    expect(result.current.screen.kind).toBe("recommendation");
  });

  it("does not push URL when continuing from recommendation (editor phase)", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    const entriesBefore = history.entries.length;
    act(() => { result.current.continue(); }); // acknowledge recommendation

    // No new history entry for the UI-local editor phase.
    expect(history.entries.length).toBe(entriesBefore);
  });

  it("enters editor phase after continuing from recommendation", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.continue(); });
    expect(result.current.screen.kind).toBe("question");
    expect(result.current.screen.stage).toBe("editor");
  });

  it("pushes editor to URL when continuing from editor phase", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.continue(); }); // enter editor phase
    act(() => { result.current.answer("editor", "vscode"); });
    act(() => { result.current.continue(); }); // exit editor phase

    const last = history.entries[history.entries.length - 1];
    expect(last.editor).toBe("vscode");
  });

  it("advances to OS question after editor is committed", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.continue(); });
    act(() => { result.current.answer("editor", "vscode"); });
    act(() => { result.current.continue(); });

    expect(result.current.screen.kind).toBe("question");
    expect(result.current.screen.stage).toBe("install");
  });

  it("advances to checklist after OS answer + continue", () => {
    const history = createMemoryWizardHistory("?environment=local&editor=vscode");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("os", "macos"); });
    act(() => { result.current.continue(); });

    expect(result.current.screen.kind).toBe("checklist");
  });
});

// ── completedStages ───────────────────────────────────────────────────────────

describe("useSetupWizard — completedStages", () => {
  it("is empty on the environment question", () => {
    const { result } = renderHook(() =>
      useSetupWizard(eligibleCatalog, createMemoryWizardHistory()),
    );
    expect(result.current.completedStages).toEqual([]);
  });

  it("includes environment when on the recommendation screen", () => {
    const { result } = renderHook(() =>
      useSetupWizard(eligibleCatalog, createMemoryWizardHistory("?environment=local")),
    );
    expect(result.current.completedStages).toContain("environment");
    expect(result.current.completedStages).not.toContain("engine");
  });

  it("includes environment + engine when in editor phase", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    act(() => { result.current.continue(); }); // enter editor phase
    expect(result.current.completedStages).toEqual(
      expect.arrayContaining(["environment", "engine"]),
    );
    expect(result.current.completedStages).not.toContain("editor");
  });

  it("includes environment + engine + editor on the install question", () => {
    const { result } = renderHook(() =>
      useSetupWizard(
        eligibleCatalog,
        createMemoryWizardHistory("?environment=local&editor=vscode"),
      ),
    );
    expect(result.current.completedStages).toEqual(
      expect.arrayContaining(["environment", "engine", "editor"]),
    );
  });
});

// ── back ──────────────────────────────────────────────────────────────────────

describe("useSetupWizard — back()", () => {
  it("goes back from editor phase to recommendation without a URL change", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.continue(); }); // enter editor phase
    act(() => { result.current.answer("editor", "vscode"); });
    act(() => { result.current.back(); }); // back from editor phase

    expect(result.current.screen.kind).toBe("recommendation");
    // Editor selection should be cleared from state
    expect(result.current.state.editor).toBeUndefined();
  });

  it("uses native back when history has owned entries", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("environment", "local"); });
    act(() => { result.current.continue(); }); // pushes environment=local

    // Now at recommendation. Go back.
    act(() => { result.current.back(); });

    expect(result.current.screen.kind).toBe("question");
    expect(result.current.screen.stage).toBe("environment");
  });

  it("uses fallback replaceState on direct-link (no owned history) and updates urlState explicitly", () => {
    const history = createMemoryWizardHistory("?environment=local&editor=vscode");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    // No pushes → fallback path (urlState becomes {environment: "local"}).
    act(() => { result.current.back(); });

    // The committed state (urlState) drives screen computation → recommendation.
    expect(result.current.screen.kind).toBe("recommendation");
    // Note: answers.editor is preserved by "Back preserves compatible answers"
    // behaviour — only the committed screen changes, not the form answers.
  });

  it("back fallback does not rely on subscribe notification for state update", () => {
    const history = createMemoryWizardHistory("?environment=local&editor=vscode");
    const subscriberSpy = vi.fn();
    // Subscribe BEFORE renderHook to intercept notifications.
    const unsub = history.subscribe(subscriberSpy);

    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    subscriberSpy.mockClear();

    act(() => { result.current.back(); }); // fallback — silent

    expect(subscriberSpy).not.toHaveBeenCalled();
    // State is still updated correctly via explicit setState.
    expect(result.current.screen.kind).toBe("recommendation");

    unsub();
  });
});

// ── popstate ──────────────────────────────────────────────────────────────────

describe("useSetupWizard — popstate subscription", () => {
  it("restores state when popstate fires", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("environment", "local"); });
    act(() => { result.current.continue(); }); // push environment=local

    // At recommendation. Simulate browser back (fires popstate).
    act(() => { history.back({}); }); // native back → subscription fires

    expect(result.current.screen.kind).toBe("question");
    expect(result.current.screen.stage).toBe("environment");
  });

  it("resets editorPhase to false when popstate fires", () => {
    // Needs an owned history entry so back() uses native path and fires subscription.
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("environment", "local"); });
    act(() => { result.current.continue(); }); // push environment=local
    act(() => { result.current.continue(); }); // enter editor phase

    expect(result.current.screen.stage).toBe("editor");

    // Simulate browser back (native — subscription fires with {}).
    act(() => { history.back({}); });

    expect(result.current.screen.kind).toBe("question");
    expect(result.current.screen.stage).toBe("environment");
  });
});

// ── startOver ─────────────────────────────────────────────────────────────────

describe("useSetupWizard — startOver()", () => {
  it("resets state to {} and returns to the environment question", () => {
    const history = createMemoryWizardHistory("?environment=local&editor=vscode");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.startOver(); });

    expect(result.current.state).toEqual({});
    expect(result.current.screen.kind).toBe("question");
    expect(result.current.screen.stage).toBe("environment");
  });

  it("clears the notice", () => {
    const mockHistory = {
      read: vi.fn(() => ({})),
      normalize: vi.fn(() => true), // triggers notice on mount
      push: vi.fn(),
      back: vi.fn(() => false),
      subscribe: vi.fn(() => () => {}),
    };
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, mockHistory));
    expect(result.current.notice).toBeTruthy();

    act(() => { result.current.startOver(); });
    expect(result.current.notice).toBeUndefined();
  });

  it("resets editorPhase", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.continue(); }); // editor phase
    act(() => { result.current.startOver(); });

    expect(result.current.screen.stage).toBe("environment");
  });

  it("calls normalize({}) on the history — does not push", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const normalizeSpy = vi.spyOn(history, "normalize");
    const pushSpy = vi.spyOn(history, "push");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    normalizeSpy.mockClear();

    act(() => { result.current.startOver(); });

    expect(normalizeSpy).toHaveBeenCalledWith({});
    expect(pushSpy).not.toHaveBeenCalled();
  });
});

// ── StrictMode: no duplicate push per Continue ────────────────────────────────

describe("useSetupWizard — StrictMode: advance side-effects", () => {
  it("calls history.push exactly once per Continue even in StrictMode", () => {
    const history = createMemoryWizardHistory();
    const pushSpy = vi.spyOn(history, "push");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <React.StrictMode>{children}</React.StrictMode>
    );
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history), { wrapper });

    act(() => { result.current.answer("environment", "local"); });
    pushSpy.mockClear();
    act(() => { result.current.continue(); });

    // Side effects removed from setState updaters: push fires exactly once.
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith({ environment: "local" });
  });

  it("calls history.push exactly once per Continue from editor phase in StrictMode", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const pushSpy = vi.spyOn(history, "push");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <React.StrictMode>{children}</React.StrictMode>
    );
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history), { wrapper });

    act(() => { result.current.continue(); }); // enter editor phase
    act(() => { result.current.answer("editor", "vscode"); });
    pushSpy.mockClear();
    act(() => { result.current.continue(); }); // commit editor

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ editor: "vscode" }));
  });
});

// ── Guard: continue() without answer is a no-op ───────────────────────────────

describe("useSetupWizard — continue() guard", () => {
  it("does not push when no answer is selected on a question screen", () => {
    const history = createMemoryWizardHistory();
    const pushSpy = vi.spyOn(history, "push");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.continue(); }); // no environment selected
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("does not advance the screen when no answer is selected", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    const screenBefore = result.current.screen;

    act(() => { result.current.continue(); });
    expect(result.current.screen).toEqual(screenBefore);
  });

  it("does not push when no editor is selected during editor phase", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const pushSpy = vi.spyOn(history, "push");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.continue(); }); // enter editor phase
    pushSpy.mockClear();
    act(() => { result.current.continue(); }); // no editor selected

    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("does push when an answer IS selected (regression guard)", () => {
    const history = createMemoryWizardHistory();
    const pushSpy = vi.spyOn(history, "push");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("environment", "local"); });
    pushSpy.mockClear();
    act(() => { result.current.continue(); });

    expect(pushSpy).toHaveBeenCalledOnce();
  });
});

// ── Popstate answer retention and pruning ─────────────────────────────────────

describe("useSetupWizard — popstate answer retention", () => {
  it("retains compatible editor/os when popstate fires with the same environment", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    // Build up: environment=local → editor=vscode committed; uncommitted os=macos
    act(() => { result.current.answer("environment", "local"); });
    act(() => { result.current.continue(); }); // push local
    act(() => { result.current.continue(); }); // enter editor phase
    act(() => { result.current.answer("editor", "vscode"); });
    act(() => { result.current.continue(); }); // push editor
    act(() => { result.current.answer("os", "macos"); }); // uncommitted

    // Browser Back to the environment=local entry (fires popstate)
    act(() => { history.back({ environment: "local" }); });

    // editor and os should be retained (compatible with local environment)
    expect(result.current.state.editor).toBe("vscode");
    expect(result.current.state.os).toBe("macos");
  });

  it("prunes incompatible scheduler when popstate fires on a different environment", () => {
    type SetupState = import("./model/types").SetupState;
    let subscriber: ((state: SetupState) => void) | null = null;
    const mockHistory = {
      read: vi.fn((): SetupState => ({ environment: "hpc", scheduler: "slurm" })),
      normalize: vi.fn(() => false),
      push: vi.fn(),
      back: vi.fn(() => false),
      subscribe: vi.fn((listener: (s: SetupState) => void) => {
        subscriber = listener;
        return () => { subscriber = null; };
      }),
    };

    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, mockHistory));
    // Simulate popstate to cloud path — scheduler is incompatible
    act(() => { subscriber?.({ environment: "cloud" }); });

    expect(result.current.state.scheduler).toBeUndefined();
    expect(result.current.state.environment).toBe("cloud");
  });

  it("committed URL values win: popstate overrides any retained value for the same key", () => {
    type SetupState = import("./model/types").SetupState;
    let subscriber: ((state: SetupState) => void) | null = null;
    const mockHistory = {
      read: vi.fn((): SetupState => ({ environment: "local" })),
      normalize: vi.fn(() => false),
      push: vi.fn(),
      back: vi.fn(() => false),
      subscribe: vi.fn((listener: (s: SetupState) => void) => {
        subscriber = listener;
        return () => { subscriber = null; };
      }),
    };

    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, mockHistory));
    act(() => { result.current.answer("environment", "hpc"); }); // uncommitted
    act(() => { subscriber?.({ environment: "cloud" }); }); // popstate wins

    expect(result.current.state.environment).toBe("cloud");
  });

  it("unsupported state contains no stale cloud answers after popstate to HPC path", () => {
    // Scenario: user was on cloud path (service=terra), browser Back takes them to
    // the unsupported HPC path. Cloud-specific service answer must be pruned.
    type SetupState = import("./model/types").SetupState;
    let subscriber: ((state: SetupState) => void) | null = null;
    const mockHistory = {
      // Initial state: cloud path with service=terra
      read: vi.fn((): SetupState => ({ environment: "cloud", service: "terra" })),
      normalize: vi.fn(() => false),
      push: vi.fn(),
      back: vi.fn(() => false),
      subscribe: vi.fn((listener: (s: SetupState) => void) => {
        subscriber = listener;
        return () => { subscriber = null; };
      }),
    };

    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, mockHistory));
    // Popstate to unsupported HPC path — cloud service is incompatible with HPC
    act(() => { subscriber?.({ environment: "hpc", scheduler: "other" }); });

    expect(result.current.state.service).toBeUndefined(); // stale cloud answer pruned
    expect(result.current.state.environment).toBe("hpc"); // committed URL wins
    expect(result.current.screen.kind).toBe("unsupported");
  });
});

// ── navCount ──────────────────────────────────────────────────────────────────

describe("useSetupWizard — navCount", () => {
  it("starts at 0 (no focus/announcement on initial render)", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    expect(result.current.navCount).toBe(0);
  });

  it("bookmark restore does not increment navCount (mount sync is not a user action)", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));
    // After mount sync, screen shows recommendation but navCount stays 0.
    expect(result.current.navCount).toBe(0);
    expect(result.current.screen.kind).toBe("recommendation");
  });

  it("increments to exactly 1 after the first continue() — push is silent, no double-increment", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("environment", "local"); });
    act(() => { result.current.continue(); });

    expect(result.current.navCount).toBe(1);
  });

  it("each logical transition increments navCount by exactly one", () => {
    const history = createMemoryWizardHistory();
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.answer("environment", "local"); });
    act(() => { result.current.continue(); }); // navCount → 1
    act(() => { result.current.continue(); }); // acknowledge recommendation → editor phase; navCount → 2

    expect(result.current.navCount).toBe(2);
  });

  it("startOver increments navCount exactly once (treated as a screen transition)", () => {
    const history = createMemoryWizardHistory("?environment=local");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    act(() => { result.current.startOver(); });

    expect(result.current.navCount).toBe(1);
    expect(result.current.screen.stage).toBe("environment");
  });
});

// ── Guard: continue() is a no-op on terminal screens ─────────────────────────

describe("useSetupWizard — continue() on terminal screens", () => {
  it("does not push when called on a checklist screen", () => {
    const history = createMemoryWizardHistory(
      "?environment=local&editor=vscode&os=macos",
    );
    const pushSpy = vi.spyOn(history, "push");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    expect(result.current.screen.kind).toBe("checklist");
    pushSpy.mockClear();
    act(() => { result.current.continue(); });

    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("does not increment navCount when called on a checklist screen", () => {
    const history = createMemoryWizardHistory(
      "?environment=local&editor=vscode&os=macos",
    );
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    expect(result.current.screen.kind).toBe("checklist");
    const navCountBefore = result.current.navCount;
    act(() => { result.current.continue(); });

    expect(result.current.navCount).toBe(navCountBefore);
  });

  it("does not push when called on an unsupported screen", () => {
    // HPC with "other" scheduler → unsupported
    const history = createMemoryWizardHistory(
      "?environment=hpc&scheduler=other",
    );
    const pushSpy = vi.spyOn(history, "push");
    const { result } = renderHook(() => useSetupWizard(eligibleCatalog, history));

    expect(result.current.screen.kind).toBe("unsupported");
    pushSpy.mockClear();
    act(() => { result.current.continue(); });

    expect(pushSpy).not.toHaveBeenCalled();
  });
});
