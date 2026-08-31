// Ported from next-js-boilerplate/src/app/v1/lang/pages/process/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import ProcessPageContent from "@/views/pages/process/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/process/")({
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
      "examples.processTitle",
      "examples.processDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <ProcessPageContent initialTab={tab} initialFull={full === "1"} />;
}
