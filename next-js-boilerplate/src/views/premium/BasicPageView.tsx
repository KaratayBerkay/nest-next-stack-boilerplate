"use client";

import { apiFetch } from "@/lib/api-client";
import {
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import { useToast } from "@/components/ui/Toast";
import { exceptionHandler } from "@/lib/exception-handler";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { PREMIUM_STATS_URL } from "@/constants/api/urls";

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

export function BasicPageView() {
  const { toast } = useToast();
  const t = useMessages("premium");
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    revenue: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

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
    </div>
  );
}
