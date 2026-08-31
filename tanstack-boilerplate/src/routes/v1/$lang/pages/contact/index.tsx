// Ported from next-js-boilerplate/src/app/v1/lang/pages/contact/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import ContactPageContent from "@/views/pages/contact/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/contact/")({
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
      "examples.contactTitle",
      "examples.contactDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <ContactPageContent initialTab={tab} initialFull={full === "1"} />;
}
