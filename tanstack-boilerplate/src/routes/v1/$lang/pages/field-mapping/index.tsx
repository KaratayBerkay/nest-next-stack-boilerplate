// Ported from next-js-boilerplate/src/app/v1/lang/pages/field-mapping/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import FieldMappingPageContent from "@/views/pages/field-mapping/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/field-mapping/")({
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
      "examples.fieldMappingTitle",
      "examples.fieldMappingDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <FieldMappingPageContent initialTab={tab} initialFull={full === "1"} />;
}
