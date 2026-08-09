import { CodeBlock } from "@openwdl/ui";
import type { ChecklistStep } from "../model/types";
import styles from "./Wizard.module.css";

/** Props for {@link InstallChecklist}. */
export interface InstallChecklistProps {
  /** The five ordered installation steps produced by {@link buildInstallChecklist}. */
  steps: ChecklistStep[];
  /** Called when the user presses Back. Omit to hide the Back button. */
  onBack?: () => void;
}

/** Returns true when `href` is an absolute http/https URL (external link). */
function isExternalUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Renders the five-step install checklist at the end of the setup wizard.
 *
 * Each step shows its title, prose instructions, and shell commands via
 * {@link CodeBlock}. When a step exposes multiple install options (e.g.
 * Homebrew and Cargo on macOS), all options are rendered side by side so the
 * user can choose without navigating away. Each install option's `upstreamUrl`
 * is rendered as a secure external link.
 *
 * The `first-workflow` step always links to the tutorial at
 * {@link FIRST_WORKFLOW_SLUG} via the links array produced by
 * {@link buildInstallChecklist}. That link is relative so it opens same-tab;
 * other http/https links open in a new tab with `noopener noreferrer`.
 */
export function InstallChecklist({ steps, onBack }: InstallChecklistProps) {
  return (
    <div className={styles.checklist}>
      <ol className={styles.checklistSteps}>
        {steps.map((step) => (
          <li key={step.id} className={styles.checklistStep}>
            <div className={styles.checklistStepBody}>
              <h3 className={styles.checklistStepTitle}>{step.title}</h3>

              {step.instructions.map((instruction, i) => (
                <p key={`${step.id}-instr-${i}`} className={styles.checklistInstruction}>
                  {instruction}
                </p>
              ))}

              {step.installOptions != null && step.installOptions.length > 0 ? (
                step.installOptions.map((opt) => (
                  <div key={opt.label} className={styles.installOption}>
                    <p className={styles.installOptionLabel}>{opt.label}</p>
                    {opt.prerequisites.length > 0 && (
                      <p className={styles.installOptionPrereqs}>
                        Requires: {opt.prerequisites.join(", ")}
                      </p>
                    )}
                    {opt.commands.map((cmd) => (
                      <CodeBlock
                        key={`${opt.label}-cmd-${cmd.command}`}
                        code={cmd.command}
                        lang={cmd.shell}
                      />
                    ))}
                    {opt.verification.map((cmd) => (
                      <CodeBlock
                        key={`${opt.label}-verify-${cmd.command}`}
                        code={cmd.command}
                        lang={cmd.shell}
                      />
                    ))}
                    {opt.upstreamUrl && (
                      <a
                        href={opt.upstreamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.checklistLink}
                      >
                        {opt.label} documentation
                      </a>
                    )}
                  </div>
                ))
              ) : (
                step.commands.map((cmd) => (
                  <CodeBlock
                    key={`${step.id}-cmd-${cmd.command}`}
                    code={cmd.command}
                    lang={cmd.shell}
                  />
                ))
              )}

              {step.links.length > 0 && (
                <div className={styles.checklistLinks}>
                  {step.links.map((link) => {
                    const external = isExternalUrl(link.href);
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        className={styles.checklistLink}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {onBack && (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onBack}
            className={styles.backButton}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
