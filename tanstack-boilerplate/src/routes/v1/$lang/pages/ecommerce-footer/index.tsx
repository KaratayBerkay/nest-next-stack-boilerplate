// Ported from next-js-boilerplate/src/app/v1/lang/pages/ecommerce-footer/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import EcommerceFooterPageContent from "@/views/pages/ecommerce-footer/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/ecommerce-footer/")({
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
      "examples.ecommerceFooterTitle",
      "examples.ecommerceFooterDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <EcommerceFooterPageContent initialTab={tab} initialFull={full === "1"} />;
}
