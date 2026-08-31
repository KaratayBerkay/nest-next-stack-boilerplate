// Ported from next-js-boilerplate/src/app/v1/lang/pages/feature/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import FeaturePageContent from "@/views/pages/feature/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/feature/")({
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
      "examples.featureTitle",
      "examples.featureDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <FeaturePageContent initialTab={tab} initialFull={full === "1"} />;
}
