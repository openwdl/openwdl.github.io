import { Button } from "@openwdl/ui";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import type { SetupCatalog, OsId, EditorId } from "./catalog/types";
import type { SetupState, WizardStage } from "./model/types";
import type { WizardHistory } from "./model/history";
import type { WizardOption } from "./components/WizardQuestion";
import { useSetupWizard } from "./useSetupWizard";
import { WizardProgress } from "./components/WizardProgress";
import { WizardQuestion } from "./components/WizardQuestion";
import { WizardResult } from "./components/WizardResult";
import { InstallChecklist } from "./components/InstallChecklist";
import { WizardQuestionScreen } from "./WizardQuestionScreen";
import styles from "./components/Wizard.module.css";

// ── Stage metadata ────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<WizardStage, string> = {
  environment: "Environment",
  engine: "Engine",
  editor: "Editor",
  install: "Install",
};

const STAGE_NUMBERS: Record<WizardStage, 1 | 2 | 3 | 4> = {
  environment: 1,
  engine: 2,
  editor: 3,
  install: 4,
};

// ── Props ─────────────────────────────────────────────────────────────────────

/** Props for {@link GetStartedWizard}. */
export interface GetStartedWizardProps {
  /** The full vetted setup catalog. */
  catalog: SetupCatalog;
  /** The history adapter used for URL synchronisation. */
  history: WizardHistory;
}

// ── GetStartedWizard ──────────────────────────────────────────────────────────

/**
 * Interactive multi-step setup wizard.
 *
 * All wizard state is owned by {@link useSetupWizard}; this component is
 * responsible only for rendering, focus management, live announcements, and
 * the Start over confirmation disclosure.  No URL parsing or direct
 * `window.history` calls occur here.
 */
export function GetStartedWizard({ catalog, history }: GetStartedWizardProps) {
  const {
    state,
    screen,
    completedStages,
    notice,
    navCount,
    answer,
    continue: advance,
    back,
    startOver,
  } = useSetupWizard(catalog, history);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const headingRef = useRef<HTMLHeadingElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  // Widened to the kit Button's ref union; only `.focus()` is used.
  const startOverBtnRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  // Pending focus closure to execute after a DOM update (e.g. after the Start
  // over confirmation closes and the button re-mounts into the DOM).
  const pendingFocusRef = useRef<(() => void) | null>(null);

  // ── Local UI state ────────────────────────────────────────────────────────
  const [showConfirm, setShowConfirm] = useState(false);

  // Deferred focus: runs after every render to execute any pending focus
  // restoration so focus is applied in the same paint as the DOM update.
  // No dependency array — intentionally runs after every render so that focus
  // is restored regardless of which state update caused the re-render.
  useEffect(() => {
    if (pendingFocusRef.current) {
      pendingFocusRef.current();
      pendingFocusRef.current = null;
    }
  });

  // ── Focus + live region on screen transitions ─────────────────────────────
  // `navCount` increments only on user-initiated or popstate transitions —
  // never on mount or mount-sync. `screen` is included so the effect always
  // reads the current stage label; the navCount === 0 guard still prevents
  // focus and announcement on initial render and bookmark-restore.
  useEffect(() => {
    if (navCount === 0) return; // skip initial render and mount-sync
    headingRef.current?.focus();
    if (liveRef.current) {
      const label = STAGE_LABELS[screen.stage];
      const num = STAGE_NUMBERS[screen.stage];
      liveRef.current.textContent = `${label}, stage ${num} of 4`;
    }
  }, [navCount, screen]);

  // ── Escape to close Start over confirmation ───────────────────────────────
  useEffect(() => {
    if (!showConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowConfirm(false);
        pendingFocusRef.current = () => startOverBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showConfirm]);

  // ── Editor options (derived from catalog) ─────────────────────────────────
  const editorOptions = useMemo(
    (): WizardOption<EditorId>[] =>
      (Object.values(catalog.editors) as typeof catalog.editors[EditorId][])
        .filter((ed) => ed.eligible)
        .map((ed) => ({
          value: ed.id,
          label: ed.label,
          description: ed.verification,
        })),
    [catalog],
  );

  // ── OS options filtered by selected editor ────────────────────────────────
  const osOptions = useMemo((): WizardOption<OsId>[] => {
    const allOs: WizardOption<OsId>[] = [
      { value: "macos", label: "macOS", description: "Apple macOS (M-series or Intel)." },
      { value: "linux", label: "Linux", description: "Any mainstream Linux distribution." },
      {
        value: "windows-wsl",
        label: "Windows (WSL 2)",
        description: "Windows Subsystem for Linux 2.",
      },
    ];
    if (!state.editor) return allOs;
    const supported = catalog.editors[state.editor]?.supportedOs ?? [];
    return allOs.filter((opt) => supported.includes(opt.value));
  }, [catalog, state.editor]);

  // ── Start over handlers ───────────────────────────────────────────────────
  const handleStartOver = useCallback(() => setShowConfirm(true), []);

  const handleConfirmStartOver = useCallback(() => {
    startOver();
    setShowConfirm(false);
  }, [startOver]);

  const handleCancelStartOver = useCallback(() => {
    setShowConfirm(false);
    // Defer focus until after re-render when the Start over button re-mounts.
    pendingFocusRef.current = () => startOverBtnRef.current?.focus();
  }, []);

  const hasAnswers = Object.keys(state).length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.wizard}>
      {/* Polite live region for screen-transition announcements. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        ref={liveRef}
        className={styles.srOnly}
      />

      {/* Normalisation notice — shown when the initial URL had invalid params. */}
      {notice && (
        <p role="alert" className={styles.notice}>
          {notice}
        </p>
      )}

      <WizardProgress current={screen.stage} completed={completedStages} />

      <div className={styles.card}>
        {screen.kind === "question" && screen.key !== "editor" && (
          <WizardQuestionScreen
            screen={screen}
            state={state}
            osOptions={osOptions}
            headingRef={headingRef}
            onAnswer={answer}
            onContinue={advance}
            onBack={back}
          />
        )}

        {screen.kind === "question" && screen.key === "editor" && (
          <>
            {/* sr-only: focusable for screen transitions; WizardQuestion legend is the visible prompt */}
            <h2 ref={headingRef} tabIndex={-1} className={styles.srOnly}>
              {screen.heading}
            </h2>
            <WizardQuestion
              stage="editor"
              stageNumber={3}
              heading={screen.heading}
              description="We will provide plugin installation steps for your chosen editor."
              name="editor"
              validationLabel="editor"
              options={editorOptions}
              value={state.editor}
              onChange={(v) => answer("editor", v as EditorId)}
              onContinue={advance}
              onBack={back}
            />
          </>
        )}

        {screen.kind === "recommendation" && (
          <WizardResult
            screen={screen}
            engineLabel={catalog.engines[screen.engine].label}
            serviceLabel={
              screen.service ? catalog.services[screen.service]?.label : undefined
            }
            rationale={catalog.engines[screen.engine].rationale}
            prerequisites={
              screen.service
                ? (catalog.services[screen.service]?.securityPrerequisites ?? [])
                : []
            }
            engineUrl={catalog.engines[screen.engine].docsUrl}
            serviceUrl={
              screen.service ? catalog.services[screen.service]?.docsUrl : undefined
            }
            headingRef={headingRef}
            onContinue={advance}
            onBack={back}
          />
        )}

        {screen.kind === "unsupported" && (
          <WizardResult
            screen={screen}
            state={state}
            acceptedAnswers={buildAcceptedAnswers(state)}
            headingRef={headingRef}
            onBack={back}
          />
        )}

        {screen.kind === "checklist" && (
          <>
            <h2 ref={headingRef} tabIndex={-1} className={styles.checklistHeading}>
              Install your WDL setup
            </h2>
            <InstallChecklist steps={screen.steps} onBack={back} />
          </>
        )}
      </div>

      {/* Start over section (hidden when state is empty or confirmation is open) */}
      {hasAnswers && !showConfirm && (
        <div className={styles.startOver}>
          <Button
            ref={startOverBtnRef}
            type="button"
            variant="ghost"
            onClick={handleStartOver}
          >
            Start over
          </Button>
        </div>
      )}

      {showConfirm && (
        <div
          role="group"
          aria-label="Confirm start over"
          className={styles.startOverConfirm}
        >
          <p className={styles.startOverConfirmText}>
            All your answers will be cleared. Are you sure?
          </p>
          <div className={styles.startOverConfirmActions}>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmStartOver}
            >
              Yes, start over
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelStartOver}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Accepted answers ──────────────────────────────────────────────────────────

function buildAcceptedAnswers(
  state: SetupState,
): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  if (state.environment) rows.push({ label: "Environment", value: state.environment });
  if (state.scheduler) rows.push({ label: "Scheduler", value: state.scheduler });
  if (state.service) rows.push({ label: "Cloud service", value: state.service });
  if (state.selfHost !== undefined)
    rows.push({ label: "Self-host", value: String(state.selfHost) });
  return rows;
}
