"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api-client";
import { GQL_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

async function loadStats(
  setStats: Dispatch<SetStateAction<{ totalPosts: number; totalReactions: number; avgReactionsPerPost: number } | null>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  toast: ({ title, description, variant }: { title?: React.ReactNode; description?: React.ReactNode; variant?: "default" | "destructive" | "success" }) => string,
  t: Record<string, string>,
) {
  setLoading(true);
  try {
    const res = await apiFetch(GQL_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({
        query: `query { myPostStats { totalPosts totalReactions avgReactionsPerPost } }`,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setStats(data.data?.myPostStats);
    } else {
      const data = await res.json();
      toast({
        description: data.error ?? t.failedToLoadStats,
        variant: "destructive",
      });
    }
  } catch {
    toast({ description: t.networkError, variant: "destructive" });
  } finally {
    setLoading(false);
  }
}

export function PostStatsSidebar() {
  const t = useMessages("feed");
  const { toast } = useToast();
  const [stats, setStats] = useState<{
    totalPosts: number;
    totalReactions: number;
    avgReactionsPerPost: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="rounded-xl border border-border p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {t.yourPostStats}
      </h3>
      {!stats && (
        <button
          onClick={() => loadStats(setStats, setLoading, toast, t)}
          disabled={loading}
          className="w-full rounded-lg bg-brand/10 px-3 py-2 text-xs font-medium text-brand transition-colors hover:bg-brand/20 disabled:opacity-50"
        >
          {loading ? t.loading : t.loadStats}
        </button>
      )}
      {stats && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{t.posts}</span>
            <span className="text-sm font-bold">{stats.totalPosts}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{t.reactions}</span>
            <span className="text-sm font-bold">{stats.totalReactions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{t.avgPerPost}</span>
            <span className="text-sm font-bold">
              {stats.avgReactionsPerPost.toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
