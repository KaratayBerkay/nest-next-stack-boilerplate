import type { Metadata } from "next";
import PageContent from "@/views/admin/audit-logs/PageContent";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "View audit logs",
};

export default function AuditLogsPage() {
  return <PageContent />;
}
