// Ported from next-js-boilerplate/src/app/v1/lang/pages/cookie-banner/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import CookieBannerPageContent from "@/views/pages/cookie-banner/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/cookie-banner/")({
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
      "examples.cookieBannerTitle",
      "examples.cookieBannerDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <CookieBannerPageContent initialTab={tab} initialFull={full === "1"} />;
}
