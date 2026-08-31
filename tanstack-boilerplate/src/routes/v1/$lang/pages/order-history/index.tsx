// Ported from next-js-boilerplate/src/app/v1/lang/pages/order-history/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import OrderHistoryPageContent from "@/views/pages/order-history/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/order-history/")({
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
      "examples.orderHistoryTitle",
      "examples.orderHistoryDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <OrderHistoryPageContent initialTab={tab} initialFull={full === "1"} />;
}
