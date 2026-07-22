"use client";

import type { PremiumGrowthStats } from "@/types/premium/PremiumPageView-types";
import type { I18nMessages } from "@/generated/i18n-messages";

interface GrowthStatsSectionProps {
  growthStats: PremiumGrowthStats | null;
  loadingGrowth: boolean;
  onLoadGrowthStats: () => void;
  t: I18nMessages["premium"];
}

export function GrowthStatsSection({
  growthStats,
  loadingGrowth,
  onLoadGrowthStats,
  t,
}: GrowthStatsSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onLoadGrowthStats}
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
  );
}
