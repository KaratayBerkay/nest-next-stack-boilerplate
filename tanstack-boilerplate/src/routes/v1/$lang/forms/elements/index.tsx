// Ported from next-js-boilerplate/src/app/v1/lang/forms/elements/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/elements/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/elements/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.elementsTitle",
      "examples.elementsDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
