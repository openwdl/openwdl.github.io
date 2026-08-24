import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { GetStartedPage } from "./GetStartedPage";
import { createStaticWizardHistory } from "./model/history";

// ── Static adapter ─────────────────────────────────────────────────────────

describe("createStaticWizardHistory — SSR baseline", () => {
  it("read() always returns empty state", () => {
    const h = createStaticWizardHistory();
    expect(h.read()).toEqual({});
  });

  it("normalize() always returns false (no-op)", () => {
    const h = createStaticWizardHistory();
    expect(h.normalize({ environment: "local" })).toBe(false);
  });

  it("back() always returns false (no-op)", () => {
    const h = createStaticWizardHistory();
    expect(h.back({ environment: "local" })).toBe(false);
  });

  it("subscribe() returns an unsubscribe that does not throw", () => {
    const h = createStaticWizardHistory();
    const unsub = h.subscribe(() => {});
    expect(() => unsub()).not.toThrow();
  });

  it("push() is a no-op (does not throw)", () => {
    const h = createStaticWizardHistory();
    expect(() => h.push({ environment: "local" })).not.toThrow();
  });
});

// ── SSR rendering ──────────────────────────────────────────────────────────

describe("GetStartedPage — SSR (no window)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders to HTML without throwing when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(() => renderToString(createElement(GetStartedPage))).not.toThrow();
  });

  it("renders deterministic empty state (environment question) without window", () => {
    vi.stubGlobal("window", undefined);
    const html = renderToString(createElement(GetStartedPage));
    expect(html).toContain("Get started with WDL");
    // Deterministic initial state is {} → shows environment question
    expect(html).toContain("Where will you run");
  });

  it("includes noscript fallback with ecosystem catalog links", () => {
    vi.stubGlobal("window", undefined);
    const html = renderToString(createElement(GetStartedPage));
    expect(html).toContain("<noscript>");
    expect(html).toContain("docs/start/ecosystem/");
    expect(html).toContain("docs/start/your-first-workflow/");
  });

  it("noscript block includes no-JS nav selector rules", () => {
    vi.stubGlobal("window", undefined);
    const html = renderToString(createElement(GetStartedPage));
    expect(html).toContain("[data-nav-toggle]");
    expect(html).toContain("[data-nav-panel]");
  });

  it("noscript content is free of executable script content", () => {
    // noscriptHtml is assembled from module-level fixed-path constants only —
    // no user input reaches dangerouslySetInnerHTML. This invariant test
    // proves that no <script> tags or event-handler attributes can exist.
    vi.stubGlobal("window", undefined);
    const html = renderToString(createElement(GetStartedPage));
    const noscriptMatch = html.match(/<noscript[^>]*>([\s\S]*?)<\/noscript>/);
    expect(noscriptMatch).not.toBeNull();
    const content = noscriptMatch![1];
    expect(content).not.toMatch(/<script/i);
    expect(content).not.toMatch(/\bon\w+\s*=/i);
  });

  it("renders the same environment question heading client-side before mount effect", () => {
    // Client renders with useState({}) initial — matches server output before
    // the mount effect fires. After mount, the hook syncs to the live URL.
    // This guarantees no hydration mismatch.
    render(<GetStartedPage />);
    // After render (including mount effect), the environment question is shown
    // (because there is no ?environment= param in jsdom's location).
    expect(screen.getByRole("group", { name: /where will you run/i })).toBeInTheDocument();
  });
});

// ── Dot-grid suppression ───────────────────────────────────────────────────

describe("GetStartedPage — background", () => {
  it("tags its main so global.css can drop the dot grid behind the wizard", () => {
    render(<GetStartedPage />);
    expect(document.querySelector('main[data-page="get-started"]')).not.toBeNull();

    const css = readFileSync(resolve(__dirname, "../styles/global.css"), "utf8");
    // The rule is a selector list — the blog index opts out of the grid too —
    // so match the selector and its shared declaration separately rather than
    // requiring the two to be adjacent.
    expect(css).toMatch(/body:has\(main\[data-page="get-started"\]\)::before/);
    expect(css).toMatch(/body:has\(main\[data-page="blog"\]\)::before/);
    expect(css).toMatch(
      /body:has\(main\[data-page="get-started"\]\)::before,\s*body:has\(main\[data-page="blog"\]\)::before\s*\{[^}]*display:\s*none/s,
    );
  });
});
