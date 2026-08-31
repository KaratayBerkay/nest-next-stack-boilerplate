// Ported from next-js-boilerplate/src/app/v1/lang/pages/product-search/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import ProductSearchPageContent from "@/views/pages/product-search/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/product-search/")({
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
      "examples.productSearchTitle",
      "examples.productSearchDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <ProductSearchPageContent initialTab={tab} initialFull={full === "1"} />;
}
