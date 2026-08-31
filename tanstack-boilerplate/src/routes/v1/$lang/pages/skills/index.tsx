// Ported from next-js-boilerplate/src/app/v1/lang/pages/skills/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import SkillsPageContent from "@/views/pages/skills/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/skills/")({
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
      "examples.skillsTitle",
      "examples.skillsDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <SkillsPageContent initialTab={tab} initialFull={full === "1"} />;
}
