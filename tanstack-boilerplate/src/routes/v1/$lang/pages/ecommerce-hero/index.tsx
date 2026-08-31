// Ported from next-js-boilerplate/src/app/v1/lang/pages/ecommerce-hero/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import EcommerceHeroPageContent from "@/views/pages/ecommerce-hero/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/ecommerce-hero/")({
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
      "examples.ecommerceHeroTitle",
      "examples.ecommerceHeroDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return (
    <EcommerceHeroPageContent initialTab={tab} initialFull={full === "1"} />
  );
}
