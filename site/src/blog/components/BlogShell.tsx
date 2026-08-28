import type { ReactNode } from "react";
import { Footer, NavBar, ToastProvider } from "@openwdl/ui";

/** Shared site chrome for the blog index and article pages. */
export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <NavBar active="blog" />
      {children}
      <Footer />
    </ToastProvider>
  );
}
