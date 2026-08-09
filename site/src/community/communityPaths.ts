/** A single community participation path with metadata for the gallery card. */
export interface CommunityPath {
  id: "slack" | "meetings" | "workflows" | "contribute" | "engines" | "rfcs";
  title: string;
  description: string;
  action: string;
  href: string;
  external: boolean;
}

const SLACK_INVITE =
  "https://join.slack.com/t/openwdl/shared_invite/zt-ctmj4mhf-cFBNgziCW88SvbhlHysZHA";

/**
 * The six concrete ways to participate in the OpenWDL community.
 * Order mirrors the narrative arc: conversation → contribution → governance.
 */
export const COMMUNITY_PATHS: readonly CommunityPath[] = [
  {
    id: "slack",
    title: "Join the conversation",
    description: "Ask questions and meet workflow authors and implementers on Slack.",
    action: "Join Slack",
    href: SLACK_INVITE,
    external: true,
  },
  {
    id: "meetings",
    title: "Attend a meeting",
    description: "Join Slack and ask in #general for current community meeting information.",
    action: "Find meeting information",
    href: SLACK_INVITE,
    external: true,
  },
  {
    id: "workflows",
    title: "Share workflows",
    description: "Publish examples and patterns that others can learn from and reuse.",
    action: "Explore community workflows",
    href: "/docs/start/ecosystem/#community-workflows",
    external: false,
  },
  {
    id: "contribute",
    title: "Improve docs and code",
    description: "Fix an issue, clarify a guide, or contribute a tool.",
    action: "Contribute on GitHub",
    href: "https://github.com/openwdl",
    external: true,
  },
  {
    id: "engines",
    title: "Build and test engines",
    description: "Strengthen portability through implementations and conformance testing.",
    action: "View execution engines",
    href: "/docs/start/ecosystem/#execution-engines",
    external: false,
  },
  {
    id: "rfcs",
    title: "Shape the specification",
    description: "Bring a proposal through the open RFC and governance process.",
    action: "Read the RFC process",
    href: "https://github.com/openwdl/governance/blob/main/RFC.md",
    external: true,
  },
];
