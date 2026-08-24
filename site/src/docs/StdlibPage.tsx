import { useCallback, useId, useMemo, useState, type ReactNode } from "react";
import { Badge, Code, CodeBlock } from "@openwdl/ui";
import type {
  CompiledDocPage,
  StdlibFunction,
  StdlibIndexEntry,
  StdlibParam,
} from "../../scripts/docs/types";
import { STDLIB_INDEX } from "../generated/docs.generated";
import { docHref } from "./docHref";
import styles from "./StdlibPage.module.css";

/** Inline markdown we honour inside parsed prose: `code` and **strong**. */
const INLINE_PATTERN = /`([^`]+)`|\*\*([^*]+)\*\*/g;

/**
 * Renders the small subset of inline markdown that survives stdlib parsing —
 * backtick code spans and `**strong**` runs — as real elements. The parsed
 * `description`, `params`, and `returns` text is raw markdown source, so
 * without this the cards would show literal backticks and asterisks.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const at = match.index;
    if (at > cursor) nodes.push(text.slice(cursor, at));
    const key = `${keyPrefix}-${at}`;
    if (match[1] !== undefined) {
      nodes.push(<Code key={key}>{match[1]}</Code>);
    } else {
      nodes.push(<strong key={key}>{renderInline(match[2], `${key}s`)}</strong>);
    }
    cursor = at + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

/**
 * Splits a WDL signature such as `Array[Int] range(Int)` around the function
 * name so the return type, name, and argument list can be styled apart. The
 * returned `args` keeps its parentheses.
 */
function splitSignature(
  signature: string,
  name: string,
): { returnType: string | null; args: string } {
  const open = signature.indexOf(`${name}(`);
  if (open < 0) return { returnType: null, args: "" };
  return {
    returnType: signature.slice(0, open).trim() || null,
    args: signature.slice(open + name.length),
  };
}

/** True when `needle` (already lowercased) hits a function's name, signature, or summary. */
function matchesQuery(fn: StdlibFunction, needle: string): boolean {
  if (fn.name.toLowerCase().includes(needle)) return true;
  if (fn.signatures.some((signature) => signature.toLowerCase().includes(needle))) return true;
  return fn.summary.toLowerCase().includes(needle);
}

/** Props for {@link Chevron}. */
interface ChevronProps {
  /** Extra class applied alongside the rotation transition class. */
  className?: string;
}

/** Drawn disclosure chevron; rotates when its `details` ancestor is open. */
function Chevron({ className }: ChevronProps) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 4.5 6 7.5 9 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Props for {@link ParamList}. */
interface ParamListProps {
  /** Entries to render as a definition list. */
  entries: readonly StdlibParam[];
  /** Term shown for entries with no declared type. */
  fallbackTerm: string;
  /** Class applied to the `dl`, selecting term treatment. */
  className: string;
  /** Key namespace, so two lists on one card cannot collide. */
  keyPrefix: string;
}

/** A tight `type → prose` definition list for parameters or returns. */
function ParamList({ entries, fallbackTerm, className, keyPrefix }: ParamListProps) {
  return (
    <dl className={className}>
      {entries.map((entry, index) => (
        <div className={styles.row} key={`${keyPrefix}-${index}`}>
          <dt>{entry.type ?? fallbackTerm}</dt>
          <dd>{renderInline(entry.text, `${keyPrefix}-${index}`)}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Props for {@link StdlibCard}. */
interface StdlibCardProps {
  /** The function to describe. */
  fn: StdlibFunction;
  /** Whether the example disclosure is expanded. */
  expanded: boolean;
  /** Called with the next expanded state when the disclosure toggles. */
  onToggle: (open: boolean) => void;
}

/**
 * One standard-library function as a card headed by its own signature(s).
 * Cards span the full article column so multi-signature variants each fit on
 * one line; the prose inside carries the reading measure.
 *
 * The card carries the function's original heading id, so `#select_first`
 * style deep links and the page outline keep resolving.
 */
function StdlibCard({ fn, expanded, onToggle }: StdlibCardProps) {
  return (
    <article id={fn.anchor} className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.signatures}>
          {fn.signatures.length === 0 ? (
            <span className={styles.signature}>
              <span className={styles.fnName}>{fn.name}</span>
            </span>
          ) : (
            fn.signatures.map((signature) => {
              const { returnType, args } = splitSignature(signature, fn.name);
              return (
                <span className={styles.signature} key={signature}>
                  {returnType !== null && <span className={styles.returnType}>{returnType} </span>}
                  <span className={styles.fnName}>{fn.name}</span>
                  <span className={styles.args}>{args}</span>
                </span>
              );
            })
          )}
        </h2>
        {fn.version !== null && (
          <Badge
            variant="accent"
            className={styles.version}
            title={`Added in WDL ${fn.version.replace(/^v/, "")}`}
          >
            {fn.version}
          </Badge>
        )}
      </header>

      {fn.description !== "" && (
        <p className={styles.description}>{renderInline(fn.description, `${fn.anchor}-d`)}</p>
      )}

      {fn.params.length > 0 && (
        <ParamList
          entries={fn.params}
          fallbackTerm="arg"
          className={styles.params}
          keyPrefix={`${fn.anchor}-p`}
        />
      )}
      {fn.returns.length > 0 && (
        <ParamList
          entries={fn.returns}
          fallbackTerm="returns"
          className={styles.returns}
          keyPrefix={`${fn.anchor}-r`}
        />
      )}

      {fn.example !== "" && (
        <details
          className={styles.example}
          open={expanded}
          onToggle={(event) => onToggle(event.currentTarget.open)}
        >
          <summary className={styles.summary}>
            <Chevron className={styles.chevron} />
            Example
          </summary>
          <div className={styles.exampleBody}>
            <CodeBlock code={fn.example} lang="wdl" />
          </div>
        </details>
      )}
    </article>
  );
}

/** Props for {@link StdlibPage}. */
export interface StdlibPageProps {
  /** The stdlib page to render; its `functions` replace the markdown body. */
  page: CompiledDocPage;
}

/**
 * Renders a standard-library reference page as searchable signature cards
 * instead of prose. Each function becomes one card headed by its signature,
 * with its availability badge, description, parameter and return lists, and a
 * collapsed example.
 *
 * The search field filters this page's cards live and additionally surfaces
 * matches from every other stdlib page via `STDLIB_INDEX`, which answers the
 * "which page is `select_first` on?" question without leaving the page.
 *
 * Nothing here touches `window` or `document` during render, so the page
 * prerenders unchanged through the SSR build.
 */
export function StdlibPage({ page }: StdlibPageProps) {
  const functions = page.functions ?? [];
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(functions.length > 0 ? [functions[0].anchor] : []),
  );

  const toggleExpanded = useCallback((anchor: string, open: boolean) => {
    setExpanded((current) => {
      if (current.has(anchor) === open) return current;
      const next = new Set(current);
      if (open) next.add(anchor);
      else next.delete(anchor);
      return next;
    });
  }, []);

  const needle = query.trim().toLowerCase();
  const filtering = needle !== "";

  const visible = useMemo(
    () => (filtering ? functions.filter((fn) => matchesQuery(fn, needle)) : functions),
    [filtering, functions, needle],
  );

  const elsewhere = useMemo<readonly StdlibIndexEntry[]>(
    () =>
      filtering
        ? STDLIB_INDEX.filter(
            (entry) => entry.pageSlug !== page.slug && matchesQuery(entry, needle),
          )
        : [],
    [filtering, needle, page.slug],
  );

  const nothingFound = filtering && visible.length === 0 && elsewhere.length === 0;
  const status = filtering
    ? `${visible.length} of ${functions.length} on this page` +
      (elsewhere.length > 0 ? `, ${elsewhere.length} on other pages` : "")
    : `${functions.length} functions on this page`;

  return (
    <div className={styles.root}>
      <div className={styles.search}>
        <label className={styles.searchLabel} htmlFor={searchId}>
          Filter functions
        </label>
        <input
          id={searchId}
          type="search"
          className={styles.searchInput}
          placeholder="Name, signature, or description…"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>
      </div>

      {!filtering && functions.length > 0 && (
        <nav className={styles.pills} aria-label="Functions on this page">
          {functions.map((fn) => (
            <a href={`#${fn.anchor}`} key={fn.anchor}>
              {fn.name}
            </a>
          ))}
        </nav>
      )}

      {nothingFound && (
        <div className={styles.empty}>
          <strong>No function matches “{query.trim()}”</strong>
          <p>
            Search by function name, by anything in a signature such as{" "}
            <Code>Array[X]</Code>, or by a word from the description.
          </p>
          <button type="button" className={styles.clear} onClick={() => setQuery("")}>
            Clear the filter
          </button>
        </div>
      )}

      {visible.map((fn) => (
        <StdlibCard
          key={fn.anchor}
          fn={fn}
          expanded={expanded.has(fn.anchor)}
          onToggle={(open) => toggleExpanded(fn.anchor, open)}
        />
      ))}

      {elsewhere.length > 0 && (
        <section className={styles.elsewhere} aria-labelledby={`${searchId}-elsewhere`}>
          <h2 className={styles.elsewhereTitle} id={`${searchId}-elsewhere`}>
            On other standard library pages
          </h2>
          <ul className={styles.elsewhereList}>
            {elsewhere.map((entry) => (
              <li key={`${entry.pageSlug}${entry.anchor}`}>
                <a href={`${docHref(entry.pageSlug)}#${entry.anchor}`}>
                  <span className={styles.elsewhereName}>{entry.name}</span>
                  <span className={styles.elsewhereSignature}>
                    {entry.signatures[0] ?? entry.summary}
                  </span>
                  <span className={styles.elsewherePage}>{entry.pageTitle}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
