import type { Href, Router } from "expo-router";

/** Clerk `finalize` navigate callback: activate session and go home (no `window` on native). */
export function buildAuthFinalize(router: Router) {
  return ({
    session,
    decorateUrl,
  }: {
    session: { currentTask?: unknown };
    decorateUrl: (url: string) => string;
  }) => {
    if (session?.currentTask) {
      console.warn("Clerk session task:", session.currentTask);
      return;
    }
    router.replace(decorateUrl("/") as Href);
  };
}
