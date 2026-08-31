// Ported from next-js-boilerplate/src/app/v1/lang/pages/magic-link/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import MagicLinkPageContent from "@/views/pages/magic-link/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/magic-link/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { tab?: string; full?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    full: typeof search.full === "string" ? search.full : undefined,
  }),
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "pages",
      "examples.magicLinkTitle",
      "examples.magicLinkDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <MagicLinkPageContent initialTab={tab} initialFull={full === "1"} />;
}
