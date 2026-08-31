"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import { formatDateTimeByPreference } from "@/lib/date-time";
import type { AuditLogsTableProps } from "@/types/admin/audit-logs/AuditLogsTable-types";

const LEVEL_VARIANTS: Record<string, BadgeVariant> = {
  ERROR: "error",
  WARN: "warning",
  INFO: "info",
  DEBUG: "secondary",
  TRACE: "secondary",
  FATAL: "error",
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.time}</TableHead>
            <TableHead>{t.action}</TableHead>
            <TableHead>{t.level}</TableHead>
            <TableHead>{t.actor}</TableHead>
            <TableHead>{t.entity}</TableHead>
            <TableHead>{t.summary}</TableHead>
            <TableHead>{t.ip}</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-muted whitespace-nowrap">
                {formatDateTimeByPreference(entry.createdAt, dateDisplay)}
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">
                {entry.action.replace(/_/g, " ")}
              </TableCell>
              <TableCell>
                <Badge variant={LEVEL_VARIANTS[entry.level] ?? "secondary"}>
                  {entry.level}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {entry.actor?.name ?? (
                  <span className="text-muted">{t.system}</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {entry.entityType}
                {entry.entityId && (
                  <span className="text-muted">
                    #{entry.entityId.slice(0, 8)}
                  </span>
                )}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {entry.summary ?? "-"}
              </TableCell>
              <TableCell className="text-muted font-mono whitespace-nowrap">
                {entry.ip ?? "-"}
              </TableCell>
              <TableCell>
                {Boolean(entry.before || entry.after) && (
                  <Button
                    variant="link"
                    size="xs"
                    onClick={() =>
                      setExpandedId(expandedId === entry.id ? null : entry.id)
                    }
                  >
                    {expandedId === entry.id ? t.hide : t.diff}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
