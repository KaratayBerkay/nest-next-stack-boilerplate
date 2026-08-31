import type { PremiumStats } from "@/types/premium/PremiumPageView-types";
import type { I18nMessages } from "@/generated/i18n-messages";

export interface StatsSectionProps {
  stats: PremiumStats | null;
  loadingStats: boolean;
  onLoadStats: () => void;
  onExportCSV?: () => void;
  // handleExportPremiumCSV requires both stats and growth stats to be
  // loaded — without this, the Export button could appear (and be clicked)
  // as soon as `stats` alone was ready, then fail with "Load stats first"
  // even though the user had already done exactly that.
  hasGrowthStats?: boolean;
  t: I18nMessages["premium"];
}
