"use client";

import type { StatsSectionProps } from "@/types/views/premium/StatsSection-types";
import { formatCurrency } from "@/lib/currency";

export function StatsSection({
  stats,
  loadingStats,
  onLoadStats,
  onExportCSV,
  hasGrowthStats,
  t,
}: StatsSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onLoadStats}
          disabled={loadingStats}
          className="bg-brand text-brand-fg self-start rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loadingStats ? t.loading : t.loadStats}
        </button>
        {stats && hasGrowthStats && onExportCSV && (
          <button
            onClick={onExportCSV}
            className="border-border text-muted hover:bg-surface-hover self-start rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            {t.exportCsv}
          </button>
        )}
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border-border rounded-xl border p-4">
            <p className="text-muted text-xs font-medium tracking-wide uppercase">
              {t.totalUsers}
            </p>
            <p className="mt-1 text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="border-border rounded-xl border p-4">
            <p className="text-muted text-xs font-medium tracking-wide uppercase">
              {t.activeUsers}
            </p>
            <p className="mt-1 text-2xl font-bold">{stats.activeUsers}</p>
          </div>
          <div className="border-border rounded-xl border p-4">
            <p className="text-muted text-xs font-medium tracking-wide uppercase">
              {t.revenue}
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(Math.round(stats.revenue * 100), "USD")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
