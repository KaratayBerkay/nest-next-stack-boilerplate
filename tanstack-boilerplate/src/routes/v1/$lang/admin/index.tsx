// Ported from next-js-boilerplate/src/app/v1/[lang]/admin/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/admin/PageContent";
import { AdminLoadingFallback } from "@/fallbacks";

export const Route = createFileRoute("/v1/$lang/admin/")({
  head: ({ matches }) => v1PageHead(matches, "admin", "title"),
  pendingComponent: AdminLoadingFallback,
  component: AdminPage,
});

function AdminPage() {
  return <PageContent />;
}
