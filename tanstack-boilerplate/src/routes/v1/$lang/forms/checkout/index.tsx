// Ported from next-js-boilerplate/src/app/v1/lang/forms/checkout/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/forms/checkout/PageContent";

export const Route = createFileRoute("/v1/$lang/forms/checkout/")({
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "forms",
      "examples.checkoutTitle",
      "examples.checkoutDescription",
    ),
  component: Page,
});

function Page() {
  return <PageContent />;
}
