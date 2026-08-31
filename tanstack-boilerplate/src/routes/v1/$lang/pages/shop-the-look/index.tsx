// Ported from next-js-boilerplate/src/app/v1/lang/pages/shop-the-look/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import ShopTheLookPageContent from "@/views/pages/shop-the-look/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/shop-the-look/")({
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
      "examples.shopTheLookTitle",
      "examples.shopTheLookDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <ShopTheLookPageContent initialTab={tab} initialFull={full === "1"} />;
}
