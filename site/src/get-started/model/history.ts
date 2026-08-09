import type { SetupState } from "./types";
import { serializeSetupState } from "./url";

/**
 * A browser-history adapter that synchronises wizard state with the URL.
 *
 * All interactions with the platform history API are performed through a
 * browser object injected at construction time so that the adapter can be
 * tested without a real browser.
 */
export interface WizardHistory {
  /**
   * Adds a new history entry for `state`.
   *
   * If the serialised `state` is identical to the current URL, the call is a
   * no-op to prevent history loops.
   */
  push(state: SetupState): void;

  /**
   * Replaces the current history entry with `state` without creating a new
   * entry.
   *
   * If the serialised `state` is identical to the current URL, the call is a
   * no-op.  When the current entry is adapter-owned, its depth marker is
   * preserved so that a subsequent `back()` can still use the native back.
   *
   * Returns `true` when the URL was actually changed, `false` when it was
   * already up-to-date (no-op).  Callers that need to detect normalisation
   * (e.g. to surface a notice) can use this return value without inspecting
   * the URL directly.
   *
   * Does **not** notify subscribers — mirrors the browser's `replaceState`
   * which does not fire `popstate`.
   */
  normalize(state: SetupState): boolean;

  /**
   * Navigates back.
   *
   * Calls the native `history.back()` only when the current history entry
   * carries the adapter-owned marker (i.e. it was pushed by this adapter).
   * Otherwise — including entries loaded via direct navigation or entries
   * where all adapter pushes have been backed through — replaces the current
   * URL with the serialised `fallback` instead.
   *
   * This check is read from `history.state` on every call so that external
   * browser navigation (user pressing the browser back/forward buttons) always
   * leaves the adapter in a consistent state without requiring an in-memory
   * counter.
   *
   * Returns `true` when the native back was taken (a `popstate` event will
   * fire asynchronously and notify subscribers).  Returns `false` when the
   * fallback `replaceState` path was used — no `popstate` fires and callers
   * must update their own state explicitly.
   */
  back(fallback: SetupState): boolean;

  /**
   * Returns the current setup state parsed from the URL without creating a
   * history entry or notifying subscribers.
   *
   * Callers use this to initialise wizard state on mount without relying on
   * a synthetic event.
   */
  read(): SetupState;

  /**
   * Subscribes `listener` to URL changes driven by `popstate` events.
   *
   * Each time a `popstate` fires, the current `location.search` is reparsed
   * via the `parse` function supplied to `createWizardHistory` and the
   * resulting state is forwarded to `listener`.
   *
   * Returns an unsubscribe function that removes the event listener.
   */
  subscribe(listener: (state: SetupState) => void): () => void;
}

/**
 * Collision-resistant marker key embedded in `history.state` for every entry
 * pushed by this adapter.  The `_v1` suffix allows a schema migration if
 * needed without colliding with a hypothetical legacy entry.
 *
 * The value is a positive integer depth (1, 2, 3 …) that increases with each
 * push.  Depth is stored so that forward navigation (user pressing browser
 * forward after going back) naturally restores the owned state from the
 * browser's own history stack.
 */
const OWNED_KEY = "__openwdl_wizard_v1" as const;

/** Shape of the `history.state` object written by this adapter. */
interface OwnedState {
  readonly [OWNED_KEY]: number;
}

/**
 * Returns `true` when `value` is a `history.state` object written by this
 * adapter — i.e. a non-null object with a positive integer under `OWNED_KEY`.
 * Any other value (null, plain number, foreign app state, etc.) returns false.
 */
function isOwned(value: unknown): value is OwnedState {
  return (
    typeof value === "object" &&
    value !== null &&
    OWNED_KEY in value &&
    typeof (value as Record<string, unknown>)[OWNED_KEY] === "number" &&
    (value as OwnedState)[OWNED_KEY] > 0
  );
}

/**
 * Creates a browser-backed {@link WizardHistory} adapter.
 *
 * @param browser - A minimal slice of the window object; history, location,
 *   and event registration. No access to the global `window` is performed
 *   inside this function.
 * @param parse - Converts `URLSearchParams` into a `SetupState`; called
 *   whenever a `popstate` event fires.
 */
export function createWizardHistory(
  browser: Pick<Window, "history" | "location" | "addEventListener" | "removeEventListener">,
  parse: (params: URLSearchParams) => SetupState,
): WizardHistory {
  // Monotonically increasing depth counter.  Each push receives a unique
  // positive depth that is stored in history.state.  Reading history.state at
  // call time means external browser navigation (back/forward) never
  // desynchronises the adapter — there is no fragile in-memory counter to
  // keep consistent.
  let nextDepth = 1;

  function toUrl(state: SetupState): string {
    const qs = serializeSetupState(state).toString();
    return qs.length > 0 ? `?${qs}` : "";
  }

  function isSameAsCurrent(state: SetupState): boolean {
    return toUrl(state) === browser.location.search;
  }

  return {
    push(state: SetupState): void {
      if (isSameAsCurrent(state)) return;
      const depth = nextDepth++;
      browser.history.pushState({ [OWNED_KEY]: depth }, "", toUrl(state));
    },

    normalize(state: SetupState): boolean {
      if (isSameAsCurrent(state)) return false;
      // Preserve the adapter marker when the current entry is owned so that
      // back() still recognises it after a normalize call.
      const currentState: unknown = browser.history.state;
      const histState: OwnedState | null = isOwned(currentState)
        ? { [OWNED_KEY]: currentState[OWNED_KEY] }
        : null;
      browser.history.replaceState(histState, "", toUrl(state));
      return true;
    },

    back(fallback: SetupState): boolean {
      // Read history.state at call time — robust against external navigation.
      if (isOwned(browser.history.state)) {
        browser.history.back();
        return true;
      } else {
        browser.history.replaceState(null, "", toUrl(fallback));
        return false;
      }
    },

    subscribe(listener: (state: SetupState) => void): () => void {
      const onPopstate = (): void => {
        const params = new URLSearchParams(browser.location.search);
        listener(parse(params));
      };
      browser.addEventListener("popstate", onPopstate);
      return () => {
        browser.removeEventListener("popstate", onPopstate);
      };
    },

    read(): SetupState {
      return parse(new URLSearchParams(browser.location.search));
    },
  };
}

/**
 * Creates a no-op {@link WizardHistory} adapter for server-side rendering.
 *
 * All reads return an empty state; all mutations are silent no-ops; the
 * subscriber list is never populated.  Use this adapter when `window` is
 * unavailable (e.g. during prerendering or unit tests that simulate an SSR
 * environment).  The wizard hook's mount effect synchronises to the live URL
 * after hydration, so the empty baseline never persists on the client.
 */
export function createStaticWizardHistory(): WizardHistory {
  return {
    push() {},
    normalize() { return false; },
    back() { return false; },
    subscribe() { return () => {}; },
    read() { return {}; },
  };
}
