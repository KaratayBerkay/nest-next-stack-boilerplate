import { type Dispatch, type SetStateAction } from "react";
import type {
  PremiumStats,
  PremiumGrowthStats,
  ToastFn,
} from "@/types/premium/PremiumPageView-types";
import type { I18nMessages } from "@/generated/i18n-messages";
import { fetchPremiumStatsServer } from "@/api/server/premium/stats";
import { fetchGrowthStatsServer } from "@/api/server/premium/growth-stats";
import { getToday } from "@/lib/date-time";

export async function loadPremiumStats(
  setLoadingStats: Dispatch<SetStateAction<boolean>>,
  setStats: Dispatch<SetStateAction<PremiumStats | null>>,
  toast: ToastFn,
  t: I18nMessages["premium"],
) {
  setLoadingStats(true);
  try {
    const data = (await fetchPremiumStatsServer()) as unknown as {
      stats: PremiumStats;
    };
    setStats(data.stats);
  } catch {
    toast({ description: t.networkError, variant: "destructive" });
  } finally {
    setLoadingStats(false);
  }
}

export async function loadPremiumGrowthStats(
  setLoadingGrowth: Dispatch<SetStateAction<boolean>>,
  setGrowthStats: Dispatch<SetStateAction<PremiumGrowthStats | null>>,
  toast: ToastFn,
  t: I18nMessages["premium"],
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

export function handleExportPremiumCSV(
  stats: PremiumStats | null,
  growthStats: PremiumGrowthStats | null,
  toast: ToastFn,
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
