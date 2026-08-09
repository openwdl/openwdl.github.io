import { describe, it, expect, vi } from "vitest";
import { createWizardHistory } from "./history";
import { parseSetupSearch } from "./url";
import { SETUP_CATALOG } from "../catalog/catalog";
import type { SetupState } from "./types";

// ── Mock browser factory ──────────────────────────────────────────────────────

type MockListener = () => void;

interface MockBrowser {
  location: { search: string };
  history: {
    readonly state: unknown;
    pushState: ReturnType<typeof vi.fn>;
    replaceState: ReturnType<typeof vi.fn>;
    back: ReturnType<typeof vi.fn>;
  };
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

function makeBrowser(initialSearch = "", initialState: unknown = null): MockBrowser {
  const stack: string[] = [initialSearch];
  const stateStack: unknown[] = [initialState];
  let idx = 0;
  const eventListeners = new Map<string, MockListener[]>();

  function fire(type: string): void {
    for (const h of eventListeners.get(type) ?? []) h();
  }

  const browserHistory = {
    get state(): unknown { return stateStack[idx]; },
    pushState: vi.fn((_st: unknown, _title: string, url: string) => {
      stack.splice(idx + 1);
      stack.push(url);
      stateStack.splice(idx + 1);
      stateStack.push(_st);
      idx++;
    }),
    replaceState: vi.fn((_st: unknown, _title: string, url: string) => {
      stack[idx] = url;
      stateStack[idx] = _st;
    }),
    back: vi.fn(() => {
      if (idx > 0) {
        idx--;
        fire("popstate");
      }
    }),
  };

  const addEventListener = vi.fn((type: string, handler: MockListener) => {
    if (!eventListeners.has(type)) eventListeners.set(type, []);
    eventListeners.get(type)!.push(handler);
  });

  const removeEventListener = vi.fn((type: string, handler: MockListener) => {
    const hs = eventListeners.get(type);
    if (hs) {
      const i = hs.indexOf(handler);
      if (i !== -1) hs.splice(i, 1);
    }
  });

  return {
    get location() {
      return { search: stack[idx] };
    },
    history: browserHistory,
    addEventListener,
    removeEventListener,
  };
}

type BrowserParam = Parameters<typeof createWizardHistory>[0];

function asBrowser(mock: MockBrowser): BrowserParam {
  return mock as unknown as BrowserParam;
}

function makeParseState(): (params: URLSearchParams) => SetupState {
  return (params) => parseSetupSearch(params, SETUP_CATALOG).state;
}

// ── push ──────────────────────────────────────────────────────────────────────

describe("createWizardHistory — push", () => {
  it("calls pushState with the serialized state as a query string", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "local" });
    expect(browser.history.pushState).toHaveBeenCalledOnce();
    const [, , url] = browser.history.pushState.mock.calls[0] as [null, string, string];
    expect(new URLSearchParams(url.replace(/^\?/, "")).get("environment")).toBe("local");
  });

  it("updates the browser location after push", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "hpc", scheduler: "slurm" });
    expect(browser.location.search).toMatch(/environment=hpc/);
    expect(browser.location.search).toMatch(/scheduler=slurm/);
  });

  it("does not push a duplicate entry when the state matches the current URL (history loop prevention)", () => {
    const browser = makeBrowser("?environment=local");
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "local" });
    expect(browser.history.pushState).not.toHaveBeenCalled();
  });

  it("pushes when the state differs from the current URL", () => {
    const browser = makeBrowser("?environment=local");
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "hpc", scheduler: "slurm" });
    expect(browser.history.pushState).toHaveBeenCalledOnce();
  });
});

// ── normalize ─────────────────────────────────────────────────────────────────

describe("createWizardHistory — normalize", () => {
  it("calls replaceState with the serialized state", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.normalize({ environment: "local" });
    expect(browser.history.replaceState).toHaveBeenCalledOnce();
  });

  it("does not call replaceState when the state already matches the current URL", () => {
    const browser = makeBrowser("?environment=local");
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.normalize({ environment: "local" });
    expect(browser.history.replaceState).not.toHaveBeenCalled();
  });

  it("does not call pushState — only replaceState", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.normalize({ environment: "cloud", service: "terra" });
    expect(browser.history.pushState).not.toHaveBeenCalled();
    expect(browser.history.replaceState).toHaveBeenCalledOnce();
  });
});

// ── back — after push ─────────────────────────────────────────────────────────

describe("createWizardHistory — back after push", () => {
  it("calls history.back() after a push has been made", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "local" });
    wh.back({});
    expect(browser.history.back).toHaveBeenCalledOnce();
  });

  it("does not call replaceState when back() uses the native back", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "local" });
    wh.back({});
    expect(browser.history.replaceState).not.toHaveBeenCalled();
  });
});

// ── back — direct deep link ───────────────────────────────────────────────────

describe("createWizardHistory — back on direct deep link (no push)", () => {
  it("calls replaceState with the serialized fallback state", () => {
    const browser = makeBrowser("?environment=local&editor=vscode&os=macos");
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.back({});
    expect(browser.history.back).not.toHaveBeenCalled();
    expect(browser.history.replaceState).toHaveBeenCalledOnce();
  });

  it("uses the fallback state as the replaceState URL on direct deep link", () => {
    const browser = makeBrowser("?environment=local");
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const fallback: SetupState = {};
    wh.back(fallback);
    const [, , url] = browser.history.replaceState.mock.calls[0] as [null, string, string];
    // empty fallback → empty search
    expect(url).toBe("");
  });

  it("uses a non-empty fallback correctly", () => {
    const browser = makeBrowser("?environment=local&editor=vscode&os=macos");
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const fallback: SetupState = { environment: "local" };
    wh.back(fallback);
    const [, , url] = browser.history.replaceState.mock.calls[0] as [null, string, string];
    expect(url).toMatch(/environment=local/);
  });

  it("normalize does not interfere with back() detection", () => {
    // normalize should NOT increment the push counter
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.normalize({ environment: "local" });  // replaceState, not push
    wh.back({});
    // Still no pushes — should use replaceState for fallback
    expect(browser.history.back).not.toHaveBeenCalled();
    // 2 replaceState calls: one for normalize, one for back
    expect(browser.history.replaceState).toHaveBeenCalledTimes(2);
  });
});

// ── subscribe and popstate ────────────────────────────────────────────────────

describe("createWizardHistory — subscribe", () => {
  it("registers a listener for the popstate event", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const listener = vi.fn();
    wh.subscribe(listener);
    expect(browser.addEventListener).toHaveBeenCalledWith("popstate", expect.any(Function));
  });

  it("calls the subscriber with the reparsed state when popstate fires after back", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const listener = vi.fn<(state: SetupState) => void>();
    wh.subscribe(listener);
    wh.push({ environment: "local" });
    wh.back({});  // triggers history.back() → fires popstate → listener called with {}
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({});
  });

  it("subscriber receives the correct state after navigating back to a pushed entry", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const listener = vi.fn<(state: SetupState) => void>();
    wh.subscribe(listener);
    wh.push({ environment: "local" });
    wh.push({ environment: "local", editor: "vscode" });
    wh.back({});  // back to first push: environment=local
    expect(listener).toHaveBeenCalledWith({ environment: "local" });
  });

  it("returns an unsubscribe function that removes the event listener", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const listener = vi.fn();
    const unsub = wh.subscribe(listener);
    unsub();
    expect(browser.removeEventListener).toHaveBeenCalledWith("popstate", expect.any(Function));
  });

  it("unsubscribed listener is not called on subsequent popstate events", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const listener = vi.fn();
    const unsub = wh.subscribe(listener);
    unsub();
    wh.push({ environment: "local" });
    wh.back({});  // popstate fires but listener was removed
    expect(listener).not.toHaveBeenCalled();
  });

  it("subscriber round-trips a full setup state through URL parsing on popstate", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const listener = vi.fn<(state: SetupState) => void>();
    wh.subscribe(listener);
    const pushed: SetupState = { environment: "hpc", scheduler: "lsf" };
    wh.push(pushed);
    wh.push({ environment: "local" });  // another push so back() goes to pushed
    wh.back({});
    expect(listener).toHaveBeenLastCalledWith(pushed);
  });
});

// ── serializeSetupState integration ──────────────────────────────────────────

describe("createWizardHistory — URL serialization integration", () => {
  it("pushState URL uses the stable key order from serializeSetupState", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "cloud", service: "terra", editor: "vscode", os: "macos" });
    const [, , url] = browser.history.pushState.mock.calls[0] as [null, string, string];
    const keys = Array.from(new URLSearchParams(url.replace(/^\?/, "")).keys());
    // environment must come before service, service before editor, editor before os
    const envIdx = keys.indexOf("environment");
    const svcIdx = keys.indexOf("service");
    const edIdx = keys.indexOf("editor");
    const osIdx = keys.indexOf("os");
    expect(envIdx).toBeLessThan(svcIdx);
    expect(svcIdx).toBeLessThan(edIdx);
    expect(edIdx).toBeLessThan(osIdx);
  });
});

// ── memory history — basic contract ──────────────────────────────────────────
// These tests import the fixture to ensure it satisfies WizardHistory.

describe("createMemoryWizardHistory", () => {
  it("satisfies the WizardHistory interface (imported as peer)", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    expect(typeof wh.push).toBe("function");
    expect(typeof wh.normalize).toBe("function");
    expect(typeof wh.back).toBe("function");
    expect(typeof wh.subscribe).toBe("function");
    expect(Array.isArray(wh.entries)).toBe(true);
  });

  it("starts with the parsed initial state", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    expect(wh.entries).toEqual([{ environment: "local" }]);
  });

  it("starts with empty state when no search is provided", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    expect(wh.entries).toEqual([{}]);
  });

  it("push appends to entries", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    wh.push({ environment: "local" });
    expect(wh.entries).toEqual([{}, { environment: "local" }]);
  });

  it("normalize replaces the current entry in place", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    wh.normalize({ environment: "hpc" });
    expect(wh.entries).toEqual([{ environment: "hpc" }]);
  });

  it("back after push navigates to the previous entry", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    wh.push({ environment: "local" });
    wh.back({});
    expect(wh.entries).toEqual([{}]);
  });

  it("back without push normalizes to the fallback (direct deep link)", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    wh.back({ environment: "hpc" });
    expect(wh.entries).toEqual([{ environment: "hpc" }]);
  });

  it("push is silent to subscribers (matching browser pushState)", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    const listener = vi.fn<(state: SetupState) => void>();
    wh.subscribe(listener);
    wh.push({ environment: "local" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("subscribe notifies on back", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    const listener = vi.fn<(state: SetupState) => void>();
    wh.subscribe(listener);
    wh.push({ environment: "local" });
    wh.back({});
    expect(listener).toHaveBeenLastCalledWith({});
  });

  it("unsubscribe stops notifications", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    const listener = vi.fn();
    const unsub = wh.subscribe(listener);
    unsub();
    wh.push({ environment: "local" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("push with identical state is a no-op (history loop prevention)", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    wh.push({ environment: "local" });
    // Should still be just one entry
    expect(wh.entries).toEqual([{ environment: "local" }]);
  });
});

// ── back safety: history.state-based ownership (Finding 1) ───────────────────

describe("createWizardHistory — back safety (history.state ownership)", () => {
  it("one push then two back calls: first uses native back, second falls back to replaceState", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "local" });

    wh.back({});
    expect(browser.history.back).toHaveBeenCalledOnce();
    expect(browser.history.replaceState).not.toHaveBeenCalled();

    // After the native back, current entry is the initial non-owned entry.
    wh.back({});
    expect(browser.history.back).toHaveBeenCalledOnce(); // still only 1
    expect(browser.history.replaceState).toHaveBeenCalledOnce(); // fallback now
  });

  it("multiple pushes: each uses native back until all owned entries are exhausted", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "local" });
    wh.push({ environment: "hpc" });
    wh.push({ environment: "cloud" });

    wh.back({});
    wh.back({});
    wh.back({});
    expect(browser.history.back).toHaveBeenCalledTimes(3);
    expect(browser.history.replaceState).not.toHaveBeenCalled();

    // All owned entries backed through — next back uses fallback.
    wh.back({ environment: "local" });
    expect(browser.history.back).toHaveBeenCalledTimes(3); // unchanged
    expect(browser.history.replaceState).toHaveBeenCalledOnce();
  });

  it("external browser back before adapter back: adapter reads non-owned state and falls back", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "local" });

    // Simulate the user pressing the browser back button (bypasses adapter).
    browser.history.back();
    // Now at the initial entry (state = null, not owned).

    wh.back({ environment: "hpc" });
    // Adapter sees null state → fallback.
    expect(browser.history.replaceState).toHaveBeenCalledOnce();
    const [, , url] = browser.history.replaceState.mock.calls[0] as [unknown, string, string];
    expect(url).toMatch(/environment=hpc/);
  });

  it("normalize after push preserves the owned marker so back() still uses native back", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    wh.push({ environment: "local" });
    // normalize replaces the URL but must keep the owned marker.
    wh.normalize({ environment: "cloud" });

    const [st] = browser.history.replaceState.mock.calls[0] as [unknown, string, string];
    expect(st).toHaveProperty("__openwdl_wizard_v1");

    // back() sees owned state → native back.
    wh.back({});
    expect(browser.history.back).toHaveBeenCalledOnce();
    // replaceState was only called by normalize, not by back.
    expect(browser.history.replaceState).toHaveBeenCalledOnce();
  });

  it("unrelated pre-existing history.state is treated as non-owned", () => {
    // Simulate a page whose history.state was set by some other code.
    const browser = makeBrowser("?environment=local", { someOtherApp: true });
    const wh = createWizardHistory(asBrowser(browser), makeParseState());

    wh.back({ environment: "hpc" });
    expect(browser.history.back).not.toHaveBeenCalled();
    expect(browser.history.replaceState).toHaveBeenCalledOnce();
  });

  it("back() fallback is silent to subscribers (replaceState does not trigger popstate)", () => {
    const browser = makeBrowser("?environment=local");
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const listener = vi.fn();
    wh.subscribe(listener);

    wh.back({});  // no push — uses fallback replaceState
    expect(listener).not.toHaveBeenCalled();
  });
});

// ── browser adapter / memory fixture parity (Finding 2) ──────────────────────

describe("back() browser–fixture parity", () => {
  it("memory fixture: fallback back is silent to subscribers", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    const listener = vi.fn();
    wh.subscribe(listener);

    wh.back({ environment: "hpc" });  // no push — fallback path
    expect(listener).not.toHaveBeenCalled();
  });

  it("memory fixture: native back notifies subscribers (modeled popstate)", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    const listener = vi.fn<(state: SetupState) => void>();
    wh.subscribe(listener);
    wh.push({ environment: "local" });
    listener.mockClear();

    wh.back({});
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({});
  });

  it("memory fixture: fallback back still updates the current entry", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    wh.back({ environment: "hpc" });
    expect(wh.entries).toEqual([{ environment: "hpc" }]);
  });
});

// ── normalize browser–fixture parity ──────────────────────────────────────────

describe("normalize() browser–fixture parity", () => {
  it("browser adapter: normalize is silent to subscribers (replaceState does not fire popstate)", () => {
    const browser = makeBrowser("?environment=local");
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const listener = vi.fn();
    wh.subscribe(listener);

    wh.normalize({ environment: "hpc" }); // changes URL silently
    expect(listener).not.toHaveBeenCalled();
  });

  it("memory fixture: normalize is silent to subscribers", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    const listener = vi.fn();
    wh.subscribe(listener);

    wh.normalize({ environment: "hpc" }); // changes entry silently
    expect(listener).not.toHaveBeenCalled();
  });

  it("memory fixture: normalize still updates the current entry", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    wh.normalize({ environment: "hpc" });
    expect(wh.entries).toEqual([{ environment: "hpc" }]);
  });

  it("memory fixture: normalize returns true when URL changes", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    const changed = wh.normalize({ environment: "hpc" });
    expect(changed).toBe(true);
  });

  it("memory fixture: normalize returns false when URL is unchanged (no-op)", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory("environment=local");
    const changed = wh.normalize({ environment: "local" });
    expect(changed).toBe(false);
  });
});

// ── push() browser–fixture parity ────────────────────────────────────────────

describe("push() browser–fixture parity", () => {
  it("browser adapter: push is silent to subscribers (pushState does not fire popstate)", () => {
    const browser = makeBrowser();
    const wh = createWizardHistory(asBrowser(browser), makeParseState());
    const listener = vi.fn();
    wh.subscribe(listener);
    wh.push({ environment: "local" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("memory fixture: push is silent to subscribers (matching browser pushState)", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    const listener = vi.fn();
    wh.subscribe(listener);
    wh.push({ environment: "local" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("memory fixture: push still appends the entry even though it is silent", async () => {
    const { createMemoryWizardHistory } = await import("./history.fixture");
    const wh = createMemoryWizardHistory();
    const listener = vi.fn();
    wh.subscribe(listener);
    wh.push({ environment: "local" });
    expect(wh.entries).toEqual([{}, { environment: "local" }]);
    expect(listener).not.toHaveBeenCalled(); // silent but state updated
  });
});
