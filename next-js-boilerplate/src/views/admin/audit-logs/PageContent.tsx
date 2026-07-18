"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetchJson } from "@/lib/api-client";
import { IconEye, IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDateTimeByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { PageInfoButton } from "@/components/ui/page-info";
import { adminAuditLogsPageInfo } from "@/constants/page-info";
import { AccessDeniedPage } from "@/features/statics";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { ADMIN_AUDIT_LOGS_URL } from "@/constants/api/urls";
import type {
  AuditLogEntry,
  AuditLogResponse,
} from "@/types/admin/AuditLog-types";

const LEVEL_COLORS: Record<string, string> = {
  ERROR: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  WARN: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  INFO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DEBUG: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  TRACE: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
  FATAL: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export default function PageContent() {
  const { user } = useAuth();
  const t = useMessages("error");
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dateDisplay = useDateDisplayCookie();
  const pageSize = 50;

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const params = new URLSearchParams();
      params.set("take", String(pageSize));
      params.set("skip", String(page * pageSize));
      if (actionFilter) params.set("action", actionFilter);
      if (levelFilter) params.set("level", levelFilter);
      if (entityFilter) params.set("entityType", entityFilter);

      const data = await apiFetchJson<AuditLogResponse>(
        `${ADMIN_AUDIT_LOGS_URL}?${params.toString()}`,
      );
      setEntries(data.items);
      setTotal(data.total);
    } catch {
      setEntries([]);
      setTotal(0);
    } finally {
      setLoadingLogs(false);
    }
  }, [page, actionFilter, levelFilter, entityFilter]);

  useEffect(() => {
    if (isAdmin) loadLogs(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadLogs, isAdmin]);

  const totalPages = Math.ceil(total / pageSize);

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-brand text-sm font-semibold">Audit Log</h2>
        <AccessDeniedPage message={t.accessDenied} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconEye size={18} className="text-brand" />
          <h2 className="text-brand text-sm font-semibold">Audit Log</h2>
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
          <option value="">All actions</option>
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
          <option value="">All levels</option>
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
            placeholder="Entity type..."
            className="w-40 pl-7 text-xs"
          />
        </div>
      </div>

      {loadingLogs && (
        <p className="text-muted text-center text-xs">Loading...</p>
      )}

      {!loadingLogs && entries.length === 0 && (
        <p className="text-muted text-center text-xs">
          No audit log entries found.
        </p>
      )}

      {!loadingLogs && entries.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted border-border border-b">
                  <th className="py-2 pr-2 font-medium">Time</th>
                  <th className="py-2 pr-2 font-medium">Action</th>
                  <th className="py-2 pr-2 font-medium">Level</th>
                  <th className="py-2 pr-2 font-medium">Actor</th>
                  <th className="py-2 pr-2 font-medium">Entity</th>
                  <th className="py-2 pr-2 font-medium">Summary</th>
                  <th className="py-2 pr-2 font-medium">IP</th>
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
                        <span className="text-muted">system</span>
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
                          {expandedId === entry.id ? "Hide" : "Diff"}
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
            <p className="text-muted text-[10px]">{total} total entries</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </Button>
              <span className="text-muted text-[10px]">
                Page {page + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
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
                Change Details
              </h4>
              <div className="flex flex-col gap-4 sm:flex-row">
                {entry.before !== null && entry.before !== undefined && (
                  <div className="flex-1">
                    <p className="text-muted mb-1 text-[10px] font-medium">
                      Before
                    </p>
                    <pre className="bg-surface border-border max-h-48 overflow-auto rounded border p-2 text-[10px]">
                      {JSON.stringify(entry.before, null, 2)}
                    </pre>
                  </div>
                )}
                {entry.after !== null && entry.after !== undefined && (
                  <div className="flex-1">
                    <p className="text-muted mb-1 text-[10px] font-medium">
                      After
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
