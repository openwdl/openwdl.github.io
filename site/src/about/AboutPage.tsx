import { Button, Footer, NavBar, ToastProvider } from "@openwdl/ui";
import { FiBookOpen, FiCompass, FiUsers } from "react-icons/fi";
import { docHref } from "../docs/docHref";
import styles from "./AboutPage.module.css";
import { HomeHero } from "./HomeHero";
import {
  ProblemIllustration,
  type ProblemIllustrationKind,
} from "./ProblemIllustration";

const problems = [
  [
    "Hard to understand",
    "Dependencies and data flow are implied by command order, filenames, and local conventions.",
    "understand",
  ],
  [
    "Hard to hand off",
    "The next person needs assumptions and context that the scripts do not carry with them.",
    "hand-off",
  ],
  [
    "Hard to scale",
    "More inputs require custom loops, batching, and bookkeeping around each step.",
    "scale",
  ],
  [
    "Hard to move",
    "Paths, queues, and installed software tie the analysis to one environment.",
    "move",
  ],
] as const satisfies ReadonlyArray<
  readonly [string, string, ProblemIllustrationKind]
>;

const milestones = [
  ["2012", "Early workflow-description tooling work begins at the Broad Institute."],
  ["2015", "Cromwell and evolving WDL drafts establish the task-and-workflow model."],
  ["2017", "OpenWDL forms to steward WDL as an open, community-governed standard."],
  ["2018", "WDL 1.0 becomes the official specification."],
  [
    "2021",
    "WDL 1.1 adds standard runtime attributes, JSON I/O, and struct literals.",
  ],
  [
    "2024",
    "WDL 1.2 adds directories, multi-line strings, requirements, and hints.",
  ],
  [
    "2026",
    "WDL 1.3 adds enums and improves type safety, retries, and cross-engine consistency.",
  ],
] as const;

/** OpenWDL home page: why WDL exists and how it became an open standard. */
export function AboutPage() {
  return (
    <ToastProvider>
      <NavBar
        baseHref={import.meta.env.BASE_URL}
      />
      <main className={styles.page}>
        <HomeHero />

        <section className={styles.section} aria-labelledby="workflow-problem">
          <p className={styles.eyebrow}>The problem</p>
          <h2 id="workflow-problem">
            In science, an analysis often outgrows the scripts that started it.
          </h2>
          <p>
            Scripts are a natural place to begin. As an analysis grows, its
            dependencies, data flow, parallel work, and resource needs become
            harder to see, while the details needed to run it spread across
            scripts, inputs, and platform configuration.
          </p>
          <div className={styles.problemGrid}>
            {problems.map(([title, description, illustration]) => (
              <article key={title} className={styles.problem}>
                <div className={styles.problemVisual}>
                  <ProblemIllustration kind={illustration} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.approach} aria-labelledby="wdl-approach">
          <div className={styles.approachLayout}>
            <div className={styles.approachLead}>
              <p className={styles.eyebrow}>The WDL approach</p>
              <h2 id="wdl-approach">Four principles shape WDL.</h2>
              <p>
                WDL is designed for the people who author analyses, the systems
                that execute them, and the community that evolves the standard.
                It describes workflow structure clearly, provides abstractions
                for common execution patterns, and leaves concrete run values
                and platform configuration to other tools.
              </p>
            </div>
            <div className={styles.principles}>
              <article className={styles.principleItem} data-principle="1">
                <h3>Human-readable and writable</h3>
                <p>
                  A concise, declarative grammar helps software engineers,
                  domain experts, and platform operators reason from the same
                  workflow description.
                </p>
              </article>
              <article className={styles.principleItem} data-principle="2">
                <h3>Powerful abstractions</h3>
                <p>
                  Typed inputs and outputs, explicit data dependencies,
                  conditionals, scatter-gather, runtime requirements,
                  containers, and imports express common workflow patterns
                  directly.
                </p>
              </article>
              <article className={styles.principleItem} data-principle="3">
                <h3>Portability</h3>
                <p>
                  A task or workflow that conforms to the WDL specification can
                  run on any platform supported by its execution engine. Editor
                  integrations and portability lints help authors avoid
                  environment-specific assumptions.
                </p>
              </article>
              <article className={styles.principleItem} data-principle="4">
                <h3>Open standard</h3>
                <p>
                  A public specification and open governance process let users
                  and implementers inspect, discuss, and contribute to how the
                  language evolves.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="wdl-origin">
          <p className={styles.eyebrow}>Where WDL came from</p>
          <h2 id="wdl-origin">Born in genomics.</h2>
          <p>
            WDL came out of the{" "}
            <a href="https://www.broadinstitute.org/">Broad Institute</a>,
            where genome-analysis pipelines had to run at scale and still make
            sense to the next person who picked them up.
          </p>
          <p className={styles.originContinuation}>
            Researchers across science face the same need. As WDL found users
            elsewhere, stewardship moved to{" "}
            <a href="https://github.com/openwdl">OpenWDL</a>. Changes to the
            specification are now discussed in public through the{" "}
            <a href="https://github.com/openwdl/governance/blob/main/RFC.md">
              RFC process
            </a>{" "}
            and community governance.
          </p>
        </section>

        <section className={styles.timelineSection} aria-labelledby="wdl-history">
          <p className={styles.eyebrow}>A short history</p>
          <h2 id="wdl-history">From an internal tool to an open standard.</h2>
          <ol className={styles.timeline} aria-label="WDL history">
            {milestones.map(([year, description]) => (
              <li key={year}>
                <time dateTime={year}>{year}</time>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.today} aria-labelledby="wdl-today">
          <p className={styles.eyebrow}>Where it is today</p>
          <h2 id="wdl-today">WDL today</h2>
          <p>
            WDL is a community-governed language with a formal specification,
            conformance-tested execution engines, and an ecosystem spanning
            local, HPC, and cloud execution.{" "}
            <a href="https://github.com/openwdl/wdl/releases/tag/v1.3.0">
              WDL 1.3.0
            </a>{" "}
            is the latest stable specification release.
          </p>
          <div className={styles.actions} aria-label="WDL resources">
            <Button
              as="a"
              href={docHref("/docs/start/your-first-workflow/")}
              variant="secondary"
              leadingIcon={<FiBookOpen />}
            >
              Start learning WDL
            </Button>
            <Button
              as="a"
              href={docHref("/docs/start/ecosystem/")}
              variant="secondary"
              leadingIcon={<FiCompass />}
            >
              Explore the WDL ecosystem
            </Button>
            <Button
              as="a"
              href={docHref("/community/")}
              variant="secondary"
              leadingIcon={<FiUsers />}
            >
              Meet the community
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </ToastProvider>
  );
}
