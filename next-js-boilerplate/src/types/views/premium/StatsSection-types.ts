import type { PremiumStats } from "@/types/premium/PremiumPageView-types";
import type { I18nMessages } from "@/generated/i18n-messages";

export interface StatsSectionProps {
  stats: PremiumStats | null;
  loadingStats: boolean;
  onLoadStats: () => void;
  onExportCSV?: () => void;
  t: I18nMessages["premium"];
}
