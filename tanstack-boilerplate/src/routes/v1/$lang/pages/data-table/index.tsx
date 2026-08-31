// Ported from next-js-boilerplate/src/app/v1/lang/pages/data-table/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import DataTablePageContent from "@/views/pages/data-table/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/data-table/")({
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
      "examples.dataTableTitle",
      "examples.dataTableDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <DataTablePageContent initialTab={tab} initialFull={full === "1"} />;
}
