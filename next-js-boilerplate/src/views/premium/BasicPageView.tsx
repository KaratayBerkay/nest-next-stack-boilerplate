"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { formatCurrency } from "@/lib/currency";
import { loadPremiumStats } from "@/views/premium/premium-handlers";
import type { PremiumStats } from "@/types/premium/PremiumPageView-types";

export function BasicPageView() {
  const { toast } = useToast();
  const t = useMessages("premium");
  const [stats, setStats] = useState<PremiumStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">{t.heading}</h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => loadPremiumStats(setLoadingStats, setStats, toast, t)}
          disabled={loadingStats}
          className="bg-brand text-brand-fg self-start rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loadingStats ? t.loading : t.loadStats}
        </button>

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
    </div>
  );
}
