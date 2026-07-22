"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { IconEye } from "@tabler/icons-react";
import { PageInfoButton } from "@/components/ui/page-info";
import { adminAuditLogsPageInfo } from "@/constants/page-info";
import { AccessDeniedPage } from "@/features/statics";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { auditLogsQueryOptions } from "@/api/client/admin/query";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { AuditLogsFilters } from "@/views/admin/audit-logs/AuditLogsFilters";
import { AuditLogsTable } from "@/views/admin/audit-logs/AuditLogsTable";
import { AuditLogsDiffView } from "@/views/admin/audit-logs/AuditLogsDiffView";
import type { ClassNameProps } from "@/types/ui/ClassName-types";

const PAGE_SIZE = 50;

export default function PageContent({ className }: ClassNameProps) {
  const { user } = useAuth();
  const t = useMessages("admin");
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dateDisplay = useDateDisplayCookie();

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const { data, isLoading: loadingLogs } = useQuery({
    ...auditLogsQueryOptions({
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      actionFilter: actionFilter || undefined,
      levelFilter: levelFilter || undefined,
      entityFilter: entityFilter || undefined,
    }),
    enabled: isAdmin,
  });

  const entries = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (!isAdmin) {
    return (
      <div className={`flex flex-col gap-4${className ? ` ${className}` : ""}`}>
        <h2 className="text-brand text-sm font-semibold">{t.auditLogTitle}</h2>
        <AccessDeniedPage message={t.accessDenied} />
      </div>
    );
  }

  const expandedEntry = expandedId
    ? entries.find((e) => e.id === expandedId) ?? null
    : null;

  return (
    <div className={`flex flex-col gap-6${className ? ` ${className}` : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconEye size={18} className="text-brand" />
          <h2 className="text-brand text-sm font-semibold">
            {t.auditLogTitle}
          </h2>
        </div>
        <PageInfoButton content={adminAuditLogsPageInfo} />
      </div>

      <AuditLogsFilters
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        entityFilter={entityFilter}
        setEntityFilter={setEntityFilter}
        setPage={setPage}
        t={t}
      />

      {loadingLogs && (
        <p className="text-muted text-center text-xs">{t.loading}</p>
      )}

      {!loadingLogs && entries.length === 0 && (
        <p className="text-muted text-center text-xs">{t.noEntriesFound}</p>
      )}

      {!loadingLogs && entries.length > 0 && (
        <AuditLogsTable
          entries={entries}
          total={total}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          t={t}
          dateDisplay={dateDisplay}
        />
      )}

      {expandedEntry && <AuditLogsDiffView entry={expandedEntry} t={t} />}
    </div>
  );
}
