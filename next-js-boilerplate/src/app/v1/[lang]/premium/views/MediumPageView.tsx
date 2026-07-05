"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { exceptionHandler } from "@/lib/exception-handler";

export function MediumPageView() {
  const { toast } = useToast();
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

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await apiFetch("/api/premium/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      } else {
        const data = await res.json();
        const description = data.exc
          ? exceptionHandler(data)
          : data.error ?? `Error ${res.status}`;
        toast({ description, variant: "destructive" });
      }
    } catch {
      toast({ description: "Network error", variant: "destructive" });
    } finally {
      setLoadingStats(false);
    }
  };

  const loadGrowthStats = async () => {
    setLoadingGrowth(true);
    try {
      const res = await apiFetch("/api/gql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          : data.error ?? `Error ${res.status}`;
        toast({ description, variant: "destructive" });
      }
    } catch {
      toast({ description: "Network error", variant: "destructive" });
    } finally {
      setLoadingGrowth(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold text-brand">Premium Dashboard</h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={loadStats}
          disabled={loadingStats}
          className="self-start rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loadingStats ? "Loading..." : "Load premium stats"}
        </button>

        {stats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Total Users
              </p>
              <p className="mt-1 text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Active Users
              </p>
              <p className="mt-1 text-2xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Revenue
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
          onClick={loadGrowthStats}
          disabled={loadingGrowth}
          className="self-start rounded-lg bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-opacity hover:bg-brand/20 disabled:opacity-50"
        >
          {loadingGrowth ? "Loading..." : "Load growth stats"}
        </button>

        {growthStats && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                New Users (7d)
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.newUsersLast7Days}
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Total Posts
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.totalPosts}
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Total Friendships
              </p>
              <p className="mt-1 text-2xl font-bold">
                {growthStats.totalFriendships}
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Total Users
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
