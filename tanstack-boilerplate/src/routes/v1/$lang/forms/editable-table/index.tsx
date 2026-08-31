// Ported from next-js-boilerplate/src/app/v1/lang/forms/editable-table/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/editable-table/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/editable-table/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.editableTableTitle",
      "examples.editableTableDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
