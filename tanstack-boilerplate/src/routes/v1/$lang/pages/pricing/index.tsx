// Ported from next-js-boilerplate/src/app/v1/lang/pages/skills/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PricingPageContent from "@/views/pages/pricing/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/pricing/")({
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
      "examples.pricingTitle",
      "examples.pricingDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <PricingPageContent initialTab={tab} initialFull={full === "1"} />;
}
