// Ported from next-js-boilerplate/src/app/v1/lang/forms/billing/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/billing/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/billing/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.billingTitle",
      "examples.billingDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
