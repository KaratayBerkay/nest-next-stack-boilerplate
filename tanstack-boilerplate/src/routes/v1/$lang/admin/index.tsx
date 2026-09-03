// Ported from next-js-boilerplate/src/app/v1/[lang]/admin/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { isAdminRole } from "@/lib/auth/admin-role";
import { AccessDeniedPage } from "@/features/statics";
import { v1PageHead } from "@/lib/i18n/route-head";
import PageContent from "@/views/admin/PageContent";
import { AdminLoadingFallback } from "@/fallbacks";

export const Route = createFileRoute("/v1/$lang/admin/")({
  head: ({ matches }) => v1PageHead(matches, "admin", "title"),
  pendingComponent: AdminLoadingFallback,
  component: AdminPage,
});

const v1Route = getRouteApi("/v1/$lang");

// CROSS-039: role checked against the server-validated session user during
// SSR, so the admin tree is never rendered for a non-admin; PageContent keeps
// its own check as defense in depth.
function AdminPage() {
  const { user, messages } = v1Route.useLoaderData();
  if (!isAdminRole(user.role)) {
    return <AccessDeniedPage message={messages.admin.accessDenied} />;
  }
  return <PageContent />;
}
