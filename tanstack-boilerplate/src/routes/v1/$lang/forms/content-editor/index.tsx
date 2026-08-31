// Ported from next-js-boilerplate/src/app/v1/lang/forms/content-editor/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/content-editor/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/content-editor/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.contentEditorTitle",
      "examples.contentEditorDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
