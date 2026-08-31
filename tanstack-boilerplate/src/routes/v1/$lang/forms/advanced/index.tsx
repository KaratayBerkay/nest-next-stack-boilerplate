// Ported from next-js-boilerplate/src/app/v1/lang/forms/advanced/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/advanced/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/advanced/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.advancedTitle",
      "examples.advancedDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
