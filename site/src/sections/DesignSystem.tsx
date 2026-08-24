import {
  Badge,
  Button,
  ButtonGroup,
  Callout,
  Card,
  Code,
  CodeBlock,
  CopyButton,
  DownloadButton,
  IconButton,
  Link,
  useToast,
} from "@openwdl/ui";
import { FiExternalLink } from "react-icons/fi";
import { ChapterHeader } from "../components/ChapterHeader";
import styles from "./DesignSystem.module.css";

const exampleCode = "{ greeting }";

/** Curated component-family preview linking to the complete Storybook reference. */
export function DesignSystem() {
  const toast = useToast();

  return (
    <section id="design-system" className={styles.section}>
      <ChapterHeader
        number="06"
        label="Design system"
        title="Shared components apply the brand to interfaces."
      >
        <p>
          The component library turns the same palette, typography, spacing, and
          contrast rules into reusable interface foundations. These specimens
          show its range; Storybook documents every property, variant, state, and
          accessibility behavior.
        </p>
      </ChapterHeader>
      <div className={styles.content}>
        <div className={styles.families}>
          <Card className={styles.family}>
            <h3>Actions and links</h3>
            <ButtonGroup aria-label="Example actions">
              <Button size="sm">Primary action</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <IconButton label="Copy example" size="sm">⧉</IconButton>
            </ButtonGroup>
            <Link href="#downloads">Text link</Link>
          </Card>

          <Card className={styles.family}>
            <h3>Status and guidance</h3>
            <div className={styles.row}>
              <Badge variant="accent">WDL 1.3</Badge>
              <Badge variant="success">Ready</Badge>
              <Badge>Draft</Badge>
            </div>
            <Callout title="Usage note">
              Use callouts for information that changes how someone completes a task.
            </Callout>
          </Card>

          <Card className={styles.family}>
            <h3>Content and grouping</h3>
            <div className={styles.cards}>
              <Card><strong>Specification</strong><p>Read the language specification.</p></Card>
              <Card><strong>Documentation</strong><p>Learn through guides and examples.</p></Card>
            </div>
          </Card>

          <Card className={styles.family}>
            <h3>Code and utilities</h3>
            <div className={styles.row}>
              <Code>Array[File]</Code>
              <CopyButton value="Array[File]" label="WDL type" />
              <DownloadButton href={`${import.meta.env.BASE_URL}assets/svg/icon.svg`} filename="openwdl-icon.svg">
                Download
              </DownloadButton>
            </div>
            <CodeBlock code={exampleCode} lang="wdl" filename="hello.wdl" />
          </Card>

          <Card className={styles.family}>
            <h3>Feedback</h3>
            <p>Actions report completion through the page-level polite status region.</p>
            <Button size="sm" variant="secondary" onClick={() => toast("Example toast")}>
              Show toast
            </Button>
          </Card>

          <Card className={styles.family}>
            <h3>Shared site chrome</h3>
            <div className={styles.chrome} aria-label="Static site chrome preview">
              <span className={styles.mark}>OpenWDL</span>
              <span>Docs</span>
              <span>Blog</span>
              <span className={styles.chromeAction}>Get started</span>
            </div>
            <p>
              Canonical navigation and community links connect OpenWDL sites
              without duplicating global landmarks inside this specimen.
            </p>
          </Card>
        </div>
        <div className={styles.storybook}>
          <div>
            <span className={styles.eyebrow}>Complete component reference</span>
            <h3>Inspect every variant and interaction in Storybook.</h3>
            <p>Explore controls, responsive examples, themes, and accessibility behavior.</p>
          </div>
          <Button
            as="a"
            href="https://openwdl.github.io/ui/"
            variant="secondary"
            className={styles.storybookLink}
            leadingIcon={<FiExternalLink />}
          >
            Explore Storybook
          </Button>
        </div>
      </div>
    </section>
  );
}
