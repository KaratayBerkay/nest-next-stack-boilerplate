// Ported from next-js-boilerplate/src/app/v1/lang/pages/compare/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import ComparePageContent from "@/views/pages/compare/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/compare/")({
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
      "examples.compareTitle",
      "examples.compareDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <ComparePageContent initialTab={tab} initialFull={full === "1"} />;
}
