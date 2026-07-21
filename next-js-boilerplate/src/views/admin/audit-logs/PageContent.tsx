"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { IconEye, IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDateTimeByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { PageInfoButton } from "@/components/ui/page-info";
import { adminAuditLogsPageInfo } from "@/constants/page-info";
import { AccessDeniedPage } from "@/features/statics";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { auditLogsQueryOptions } from "@/api/client/admin/query";

const LEVEL_COLORS: Record<string, string> = {
  ERROR: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  WARN: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  INFO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DEBUG: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  TRACE: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
  FATAL: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export default function PageContent({ className }: { className?: string }) {
  const { user } = useAuth();
  const t = useMessages("admin");
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dateDisplay = useDateDisplayCookie();
  const pageSize = 50;

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const queryParams = {
    take: pageSize,
    skip: page * pageSize,
    actionFilter: actionFilter || undefined,
    levelFilter: levelFilter || undefined,
    entityFilter: entityFilter || undefined,
  };

  const { data, isLoading: loadingLogs } = useQuery({
    ...auditLogsQueryOptions(queryParams),
    enabled: isAdmin,
  });

  const entries = data?.items ?? [];
  const total = data?.total ?? 0;

  const totalPages = Math.ceil(total / pageSize);

  if (!isAdmin) {
    return (
      <div className={`flex flex-col gap-4${className ? ` ${className}` : ""}`}>
        <h2 className="text-brand text-sm font-semibold">{t.auditLogTitle}</h2>
        <AccessDeniedPage message={t.accessDenied} />
      </div>
    );
  }

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

      <div className="flex flex-wrap gap-3">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(0);
          }}
          className="border-border bg-surface text-fg rounded-lg border px-2 py-1.5 text-xs"
        >
          <option value="">{t.allActions}</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="LOGIN_FAILED">Login Failed</option>
          <option value="SIGNUP">Signup</option>
          <option value="EMAIL_VERIFIED">Email Verified</option>
          <option value="PASSWORD_CHANGED">Password Changed</option>
          <option value="MFA_ENABLED">MFA Enabled</option>
          <option value="MFA_DISABLED">MFA Disabled</option>
          <option value="ROLE_CHANGED">Role Changed</option>
          <option value="PERMISSION_GRANTED">Permission Granted</option>
          <option value="PERMISSION_REVOKED">Permission Revoked</option>
          <option value="EXPORT">Export</option>
          <option value="IMPORT">Import</option>
          <option value="API_KEY_CREATED">API Key Created</option>
          <option value="API_KEY_REVOKED">API Key Revoked</option>
        </select>

        <select
          value={levelFilter}
          onChange={(e) => {
            setLevelFilter(e.target.value);
            setPage(0);
          }}
          className="border-border bg-surface text-fg rounded-lg border px-2 py-1.5 text-xs"
        >
          <option value="">{t.allLevels}</option>
          <option value="TRACE">TRACE</option>
          <option value="DEBUG">DEBUG</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="FATAL">FATAL</option>
        </select>

        <div className="relative">
          <IconSearch
            size={14}
            stroke={1.5}
            className="text-muted pointer-events-none absolute top-1/2 left-2 z-10 -translate-y-1/2"
          />
          <Input
            type="text"
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(0);
            }}
            placeholder={t.entityType}
            className="w-40 pl-7 text-xs"
          />
        </div>
      </div>

      {loadingLogs && (
        <p className="text-muted text-center text-xs">{t.loading}</p>
      )}

      {!loadingLogs && entries.length === 0 && (
        <p className="text-muted text-center text-xs">{t.noEntriesFound}</p>
      )}

      {!loadingLogs && entries.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted border-border border-b">
                  <th className="py-2 pr-2 font-medium">{t.time}</th>
                  <th className="py-2 pr-2 font-medium">{t.action}</th>
                  <th className="py-2 pr-2 font-medium">{t.level}</th>
                  <th className="py-2 pr-2 font-medium">{t.actor}</th>
                  <th className="py-2 pr-2 font-medium">{t.entity}</th>
                  <th className="py-2 pr-2 font-medium">{t.summary}</th>
                  <th className="py-2 pr-2 font-medium">{t.ip}</th>
                  <th className="py-2 pr-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-border hover:bg-surface/50 border-b transition-colors"
                  >
                    <td className="text-muted py-2 pr-2 whitespace-nowrap">
                      {formatDateTimeByPreference(entry.createdAt, dateDisplay)}
                    </td>
                    <td className="py-2 pr-2 font-medium whitespace-nowrap">
                      {entry.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-2 pr-2">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          LEVEL_COLORS[entry.level] ?? ""
                        }`}
                      >
                        {entry.level}
                      </span>
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {entry.actor?.name ?? (
                        <span className="text-muted">{t.system}</span>
                      )}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {entry.entityType}
                      {entry.entityId && (
                        <span className="text-muted">
                          #{entry.entityId.slice(0, 8)}
                        </span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate py-2 pr-2">
                      {entry.summary ?? "-"}
                    </td>
                    <td className="text-muted py-2 pr-2 font-mono whitespace-nowrap">
                      {entry.ip ?? "-"}
                    </td>
                    <td className="py-2 pr-2">
                      {Boolean(entry.before || entry.after) && (
                        <Button
                          variant="link"
                          size="xs"
                          onClick={() =>
                            setExpandedId(
                              expandedId === entry.id ? null : entry.id,
                            )
                          }
                        >
                          {expandedId === entry.id ? t.hide : t.diff}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-muted text-[10px]">
              {t.totalEntries.replace("{total}", String(total))}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                {t.prev}
              </Button>
              <span className="text-muted text-[10px]">
                {t.pageOf
                  .replace("{page}", String(page + 1))
                  .replace("{totalPages}", String(totalPages || 1))}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                {t.next}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Expanded diff view */}
      {expandedId &&
        (() => {
          const entry = entries.find((e) => e.id === expandedId);
          if (!entry) return null;
          return (
            <div className="border-border mt-2 rounded-lg border p-4">
              <h4 className="text-fg mb-2 text-xs font-semibold">
                {t.changeDetails}
              </h4>
              <div className="flex flex-col gap-4 sm:flex-row">
                {entry.before !== null && entry.before !== undefined && (
                  <div className="flex-1">
                    <p className="text-muted mb-1 text-[10px] font-medium">
                      {t.before}
                    </p>
                    <pre className="bg-surface border-border max-h-48 overflow-auto rounded border p-2 text-[10px]">
                      {JSON.stringify(entry.before, null, 2)}
                    </pre>
                  </div>
                )}
                {entry.after !== null && entry.after !== undefined && (
                  <div className="flex-1">
                    <p className="text-muted mb-1 text-[10px] font-medium">
                      {t.after}
                    </p>
                    <pre className="bg-surface border-border max-h-48 overflow-auto rounded border p-2 text-[10px]">
                      {JSON.stringify(entry.after, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
