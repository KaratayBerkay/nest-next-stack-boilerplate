"use client";

import { Button } from "@/components/ui/Button";
import { formatDateTimeByPreference } from "@/lib/date-time";
import type { AuditLogsTableProps } from "@/types/admin/audit-logs/AuditLogsTable-types";

const LEVEL_COLORS: Record<string, string> = {
  ERROR: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  WARN: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  INFO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DEBUG: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  TRACE: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
  FATAL: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export function AuditLogsTable({
  entries,
  total,
  page,
  setPage,
  totalPages,
  expandedId,
  setExpandedId,
  t,
  dateDisplay,
}: AuditLogsTableProps) {
  return (
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
  );
}
