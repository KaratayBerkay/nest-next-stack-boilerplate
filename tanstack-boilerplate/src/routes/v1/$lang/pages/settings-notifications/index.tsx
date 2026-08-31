// Ported from next-js-boilerplate/src/app/v1/lang/pages/settings-notifications/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import SettingsNotificationsPageContent from "@/views/pages/settings-notifications/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/settings-notifications/")({
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
      "examples.settingsNotificationsTitle",
      "examples.settingsNotificationsDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <SettingsNotificationsPageContent initialTab={tab} initialFull={full === "1"} />;
}
