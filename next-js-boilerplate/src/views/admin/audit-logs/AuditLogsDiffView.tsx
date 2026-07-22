"use client";

import type { AuditLogsDiffViewProps } from "@/types/admin/audit-logs/AuditLogsDiffView-types";

export function AuditLogsDiffView({ entry, t }: AuditLogsDiffViewProps) {
  if (!entry.before && !entry.after) return null;

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
}
