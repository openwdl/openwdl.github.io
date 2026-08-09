import { useEffect } from "react";

interface RedirectPageProps {
  to: string;
  replaceLocation?: (to: string) => void;
}

/** Client-side fallback for compatibility routes also redirected in static HTML. */
export function RedirectPage({ to, replaceLocation }: RedirectPageProps) {
  useEffect(() => {
    if (replaceLocation) {
      replaceLocation(to);
    } else {
      window.location.replace(to);
    }
  }, [replaceLocation, to]);

  return (
    <main>
      <p>
        This page has moved. <a href={to}>Continue to the new page</a>.
      </p>
    </main>
  );
}
