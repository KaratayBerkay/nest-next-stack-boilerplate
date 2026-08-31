// Ported from next-js-boilerplate/src/app/v1/lang/ui/menubar/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/ui/menubar/PageContent";

export const Route = createFileRoute("/v1/$lang/ui/menubar/")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: ({ matches }) =>
    v1PageHead(matches, "ui", "menubarTitle", "menubarDescription"),
  component: Page,
});

function Page() {
  const { tab } = Route.useSearch();
  return <PageContent initialTab={tab} />;
}
