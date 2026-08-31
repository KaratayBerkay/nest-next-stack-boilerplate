// Ported from next-js-boilerplate/src/app/v1/lang/forms/layouts/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/layouts/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/layouts/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.layoutsTitle",
      "examples.layoutsDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
