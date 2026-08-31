import { apiFetchJson } from "@/lib/api-client";
import { ADMIN_AUDIT_LOGS_URL } from "@/constants/api/urls";
import type { AuditLogResponse } from "@/types/admin/AuditLog-types";

export interface AuditLogParams {
  take: number;
  skip: number;
  actionFilter?: string;
  levelFilter?: string;
  entityFilter?: string;
}

export async function fetchAuditLogsServer(
  params: AuditLogParams,
): Promise<AuditLogResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("take", String(params.take));
  searchParams.set("skip", String(params.skip));
  if (params.actionFilter) searchParams.set("action", params.actionFilter);
  if (params.levelFilter) searchParams.set("level", params.levelFilter);
  if (params.entityFilter) searchParams.set("entityType", params.entityFilter);

  return apiFetchJson<AuditLogResponse>(
    `${ADMIN_AUDIT_LOGS_URL}?${searchParams.toString()}`,
  );
}
