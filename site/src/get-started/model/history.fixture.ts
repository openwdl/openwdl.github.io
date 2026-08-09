import type { SetupState } from "./types";
import type { WizardHistory } from "./history";
import { SETUP_CATALOG } from "../catalog/catalog";
import { parseSetupSearch, serializeSetupState } from "./url";

/**
 * An in-memory implementation of {@link WizardHistory} for use in tests.
 *
 * Exposes an `entries` property that reflects the current history stack up to
 * the active position, giving tests a simple way to assert on navigation state
 * without a browser.
 */
export interface MemoryWizardHistory extends WizardHistory {
  /**
   * The history stack up to and including the current position.
   *
   * The first entry is always the initial state (parsed from the `search`
   * argument passed to {@link createMemoryWizardHistory}, or `{}` when
   * omitted).  Subsequent entries are appended by `push` and truncated when
   * `back` navigates to a previous position and a new `push` follows.
   */
  entries: SetupState[];
}

/**
 * Creates an in-memory {@link WizardHistory} suitable for unit and
 * orchestration tests.
 *
 * @param search - Optional URL search string (with or without a leading `?`)
 *   used to derive the initial state.  Entries that fail catalog validation
 *   are silently pruned just as they would be in the browser adapter.
 */
export function createMemoryWizardHistory(search?: string): MemoryWizardHistory {
  const searchStr =
    search !== undefined ? search.replace(/^\?/, "") : "";
  const initial: SetupState = parseSetupSearch(
    new URLSearchParams(searchStr),
    SETUP_CATALOG,
  ).state;

  // Full backing stack. Navigating back reduces `currentIndex` without
  // removing entries; a subsequent push truncates everything after the current
  // position before appending.
  const stack: SetupState[] = [initial];
  let currentIndex = 0;
  let pushCount = 0;
  const listeners = new Set<(state: SetupState) => void>();

  function notify(state: SetupState): void {
    for (const listener of listeners) listener(state);
  }

  function currentSearch(): string {
    return serializeSetupState(stack[currentIndex]).toString();
  }

  const history: MemoryWizardHistory = {
    get entries(): SetupState[] {
      return stack.slice(0, currentIndex + 1);
    },

    push(state: SetupState): void {
      const incoming = serializeSetupState(state).toString();
      if (incoming === currentSearch()) return; // no-op: same URL
      stack.splice(currentIndex + 1);
      stack.push(state);
      currentIndex++;
      pushCount++;
      // Intentionally silent — mirrors browser pushState which does not fire popstate.
    },

    normalize(state: SetupState): boolean {
      const incoming = serializeSetupState(state).toString();
      if (incoming === currentSearch()) return false; // no-op: already at this URL
      stack[currentIndex] = state;
      // Intentionally silent — mirrors browser replaceState which does not fire popstate.
      return true;
    },

    back(fallback: SetupState): boolean {
      if (pushCount > 0 && currentIndex > 0) {
        currentIndex--;
        pushCount--;
        // Modeled popstate: mirrors the browser adapter's popstate notification.
        notify(stack[currentIndex]);
        return true;
      } else {
        // Mirrors browser replaceState: silent, no subscriber notification.
        stack[currentIndex] = fallback;
        return false;
      }
    },

    subscribe(listener: (state: SetupState) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    read(): SetupState {
      return stack[currentIndex];
    },
  };

  return history;
}
