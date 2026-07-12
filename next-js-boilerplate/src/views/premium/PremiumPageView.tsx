"use client";

import { apiFetch } from "@/lib/api-client";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "@/components/ui/Toast";
import { exceptionHandler } from "@/lib/exception-handler";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import { getToday } from "@/lib/date-time";
import { PREMIUM_STATS_URL, GQL_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

async function loadPremiumStats(
  setLoadingStats: Dispatch<SetStateAction<boolean>>,
  setStats: Dispatch<
    SetStateAction<{
      totalUsers: number;
      activeUsers: number;
      revenue: number;
    } | null>
  >,
  toast: ReturnType<typeof useToast>["toast"],
  t: I18nMessages["premium"],
) {
  setLoadingStats(true);
  try {
    const res = await apiFetch(PREMIUM_STATS_URL);
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
    } else {
      const data = await res.json();
      const description = data.exc
        ? exceptionHandler(data)
        : (data.error ?? t.errorStatus.replace("{status}", String(res.status)));
      toast({ description, variant: "destructive" });
    }
  } catch {
    toast({ description: t.networkError, variant: "destructive" });
  } finally {
    setLoadingStats(false);
  }
}

async function loadPremiumGrowthStats(
  setLoadingGrowth: Dispatch<SetStateAction<boolean>>,
  setGrowthStats: Dispatch<
    SetStateAction<{
      totalUsers: number;
      newUsersLast7Days: number;
      totalPosts: number;
      totalFriendships: number;
    } | null>
  >,
  toast: ReturnType<typeof useToast>["toast"],
  t: I18nMessages["premium"],
) {
  setLoadingGrowth(true);
  try {
    const res = await apiFetch(GQL_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({
        query: `query { growthStats { totalUsers newUsersLast7Days totalPosts totalFriendships } }`,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setGrowthStats(data.data?.growthStats);
    } else {
      const data = await res.json();
      const description = data.exc
        ? exceptionHandler(data)
        : (data.error ?? t.errorStatus.replace("{status}", String(res.status)));
      toast({ description, variant: "destructive" });
    }
  } catch {
    toast({ description: t.networkError, variant: "destructive" });
  } finally {
    setLoadingGrowth(false);
  }
}

function handleExportPremiumCSV(
  stats: {
    totalUsers: number;
    activeUsers: number;
    revenue: number;
  } | null,
  growthStats: {
    totalUsers: number;
    newUsersLast7Days: number;
    totalPosts: number;
    totalFriendships: number;
  } | null,
  toast: ReturnType<typeof useToast>["toast"],
  t: I18nMessages["premium"],
) {
  if (!stats || !growthStats) {
    toast({ description: t.loadStatsFirst, variant: "destructive" });
    return;
  }
  const csv = [
    "Metric,Value",
    `${t.totalUsers},${stats.totalUsers}`,
    `${t.activeUsers},${stats.activeUsers}`,
    `${t.revenue},${stats.revenue}`,
    `${t.newUsers7d},${growthStats.newUsersLast7Days}`,
    `${t.totalPosts},${growthStats.totalPosts}`,
    `${t.totalFriendships},${growthStats.totalFriendships}`,
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `premium-stats-${getToday("only_date")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function PremiumPageView() {
  const { toast } = useToast();
  const t = useMessages("premium");
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    revenue: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [growthStats, setGrowthStats] = useState<{
    totalUsers: number;
    newUsersLast7Days: number;
    totalPosts: number;
    totalFriendships: number;
  } | null>(null);
  const [loadingGrowth, setLoadingGrowth] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">{t.heading}</h2>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              loadPremiumStats(setLoadingStats, setStats, toast, t)
            }
            disabled={loadingStats}
            className="bg-brand self-start rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loadingStats ? t.loading : t.loadStats}
          </button>
          {stats && growthStats && (
            <button
              onClick={() =>
                handleExportPremiumCSV(stats, growthStats, toast, t)
              }
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
                ${stats.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() =>
            loadPremiumGrowthStats(setLoadingGrowth, setGrowthStats, toast, t)
          }
          disabled={loadingGrowth}
          className="bg-brand/10 text-brand hover:bg-brand/20 self-start rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
        >
          {loadingGrowth ? t.loading : t.loadGrowthStats}
        </button>

        {growthStats && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border rounded-xl border p-4">
              <p className="text-muted text-xs font-medium tracking-wide uppercase">
                {t.newUsers7d}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.newUsersLast7Days}
              </p>
            </div>
            <div className="border-border rounded-xl border p-4">
              <p className="text-muted text-xs font-medium tracking-wide uppercase">
                {t.totalPosts}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.totalPosts}
              </p>
            </div>
            <div className="border-border rounded-xl border p-4">
              <p className="text-muted text-xs font-medium tracking-wide uppercase">
                {t.totalFriendships}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.totalFriendships}
              </p>
            </div>
            <div className="border-border rounded-xl border p-4">
              <p className="text-muted text-xs font-medium tracking-wide uppercase">
                {t.totalUsers}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.totalUsers}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
