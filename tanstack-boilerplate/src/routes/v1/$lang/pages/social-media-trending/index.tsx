// Ported from next-js-boilerplate/src/app/v1/lang/pages/social-media-trending/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import SocialMediaTrendingPageContent from "@/views/pages/social-media-trending/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/social-media-trending/")({
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
      "examples.socialMediaTrendingTitle",
      "examples.socialMediaTrendingDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <SocialMediaTrendingPageContent initialTab={tab} initialFull={full === "1"} />;
}
