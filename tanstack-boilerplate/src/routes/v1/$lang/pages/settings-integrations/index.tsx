// Ported from next-js-boilerplate/src/app/v1/lang/pages/settings-integrations/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import SettingsIntegrationsPageContent from "@/views/pages/settings-integrations/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/settings-integrations/")({
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
      "examples.settingsIntegrationsTitle",
      "examples.settingsIntegrationsDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <SettingsIntegrationsPageContent initialTab={tab} initialFull={full === "1"} />;
}
