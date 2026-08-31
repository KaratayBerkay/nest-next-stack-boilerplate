// Ported from next-js-boilerplate/src/app/v1/lang/forms/field-states/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/field-states/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/field-states/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.fieldStatesTitle",
      "examples.fieldStatesDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
