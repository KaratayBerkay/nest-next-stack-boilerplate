// Ported from next-js-boilerplate/src/app/v1/lang/pages/crud-companies/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import CrudCompaniesPageContent from "@/views/pages/crud-companies/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/crud-companies/")({
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
      "examples.crudCompaniesTitle",
      "examples.crudCompaniesDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <CrudCompaniesPageContent initialTab={tab} initialFull={full === "1"} />;
}
