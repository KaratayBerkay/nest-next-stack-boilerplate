// Ported from next-js-boilerplate/src/app/v1/lang/pages/product-specs/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import ProductSpecsPageContent from "@/views/pages/product-specs/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/product-specs/")({
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
      "examples.productSpecsTitle",
      "examples.productSpecsDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <ProductSpecsPageContent initialTab={tab} initialFull={full === "1"} />;
}
