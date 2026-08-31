// Ported from next-js-boilerplate/src/app/v1/lang/pages/service/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import ServicePageContent from "@/views/pages/service/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/service/")({
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
      "examples.serviceTitle",
      "examples.serviceDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <ServicePageContent initialTab={tab} initialFull={full === "1"} />;
}
