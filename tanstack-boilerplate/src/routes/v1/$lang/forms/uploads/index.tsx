// Ported from next-js-boilerplate/src/app/v1/lang/forms/uploads/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/uploads/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/uploads/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.uploadsTitle",
      "examples.uploadsDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
