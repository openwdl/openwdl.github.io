import type { DocSection } from "../../scripts/docs/types";

/** Ordered section links displayed in the documentation sub-navigation. */
export const DOC_SECTIONS: readonly {
  key: Exclude<DocSection, "run">;
  label: string;
}[] = [
  { key: "learn", label: "Getting started" },
  { key: "reference", label: "Reference" },
];

const SECTION_LABELS: Record<DocSection, string> = {
  learn: "Getting started",
  write: "Getting started",
  run: "Run",
  reference: "Reference",
};

/** Returns the reader-facing label for a documentation section key. */
export function docSectionLabel(section: DocSection): string {
  return SECTION_LABELS[section];
}
