import GithubSlugger from "github-slugger";
import type { StdlibFunction, StdlibParam } from "./types";

/** Pull availability markers from the function index at the top of a page. */
function versionIndex(markdown: string): Map<string, string> {
  const versions = new Map<string, string>();
  const pattern = /^-\s+\[`([^`]+)`\]\(#[^)]+\)\s*`(v[\d.]+)`\s*$/gm;
  for (const match of markdown.matchAll(pattern)) versions.set(match[1], match[2]);
  return versions;
}

/** Return the content following a bold section label, up to the next label. */
function section(block: string, label: string): string {
  const lines = block.split("\n");
  const start = lines.findIndex((line) => line.trim() === `**${label}**`);
  if (start < 0) return "";
  const end = lines.findIndex(
    (line, index) => index > start && /^\*\*[A-Z][^*]*\*\*\s*$/.test(line.trim()),
  );
  return lines.slice(start + 1, end < 0 ? lines.length : end).join("\n").trim();
}

/** Extract WDL source from every fenced WDL block in a section. */
function fencedWdl(text: string): string[] {
  return [...text.matchAll(/```wdl\s*\n([\s\S]*?)```/g)].map((match) => match[1].trimEnd());
}

/** Parse numbered parameter or return entries, joining wrapped lines. */
function numberedEntries(text: string): StdlibParam[] {
  const entries: StdlibParam[] = [];
  const pattern = /^\d+\.\s+([\s\S]*?)(?=^\d+\.\s+|(?![\s\S]))/gm;
  for (const match of text.matchAll(pattern)) {
    const raw = match[1].replace(/\s*\n\s*/g, " ").trim();
    const typed = /^\*\*`([^`]+)`\*\*:\s*([\s\S]*)$/.exec(raw);
    entries.push({ type: typed?.[1] ?? null, text: (typed?.[2] ?? raw).trim() });
  }
  return entries;
}

/** Convert a prose description to one whitespace-normalised paragraph. */
function normaliseDescription(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/** Parse all standard-library functions from one reference page. */
export function parseStdlibFunctions(markdown: string): StdlibFunction[] {
  const versions = versionIndex(markdown);
  const slugger = new GithubSlugger();
  const functions: StdlibFunction[] = [];
  const headings = [...markdown.matchAll(/^##\s+(.+)\s*$/gm)];

  for (let index = 0; index < headings.length; index++) {
    const heading = headings[index];
    const headingText = heading[1].trim();
    const nameMatch = /^`([^`]+)`/.exec(headingText);
    if (!nameMatch) continue;
    const name = nameMatch[1];
    const start = heading.index + heading[0].length;
    const end = headings[index + 1]?.index ?? markdown.length;
    const block = markdown.slice(start, end);
    const signatureSection = section(block, "Signatures");
    const signatureSources = fencedWdl(signatureSection);
    const firstLabel = block.search(/^\s*\*\*(?:Signatures|Parameters|Returns|Example)\*\*\s*$/m);
    const descriptionBlock = firstLabel < 0 ? block : block.slice(0, firstLabel);
    const description = normaliseDescription(descriptionBlock.replace(/```wdl\s*\n[\s\S]*?```/g, ""));
    const signatures = signatureSources.flatMap((source) =>
      source.split("\n").map((line) => line.trim()).filter(Boolean),
    );
    const summary = (description.match(/^.*?[.!?](?:\s|$)/)?.[0] ?? description).trim();

    functions.push({
      name,
      anchor: slugger.slug(headingText.replace(/`([^`]+)`/g, "$1")),
      version: versions.get(name) ?? null,
      signatures,
      description,
      summary,
      params: numberedEntries(section(block, "Parameters")),
      returns: numberedEntries(section(block, "Returns")),
      example: fencedWdl(section(block, "Example"))[0] ?? "",
    });
  }
  return functions;
}
