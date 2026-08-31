// Ported from next-js-boilerplate/src/app/v1/lang/pages/payment-methods/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PaymentMethodsPageContent from "@/views/pages/payment-methods/PageContent";

export const Route = createFileRoute("/v1/$lang/pages/payment-methods/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { tab?: string; full?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    full: typeof search.full === "string" ? search.full : undefined,
  }),
  head: ({ matches }) =>
    v1PageHead(
      matches,
      "pages",
      "examples.paymentMethodsTitle",
      "examples.paymentMethodsDescription",
    ),
  component: Page,
});

function Page() {
  const { tab, full } = Route.useSearch();
  return <PaymentMethodsPageContent initialTab={tab} initialFull={full === "1"} />;
}
