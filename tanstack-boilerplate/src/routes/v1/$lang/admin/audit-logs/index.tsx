// Ported from next-js-boilerplate/src/app/v1/lang/admin/audit-logs/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { isAdminRole } from "@/lib/auth/admin-role";
import { AccessDeniedPage } from "@/features/statics";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import PageContent from "@/views/admin/audit-logs/PageContent";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "View audit logs",
};

export const Route = createFileRoute("/v1/$lang/admin/audit-logs/")({
  head: () => metadataToHead(metadata),
  component: AuditLogsPage,
});

const v1Route = getRouteApi("/v1/$lang");

// CROSS-039: same server-validated role gate as /admin.
function AuditLogsPage() {
  const { user, messages } = v1Route.useLoaderData();
  if (!isAdminRole(user.role)) {
    return <AccessDeniedPage message={messages.admin.accessDenied} />;
  }
  return <PageContent />;
}
