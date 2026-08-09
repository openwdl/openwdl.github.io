import { docHref } from "../docs/docHref";
import styles from "./HomeHero.module.css";

function WorkflowSource() {
  return (
    <figure
      className={styles.source}
      role="region"
      aria-label="Example WDL workflow"
    >
      <figcaption className={styles.sourceHeader}>
        <span>workflow.wdl</span>
      </figcaption>
      <pre className={styles.sourceCode}>
        <span className={styles.lineNumbers} aria-hidden="true">
          {"1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13"}
        </span>
        <code>
          <span className={styles.keyword}>workflow</span>{" example {\n"}
          {"  "}
          <span className={styles.keyword}>input</span>{" {\n"}
          {"    "}
          <span className={styles.type}>Array[File]</span>{" inputs\n  }\n\n"}
          {"  "}
          <span className={styles.keyword}>scatter</span>{" (file "}
          <span className={styles.keyword}>in</span>{" inputs) {\n"}
          {"    "}
          <span className={styles.keyword}>call</span>{" process { file }\n  }\n\n"}
          {"  "}
          <span className={styles.keyword}>output</span>{" {\n"}
          {"    "}
          <span className={styles.type}>Array[File]</span>
          {" results = process.result\n  }\n}"}
        </code>
      </pre>
    </figure>
  );
}

function ExecutionGraph() {
  return (
    <svg
      className={styles.graph}
      viewBox="0 0 360 180"
      aria-hidden="true"
      focusable="false"
    >
      <text className={styles.graphAnnotation} x="103" y="10" textAnchor="middle">
        scatter
      </text>
      <text className={styles.graphAnnotation} x="257" y="10" textAnchor="middle">
        gather
      </text>
      <path
        className={styles.edge}
        data-scatter-edge
        d="M73 90 C103 90 103 30 133 30"
      />
      <path className={styles.edge} data-scatter-edge d="M73 90 H133" />
      <path
        className={styles.edge}
        data-scatter-edge
        d="M73 90 C103 90 103 150 133 150"
      />
      <path
        className={styles.edge}
        data-gather-edge
        d="M227 30 C257 30 257 90 287 90"
      />
      <path className={styles.edge} data-gather-edge d="M227 90 H287" />
      <path
        className={styles.edge}
        data-gather-edge
        d="M227 150 C257 150 257 90 287 90"
      />
      <path
        className={styles.traceEdge}
        d="M73 90 C103 90 103 30 133 30 M73 90 H133 M73 90 C103 90 103 150 133 150 M227 30 C257 30 257 90 287 90 M227 90 H287 M227 150 C257 150 257 90 287 90"
      />
      <g className={styles.node} transform="translate(5 78)">
        <rect width="68" height="24" />
        <text x="17" y="15">inputs</text>
      </g>
      <g className={styles.node} data-process-node transform="translate(133 18)">
        <rect width="94" height="24" />
        <text x="9" y="15">process · 01</text>
      </g>
      <g className={styles.node} data-process-node transform="translate(133 78)">
        <rect width="94" height="24" />
        <text x="9" y="15">process · 02</text>
      </g>
      <g className={styles.node} data-process-node transform="translate(133 138)">
        <rect width="94" height="24" />
        <text x="9" y="15">process · 03</text>
      </g>
      <g className={styles.node} transform="translate(287 78)">
        <rect width="68" height="24" />
        <text x="15" y="15">results</text>
      </g>
    </svg>
  );
}

/** Homepage introduction showing how WDL source becomes portable execution. */
export function HomeHero() {
  return (
    <header className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Workflow Description Language</p>
        <h1>
          <span className={styles.titleLine}>
            A human-readable description language
          </span>{" "}
          <span className={styles.titleLine}>
            for running workflows anywhere.
          </span>
        </h1>
        <p className={styles.lede}>
          WDL is an openly governed language for describing tasks, inputs,
          dependencies, and runtime requirements. Different execution engines
          can interpret the same description on laptops, clusters, and cloud
          platforms.
        </p>
        <div className={styles.links}>
          <a
            className={styles.primaryAction}
            href={docHref("/docs/start/overview/")}
          >
            Read the language guide
          </a>
          <a
            className={styles.secondaryAction}
            href="https://github.com/openwdl/wdl/blob/wdl-1.3/SPEC.md"
          >
            View the specification
          </a>
        </div>
      </div>
      <div className={styles.specimen}>
        <WorkflowSource />
        <div className={styles.graphPane}>
          <span className={styles.graphLabel}>Execution structure</span>
          <div className={styles.graphBody}>
            <ExecutionGraph />
          </div>
          <div className={styles.graphTargets} aria-label="Execution targets">
            <span>Local</span>
            <span>HPC</span>
            <span>Cloud</span>
          </div>
        </div>
      </div>
    </header>
  );
}
