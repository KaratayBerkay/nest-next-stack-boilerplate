"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { exceptionHandler } from "@/lib/exception-handler";

export function BasicPageView() {
  const { toast } = useToast();
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    revenue: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

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
    </div>
  );
}
