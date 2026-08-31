// Ported from next-js-boilerplate/src/app/v1/lang/forms/team-invite/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/team-invite/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/team-invite/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.teamInviteTitle",
      "examples.teamInviteDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
