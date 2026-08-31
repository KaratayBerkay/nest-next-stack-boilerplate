// Ported from next-js-boilerplate/src/app/v1/lang/pages/wishlist/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import WishlistPageContent from "@/views/pages/wishlist/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/wishlist/")({
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
      "examples.wishlistTitle",
      "examples.wishlistDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <WishlistPageContent initialTab={tab} initialFull={full === "1"} />;
}
