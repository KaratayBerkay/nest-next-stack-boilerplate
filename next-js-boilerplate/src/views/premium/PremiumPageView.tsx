"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  PremiumStats,
  PremiumGrowthStats,
} from "@/types/premium/PremiumPageView-types";
import { StatsSection } from "@/views/premium/StatsSection";
import { GrowthStatsSection } from "@/views/premium/GrowthStatsSection";
import {
  loadPremiumStats,
  loadPremiumGrowthStats,
  handleExportPremiumCSV,
} from "@/views/premium/premium-handlers";

export function PremiumPageView() {
  const { toast } = useToast();
  const t = useMessages("premium");
  const [stats, setStats] = useState<PremiumStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [growthStats, setGrowthStats] = useState<PremiumGrowthStats | null>(null);
  const [loadingGrowth, setLoadingGrowth] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <StatsSection
        stats={stats}
        loadingStats={loadingStats}
        onLoadStats={() => loadPremiumStats(setLoadingStats, setStats, toast, t)}
        onExportCSV={() => handleExportPremiumCSV(stats, growthStats, toast, t)}
        t={t}
      />
      <GrowthStatsSection
        growthStats={growthStats}
        loadingGrowth={loadingGrowth}
        onLoadGrowthStats={() =>
          loadPremiumGrowthStats(setLoadingGrowth, setGrowthStats, toast, t)
        }
        t={t}
      />
    </div>
  );
}
