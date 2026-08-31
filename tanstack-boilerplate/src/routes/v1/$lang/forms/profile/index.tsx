// Ported from next-js-boilerplate/src/app/v1/lang/forms/profile/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/profile/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/profile/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.profileTitle",
      "examples.profileDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
