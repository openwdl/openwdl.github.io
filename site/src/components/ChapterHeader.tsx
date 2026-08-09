import styles from "./ChapterHeader.module.css";

interface ChapterHeaderProps {
  number: string;
  label: string;
  title: string;
  children: React.ReactNode;
}

/** Shared heading and introduction for a numbered brand-guide chapter. */
export function ChapterHeader({
  number,
  label,
  title,
  children,
}: ChapterHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.number} aria-hidden>{number}</span>
      <div>
        <span className={styles.label}>{label}</span>
        <h2>{title}</h2>
        <div className={styles.lead}>{children}</div>
      </div>
    </header>
  );
}
