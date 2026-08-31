// Ported from next-js-boilerplate/src/app/v1/lang/ui/logo-spinner/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/ui/logo-spinner/PageContent";

export const Route = createFileRoute("/v1/$lang/ui/logo-spinner/")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: ({ matches }) =>
    v1PageHead(matches, "ui", "logoSpinnerTitle", "logoSpinnerDescription"),
  component: Page,
});

function Page() {
  const { tab } = Route.useSearch();
  return <PageContent initialTab={tab} />;
}
