"use client";

import {
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import { useToast } from "@/components/ui/Toast";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { fetchPremiumStatsServer } from "@/api/server/premium/stats";
import { fetchGrowthStatsServer } from "@/api/server/premium/growth-stats";

async function loadStats(
  setLoadingStats: Dispatch<SetStateAction<boolean>>,
  setStats: Dispatch<
    SetStateAction<{
      totalUsers: number;
      activeUsers: number;
      revenue: number;
    } | null>
  >,
  toast: (opts: {
    description?: ReactNode;
    variant?: "default" | "destructive" | "success";
  }) => string,
  t: Record<string, string>,
) {
  setLoadingStats(true);
  try {
    const data = await fetchPremiumStatsServer() as unknown as { stats: { totalUsers: number; activeUsers: number; revenue: number } };
    setStats(data.stats);
  } catch {
    toast({ description: t.networkError, variant: "destructive" });
  } finally {
    setLoadingStats(false);
  }
}

async function loadGrowthStats(
  setLoadingGrowth: Dispatch<SetStateAction<boolean>>,
  setGrowthStats: Dispatch<
    SetStateAction<{
      totalUsers: number;
      newUsersLast7Days: number;
      totalPosts: number;
      totalFriendships: number;
    } | null>
  >,
  toast: (opts: {
    description?: ReactNode;
    variant?: "default" | "destructive" | "success";
  }) => string,
  t: Record<string, string>,
) {
  setLoadingGrowth(true);
  try {
    const growthStats = await fetchGrowthStatsServer();
    setGrowthStats(growthStats);
  } catch {
    toast({ description: t.networkError, variant: "destructive" });
  } finally {
    setLoadingGrowth(false);
  }
}

export function MediumPageView() {
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
        <button
          onClick={() => loadStats(setLoadingStats, setStats, toast, t)}
          disabled={loadingStats}
          className="bg-brand self-start rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
                ${stats.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() =>
            loadGrowthStats(setLoadingGrowth, setGrowthStats, toast, t)
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
