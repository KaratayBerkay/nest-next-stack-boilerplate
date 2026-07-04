"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { TierGate } from "@/components/TierGate";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { AccessDenied } from "@/components/AccessDenied";

export default function PremiumPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    revenue: number;
  } | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await apiFetch("/api/premium/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      } else {
        const data = await res.json();
        setStatsError(data.error ?? `Error ${res.status}`);
      }
    } catch {
      setStatsError("Network error");
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message="Sign in to view premium" />;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">Premium Dashboard</h2>

      <TierGate min="BASIC">
        <div className="flex flex-col gap-4">
          <button
            onClick={loadStats}
            disabled={loadingStats}
            className="bg-brand self-start rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loadingStats ? "Loading..." : "Load premium stats"}
          </button>

          {stats && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-border rounded-xl border p-4">
                <p className="text-muted text-xs font-medium uppercase tracking-wide">
                  Total Users
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="border-border rounded-xl border p-4">
                <p className="text-muted text-xs font-medium uppercase tracking-wide">
                  Active Users
                </p>
                <p className="mt-1 text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <div className="border-border rounded-xl border p-4">
                <p className="text-muted text-xs font-medium uppercase tracking-wide">
                  Revenue
                </p>
                <p className="mt-1 text-2xl font-bold">
                  ${stats.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {statsError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {statsError}
            </div>
          )}
        </div>
      </TierGate>
    </div>
  );
}
