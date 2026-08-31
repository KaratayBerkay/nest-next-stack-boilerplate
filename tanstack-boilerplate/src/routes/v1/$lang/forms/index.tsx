// Ported from next-js-boilerplate/src/app/v1/lang/forms/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "gallery.pageTitle",
      "gallery.pageDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
