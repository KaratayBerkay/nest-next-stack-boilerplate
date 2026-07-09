"use client";

import { apiFetch } from "@/lib/api-client";
import { useState, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { useToast } from "@/components/ui/Toast";
import { exceptionHandler } from "@/lib/exception-handler";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { PREMIUM_STATS_URL, GQL_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

async function loadStats(
  setLoadingStats: Dispatch<SetStateAction<boolean>>,
  setStats: Dispatch<SetStateAction<{
    totalUsers: number;
    activeUsers: number;
    revenue: number;
  } | null>>,
  toast: (opts: { description?: ReactNode; variant?: "default" | "destructive" | "success" }) => string,
  t: Record<string, string>,
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
        : data.error ?? t.errorStatus.replace("{status}", String(res.status));
      toast({ description, variant: "destructive" });
    }
  } catch {
    toast({ description: t.networkError, variant: "destructive" });
  } finally {
    setLoadingStats(false);
  }
}

async function loadGrowthStats(
  setLoadingGrowth: Dispatch<SetStateAction<boolean>>,
  setGrowthStats: Dispatch<SetStateAction<{
    totalUsers: number;
    newUsersLast7Days: number;
    totalPosts: number;
    totalFriendships: number;
  } | null>>,
  toast: (opts: { description?: ReactNode; variant?: "default" | "destructive" | "success" }) => string,
  t: Record<string, string>,
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
        : data.error ?? t.errorStatus.replace("{status}", String(res.status));
      toast({ description, variant: "destructive" });
    }
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
      <h2 className="text-sm font-semibold text-brand">{t.heading}</h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => loadStats(setLoadingStats, setStats, toast, t)}
          disabled={loadingStats}
          className="self-start rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loadingStats ? t.loading : t.loadStats}
        </button>

        {stats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {t.totalUsers}
              </p>
              <p className="mt-1 text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {t.activeUsers}
              </p>
              <p className="mt-1 text-2xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
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
          onClick={() => loadGrowthStats(setLoadingGrowth, setGrowthStats, toast, t)}
          disabled={loadingGrowth}
          className="self-start rounded-lg bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-opacity hover:bg-brand/20 disabled:opacity-50"
        >
          {loadingGrowth ? t.loading : t.loadGrowthStats}
        </button>

        {growthStats && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {t.newUsers7d}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.newUsersLast7Days}
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {t.totalPosts}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.totalPosts}
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {t.totalFriendships}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.totalFriendships}
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
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
