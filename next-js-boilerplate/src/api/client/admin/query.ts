import { queryOptions } from "@tanstack/react-query";
import type { AuditLogParams } from "@/api/server/admin/audit-logs";
import type { AuditLogEntry } from "@/types/admin/AuditLog-types";

export interface AuditLogQueryResult {
  items: AuditLogEntry[];
  total: number;
}

async function fetchAuditLogs(params: AuditLogParams): Promise<AuditLogQueryResult> {
  const { fetchAuditLogsServer } = await import("@/api/server/admin/audit-logs");
  const data = await fetchAuditLogsServer(params);
  return { items: data.entries as unknown as AuditLogEntry[], total: data.total };
}

export function auditLogsQueryOptions(params: AuditLogParams) {
  return queryOptions({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => fetchAuditLogs(params),
  });
}
