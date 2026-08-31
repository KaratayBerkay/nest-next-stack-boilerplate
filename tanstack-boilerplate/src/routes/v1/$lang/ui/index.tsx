// Ported from next-js-boilerplate/src/app/v1/lang/ui/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/ui/PageContent";

export const Route = createFileRoute("/v1/$lang/ui/")({
  head: ({ matches }) =>
    v1PageHead(matches, "ui", "pageTitle", "pageDescription"),
  component: Page,
});

function Page() {
  return <PageContent />;
}
