import { Footer, NavBar, ToastProvider } from "@openwdl/ui";
import {
  FiCalendar,
  FiCpu,
  FiFileText,
  FiGitBranch,
  FiGithub,
  FiMessageCircle,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { docHref } from "../docs/docHref";
import { COMMUNITY_PATHS, type CommunityPath } from "./communityPaths";
import styles from "./CommunityPage.module.css";

const COMMUNITY_ICONS: Record<CommunityPath["id"], IconType> = {
  slack: FiMessageCircle,
  meetings: FiCalendar,
  workflows: FiGitBranch,
  contribute: FiGithub,
  engines: FiCpu,
  rfcs: FiFileText,
};

/** Presents concrete ways to participate in the OpenWDL community. */
export function CommunityPage() {
  return (
    <ToastProvider>
      <NavBar
        active="community"
        baseHref={import.meta.env.BASE_URL}
      />
      <main className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>OpenWDL community</p>
          <h1>A language maintained by the people who use it.</h1>
          <p>
            WDL grows through the questions, workflows, tools, tests, and
            proposals its community shares. Start wherever your experience can help.
          </p>
        </header>

        <section className={styles.involvement} aria-labelledby="participate-heading">
          <h2 id="participate-heading">Choose how you want to take part.</h2>
          <ul className={styles.gallery} aria-label="Ways to participate">
            {COMMUNITY_PATHS.map((path) => (
              <CommunityCard key={path.id} path={path} />
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </ToastProvider>
  );
}

function CommunityCard({ path }: { path: CommunityPath }) {
  const Icon = COMMUNITY_ICONS[path.id];

  return (
    <li className={styles.card}>
      <div
        className={`${styles.media} ${styles[path.id]}`}
        aria-hidden="true"
      />
      <div className={styles.cardBody}>
        <h3>{path.title}</h3>
        <p>{path.description}</p>
        <a href={path.external ? path.href : docHref(path.href)}>
          <Icon aria-hidden="true" />
          {path.action}
        </a>
      </div>
    </li>
  );
}
