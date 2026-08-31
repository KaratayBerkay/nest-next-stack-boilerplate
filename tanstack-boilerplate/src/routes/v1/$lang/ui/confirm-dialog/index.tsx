// Ported from next-js-boilerplate/src/app/v1/lang/ui/confirm-dialog/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/ui/confirm-dialog/PageContent";

export const Route = createFileRoute("/v1/$lang/ui/confirm-dialog/")({
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: ({ matches }) =>
    v1PageHead(matches, "ui", "confirmDialogTitle", "confirmDialogDescription"),
  component: Page,
});

function Page() {
  const { tab } = Route.useSearch();
  return <PageContent initialTab={tab} />;
}
