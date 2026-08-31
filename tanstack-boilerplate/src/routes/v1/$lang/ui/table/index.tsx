// Ported from next-js-boilerplate/src/app/v1/lang/ui/table/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/ui/table/PageContent";

export const Route = createFileRoute("/v1/$lang/ui/table/")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: ({ matches }) =>
    v1PageHead(matches, "ui", "tableTitle", "tableDescription"),
  component: Page,
});

function Page() {
  const { tab } = Route.useSearch();
  return <PageContent initialTab={tab} />;
}
