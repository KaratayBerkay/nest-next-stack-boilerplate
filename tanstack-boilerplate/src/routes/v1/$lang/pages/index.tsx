// Ported from next-js-boilerplate/src/app/v1/lang/pages/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/pages/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "pages",
      "gallery.pageTitle",
      "gallery.pageDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
