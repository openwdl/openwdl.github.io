import { useState, useRef, useEffect, useCallback } from "react";
import type MiniSearch from "minisearch";
import { FiSearch, FiX } from "react-icons/fi";
import { docHref } from "./docHref";
import styles from "./DocsSearch.module.css";

/** Fields stored in each MiniSearch result (matches storeFields in the index options). */
interface SearchRecord {
  id: string;
  title: string;
  description: string;
  section: string;
  url: string;
}

/** Manifest shape returned by the search manifest endpoint. */
interface SearchManifest {
  sections: Record<string, { filename: string; documentCount: number }>;
  gzipBytes: number;
}

/** A single search result item displayed in the listbox. */
interface SearchHit {
  id: string;
  title: string;
  url: string;
  section: string;
  snippet: SearchSnippet;
}

interface SearchSnippet {
  before: string;
  match: string;
  after: string;
  clippedStart: boolean;
  clippedEnd: boolean;
}

const MINISEARCH_OPTIONS = {
  fields: ["title", "description", "text"],
  storeFields: ["title", "description", "text", "section", "url"],
};

const LISTBOX_ID = "docs-search-listbox";
const SEARCH_EXAMPLES = ["tasks", "scatter", "read_json"] as const;

// Prepend BASE_URL so all search assets are base-relative (e.g. /brand/search/).
const SEARCH_BASE = import.meta.env.BASE_URL + "search/";

function getString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function getStrings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((item): item is string => typeof item === "string") : [];
}

function buildSnippet(
  text: string,
  fallback: string,
  searchTerms: readonly string[],
): SearchSnippet {
  const source = text || fallback;
  const lowerSource = source.toLocaleLowerCase();
  let match = "";
  let matchIndex = -1;

  for (const term of searchTerms) {
    const trimmed = term.trim();
    if (!trimmed) continue;
    const index = lowerSource.indexOf(trimmed.toLocaleLowerCase());
    if (index >= 0) {
      match = source.slice(index, index + trimmed.length);
      matchIndex = index;
      break;
    }
  }

  if (matchIndex < 0) {
    const plain = fallback || source;
    const clippedEnd = plain.length > 150;
    return {
      before: clippedEnd ? plain.slice(0, 147).trimEnd() : plain,
      match: "",
      after: "",
      clippedStart: false,
      clippedEnd,
    };
  }

  const maxBefore = 55;
  const maxAfter = 90;
  let start = Math.max(0, matchIndex - maxBefore);
  let end = Math.min(source.length, matchIndex + match.length + maxAfter);

  if (start > 0) {
    const nextSpace = source.indexOf(" ", start);
    if (nextSpace >= 0 && nextSpace < matchIndex) start = nextSpace + 1;
  }
  if (end < source.length) {
    const previousSpace = source.lastIndexOf(" ", end);
    if (previousSpace > matchIndex + match.length) end = previousSpace;
  }

  return {
    before: source.slice(start, matchIndex),
    match,
    after: source.slice(matchIndex + match.length, end),
    clippedStart: start > 0,
    clippedEnd: end < source.length,
  };
}

/**
 * Lazy search control for the OpenWDL documentation.
 *
 * Renders a trigger button at all times. On focus, click, or Cmd/Ctrl+K the
 * manifest is prefetched and the modal dialog opens. MiniSearch is dynamically
 * imported only when the user types a query so that neither MiniSearch nor any
 * search chunk appears in the initial bundle.
 *
 * Keyboard contract:
 * - Cmd/Ctrl+K — open from anywhere in the document
 * - Escape — close and restore focus to the trigger button
 * - ArrowDown / ArrowUp — move the active result
 * - Enter — navigate to the active result
 * - Tab / Shift+Tab — cycle focus within the modal dialog
 */
export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typed MiniSearch instances keyed by section name.
  const indexesRef = useRef<Map<string, MiniSearch<SearchRecord>>>(new Map());
  // Cached manifest; set once on first successful fetch.
  const manifestRef = useRef<SearchManifest | null>(null);
  // Inflight manifest promise (deduplicated); reset to null on failure to allow retry.
  const manifestPromiseRef = useRef<Promise<SearchManifest> | null>(null);
  // Incremented on every handleChange call; stale async results are discarded.
  const queryGenRef = useRef(0);

  /** Fetch the manifest; deduplicates concurrent calls and allows retry on failure. */
  const ensureManifest = useCallback(async (): Promise<SearchManifest> => {
    if (manifestRef.current) return manifestRef.current;
    if (!manifestPromiseRef.current) {
      manifestPromiseRef.current = (async () => {
        const res = await fetch(SEARCH_BASE + "manifest.json");
        if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
        const manifest = (await res.json()) as SearchManifest;
        manifestRef.current = manifest;
        return manifest;
      })().catch((err: unknown) => {
        manifestPromiseRef.current = null; // reset so the next call can retry
        throw err;
      });
    }
    return manifestPromiseRef.current;
  }, []);

  /** Start manifest loading eagerly; errors are surfaced on the next keystroke. */
  const prefetchManifest = useCallback(() => {
    ensureManifest().catch(() => {
      // Intentionally swallowed — surfaced when the user types.
    });
  }, [ensureManifest]);

  /** Load and cache one section chunk; no-op if already loaded. */
  const loadSection = useCallback(
    async (section: string, filename: string): Promise<void> => {
      if (indexesRef.current.has(section)) return;
      const url = SEARCH_BASE + filename;
      const [res, { default: MiniSearchClass }] = await Promise.all([
        fetch(url),
        import("minisearch"),
      ]);
      if (!res.ok) throw new Error(`Search chunk fetch failed: ${res.status}`);
      const jsonText = await res.text();
      const ms = MiniSearchClass.loadJSON<SearchRecord>(jsonText, MINISEARCH_OPTIONS);
      indexesRef.current.set(section, ms);
    },
    [],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
    setError(null);
    triggerRef.current?.focus();
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    prefetchManifest();
  }, [prefetchManifest]);

  // Focus the input whenever the dialog opens.
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Global search shortcuts.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        prefetchManifest();
      } else if (open && e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleClose, open, prefetchManifest]);

  async function runQuery(q: string) {
    // Always increment so any in-flight async work from a previous query is abandoned.
    const gen = ++queryGenRef.current;
    setQuery(q);
    setActiveIndex(-1);
    setError(null);

    if (!q.trim()) {
      setResults([]);
      return;
    }

    try {
      const manifest = await ensureManifest();
      if (gen !== queryGenRef.current) return; // superseded

      await Promise.all(
        Object.entries(manifest.sections).map(([section, info]) =>
          loadSection(section, info.filename),
        ),
      );
      if (gen !== queryGenRef.current) return; // superseded

      const merged: SearchHit[] = [];
      for (const [, ms] of indexesRef.current) {
        const hits = ms.search(q, { boost: { title: 3 }, fuzzy: 0.2, prefix: true });
        for (const h of hits) {
          const text = getString(h.text);
          const description = getString(h.description);
          merged.push({
            id: String(h.id),
            title: getString(h.title),
            url: getString(h.url),
            section: getString(h.section),
            snippet: buildSnippet(text, description, [q, ...getStrings(h.terms)]),
          });
        }
      }

      const seen = new Set<string>();
      const deduped = merged.filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });

      setResults(deduped.slice(0, 10));
    } catch (err) {
      if (gen !== queryGenRef.current) return; // don't surface errors from stale queries
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
      setResults([]);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    void runQuery(e.target.value);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      document
        .getElementById(`docs-search-result-${activeIndex}`)
        ?.querySelector<HTMLAnchorElement>("a")
        ?.click();
    }
  }

  function handleResultClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    setOpen(false);
    setActiveIndex(-1);
  }

  // Focus trap for the modal dialog.
  function handleDialogKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab") return;

    const dialog = e.currentTarget;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled])",
      ),
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <div className={styles.container}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label="Search docs"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={handleOpen}
        onFocus={prefetchManifest}
      >
        <FiSearch
          className={styles.searchIcon}
          aria-hidden="true"
          focusable="false"
        />
        <span>Search documentation…</span>
        <kbd className={styles.kbd}>
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Search documentation"
          aria-modal="true"
          className={styles.dialog}
          onKeyDown={handleDialogKeyDown}
        >
          <div className={styles.inputRow}>
            <FiSearch
              className={styles.dialogSearchIcon}
              aria-hidden="true"
              focusable="false"
            />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-label="Search docs"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls={LISTBOX_ID}
              aria-activedescendant={
                activeIndex >= 0 ? `docs-search-result-${activeIndex}` : undefined
              }
              className={styles.input}
              placeholder="Search docs…"
              value={query}
              onChange={handleChange}
              onKeyDown={handleInputKeyDown}
            />
            <button
              type="button"
              className={styles.closeBtn}
              onClick={handleClose}
              aria-label="Close search"
            >
              <FiX aria-hidden="true" focusable="false" />
            </button>
          </div>

          {error !== null && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}

          {!query.trim() && error === null && (
            <div className={styles.emptyState}>
              <FiSearch aria-hidden="true" focusable="false" />
              <strong>Type anything to search</strong>
              <p>Search page titles, concepts, and WDL functions.</p>
              <div className={styles.examples} aria-label="Example searches">
                {SEARCH_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      void runQuery(example);
                      inputRef.current?.focus();
                    }}
                  >
                    <code>{example}</code>
                  </button>
                ))}
              </div>
            </div>
          )}

          <ul
            role="listbox"
            id={LISTBOX_ID}
            aria-label="Search results"
            className={styles.results}
          >
            {results.map((result, i) => (
              <li
                key={result.id}
                role="option"
                id={`docs-search-result-${i}`}
                aria-selected={i === activeIndex}
                className={styles.result}
              >
                <a
                  href={docHref(result.url)}
                  className={styles.resultLink}
                  onClick={handleResultClick}
                >
                  <span className={styles.resultTitle}>{result.title}</span>
                  <span className={styles.resultSection}>{result.section}</span>
                  <span className={styles.resultContext}>
                    {result.snippet.clippedStart && "…"}
                    {result.snippet.before}
                    {result.snippet.match && <mark>{result.snippet.match}</mark>}
                    {result.snippet.after}
                    {result.snippet.clippedEnd && "…"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
