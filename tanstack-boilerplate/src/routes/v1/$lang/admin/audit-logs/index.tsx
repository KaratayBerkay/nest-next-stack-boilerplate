// Ported from next-js-boilerplate/src/app/v1/lang/admin/audit-logs/page.tsx
import { createFileRoute } from "@tanstack/react-router";
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

function AuditLogsPage() {
  return <PageContent />;
}
