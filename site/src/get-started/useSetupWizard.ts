import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { SetupState, WizardScreen, WizardStage } from "./model/types";
import type { SetupCatalog } from "./catalog/types";
import type { WizardHistory } from "./model/history";
import { getWizardScreen, pruneSetupState } from "./model/decide";
import { serializeSetupState, parseSetupSearch } from "./model/url";

// ── Types ─────────────────────────────────────────────────────────────────────

/** The full result returned by {@link useSetupWizard}. */
export interface UseSetupWizardResult {
  /** Current setup answers, including any uncommitted selection for the active screen. */
  state: SetupState;
  /** The wizard screen to render right now. */
  screen: WizardScreen;
  /** Stages that have been fully completed; drives {@link WizardProgress}. */
  completedStages: WizardStage[];
  /** Optional banner notice — set when the initial URL contained invalid parameters. */
  notice?: string;
  /**
   * Monotonically increasing counter that increments only on user-initiated or
   * popstate screen transitions, never on mount or mount-sync.  Components use
   * this to gate focus management and live-region announcements so that the
   * initial render and bookmark-restore do not steal focus.
   */
  navCount: number;
  /** Update the answer for `key` on the current screen. Does not advance the screen. */
  answer(key: keyof SetupState, value: SetupState[keyof SetupState]): void;
  /** Commit the current answers and advance to the next screen. */
  continue(): void;
  /** Go back one step, preserving compatible answers. */
  back(): void;
  /** Reset all answers and return to the first screen. */
  startOver(): void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Stable screen object for the UI-local editor-selection phase. */
const EDITOR_QUESTION_SCREEN: Extract<WizardScreen, { kind: "question" }> = {
  kind: "question",
  stage: "editor",
  key: "editor",
  heading: "Which editor will you use for WDL?",
};

const ALL_STAGES: readonly WizardStage[] = [
  "environment",
  "engine",
  "editor",
  "install",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Computes which stages should be shown as completed given the current screen
 * and whether we are in the UI-local editor-selection phase.
 */
function computeCompletedStages(
  screen: WizardScreen,
  editorPhase: boolean,
): WizardStage[] {
  if (editorPhase) {
    // We have passed the engine recommendation; environment + engine are done.
    return ["environment", "engine"];
  }
  const idx = ALL_STAGES.indexOf(screen.stage);
  return idx > 0 ? (ALL_STAGES.slice(0, idx) as WizardStage[]) : [];
}

/**
 * Computes the fallback state for {@link WizardHistory.back} when there is no
 * owned history entry to navigate back to.
 *
 * Returns the state with the deepest (most recently answered) key removed,
 * so the user lands on the screen that precedes their current position.
 */
function computeBackFallback(state: SetupState): SetupState {
  const next: SetupState = { ...state };
  if (next.os !== undefined) { delete next.os; return next; }
  if (next.editor !== undefined) { delete next.editor; return next; }
  if (next.selfHost !== undefined) { delete next.selfHost; return next; }
  if (next.service !== undefined) { delete next.service; return next; }
  if (next.scheduler !== undefined) { delete next.scheduler; return next; }
  if (next.environment !== undefined) { delete next.environment; return next; }
  return {};
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Orchestrates the multi-step setup wizard.
 *
 * The hook owns all mutable state; components use it exclusively for rendering
 * and call the returned action functions. No component calls `window.history`
 * or parses URLs directly.
 *
 * Architecture:
 * - `urlState` = the last committed state (what is / was in the URL).
 *   Used to compute the current screen via the pure state machine.
 * - `answers` = the current form state including any uncommitted selection for
 *   the active question. Starts equal to `urlState`; diverges briefly while
 *   the user is filling in a question. Reset to `urlState` on navigation.
 * - `editorPhase` = UI-local flag set after the user acknowledges the engine
 *   recommendation. The state machine does not emit an "editor" screen; the
 *   hook overrides `screen` with a synthetic editor question until the user
 *   commits an editor choice.
 * - `navCount` = increments on every user-initiated or popstate transition
 *   (never on mount or mount-sync).  Components gate focus and live-region
 *   updates on this value so the initial render does not steal focus.
 */
export function useSetupWizard(
  catalog: SetupCatalog,
  history: WizardHistory,
): UseSetupWizardResult {
  // Committed state (URL) — determines the current screen.
  // Starts as {} so the initial render is deterministic on both server and
  // client (SSR/hydration safe). The mount effect below syncs to the live URL.
  const [urlState, setUrlState] = useState<SetupState>({});
  // Uncommitted form answers for the currently active question.
  const [answers, setAnswers] = useState<SetupState>({});
  // UI-local phase: true between acknowledging the recommendation and committing an editor.
  const [editorPhase, setEditorPhase] = useState(false);
  // Optional normalisation notice shown when the initial URL had invalid params.
  const [notice, setNotice] = useState<string | undefined>();
  // Incremented on every user-initiated or popstate screen transition.
  // Never incremented on mount or mount-sync, so components can use it to
  // skip focus and live-region updates on the initial render.
  const [navCount, setNavCount] = useState(0);

  // ── Normalise on mount ────────────────────────────────────────────────────
  // Reads the live URL state, normalises it (strips invalid params), and
  // synchronises hook state. Uses a ref so the effect always accesses the
  // current adapter without becoming a dep that re-runs on every render —
  // this prevents infinite loops when callers create a fresh adapter per
  // render (e.g. inline in renderHook). The effect runs only once on mount.
  const historyRef = useRef(history);
  historyRef.current = history;

  useEffect(() => {
    const h = historyRef.current;
    const state = h.read();
    const changed = h.normalize(state);
    // Always sync — initial state was {} (deterministic baseline).
    setUrlState(state);
    setAnswers(state);
    if (changed) {
      setNotice(
        "Some parameters in the URL were not recognised and have been removed.",
      );
    }
  }, []); // mount-once; historyRef provides dependency-safe access to the adapter

  // ── Popstate subscription ─────────────────────────────────────────────────
  // Listens for browser back/forward navigation and synchronises hook state.
  // Merges prior `answers` with the newly committed URL state, then
  // re-validates through serializeSetupState + parseSetupSearch so that
  // incompatible descendants (e.g. a scheduler that belongs to a different
  // environment branch) are pruned immediately. Committed URL values always win.
  useEffect(() => {
    const unsubscribe = history.subscribe((newUrlState) => {
      setUrlState(newUrlState);
      setEditorPhase(false);
      setNavCount((n) => n + 1);
      setAnswers((prev) => {
        // Merge prior answers with committed URL state, then re-validate.
        const merged = { ...prev, ...newUrlState };
        const params = serializeSetupState(merged);
        const { state: pruned } = parseSetupSearch(params, catalog);
        // Committed URL values win over anything retained from prior answers.
        return { ...pruned, ...newUrlState };
      });
    });
    return unsubscribe;
  }, [history, catalog]);

  // ── Screen computation ────────────────────────────────────────────────────
  // The committed state (urlState) drives the pure state machine.
  // editorPhase overrides the screen to the UI-local editor question.
  const committedScreen = useMemo(
    () => getWizardScreen(urlState, catalog),
    [urlState, catalog],
  );

  const screen: WizardScreen = editorPhase ? EDITOR_QUESTION_SCREEN : committedScreen;

  const completedStages = useMemo(
    () => computeCompletedStages(screen, editorPhase),
    [screen, editorPhase],
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const answer = useCallback(
    (key: keyof SetupState, value: SetupState[keyof SetupState]) => {
      setAnswers((prev) => pruneSetupState(prev, key, value, catalog));
    },
    [catalog],
  );

  const advance = useCallback(() => {
    // Terminal screens have no next step — continue() is a no-op.
    if (committedScreen.kind === "checklist" || committedScreen.kind === "unsupported") {
      return;
    }

    if (committedScreen.kind === "recommendation" && !editorPhase) {
      // Acknowledge recommendation → enter UI-local editor phase.
      // No URL push: editor phase is not reflected in the URL.
      setEditorPhase(true);
      setNavCount((n) => n + 1);
      return;
    }

    if (editorPhase) {
      // Guard: editor must be selected before committing.
      if (answers.editor === undefined) return;
      // Commit answers (with editor) to URL and exit editor phase.
      history.push(answers);
      setUrlState(answers);
      setEditorPhase(false);
      setNavCount((n) => n + 1);
      return;
    }

    // Normal question: guard against committing without an answer.
    if (committedScreen.kind === "question" && answers[committedScreen.key] === undefined) {
      return; // required answer not yet selected
    }

    history.push(answers);
    setUrlState(answers);
    setNavCount((n) => n + 1);
  }, [history, committedScreen, editorPhase, answers]);

  const back = useCallback(() => {
    if (editorPhase) {
      // Back from editor phase → return to recommendation, clear uncommitted editor.
      setEditorPhase(false);
      setAnswers(urlState);
      setNavCount((n) => n + 1);
      return;
    }

    const fallback = computeBackFallback(urlState);
    const didNativeBack = history.back(fallback);

    if (!didNativeBack) {
      // Fallback path: replaceState was used (silent). Explicitly update the
      // committed state because there is no popstate notification to rely on.
      // Answers are preserved (same rationale as the subscription handler).
      setUrlState(fallback);
      setEditorPhase(false);
      setNavCount((n) => n + 1);
    }
    // Native back path: the popstate subscription handles urlState, editorPhase,
    // navCount, and answer merging.
  }, [history, urlState, editorPhase]);

  const startOver = useCallback(() => {
    history.normalize({});
    setUrlState({});
    setAnswers({});
    setEditorPhase(false);
    setNotice(undefined);
    // Treat reset as a real screen transition so the Environment h2 receives
    // focus and the live region announces "Environment, stage 1 of 4".
    setNavCount((n) => n + 1);
  }, [history]);

  return {
    state: answers,
    screen,
    completedStages,
    notice,
    navCount,
    answer,
    continue: advance,
    back,
    startOver,
  };
}
