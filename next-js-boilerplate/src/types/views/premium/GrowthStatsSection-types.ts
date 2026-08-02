import type { PremiumGrowthStats } from "@/types/premium/PremiumPageView-types";
import type { I18nMessages } from "@/generated/i18n-messages";

export interface GrowthStatsSectionProps {
  growthStats: PremiumGrowthStats | null;
  loadingGrowth: boolean;
  onLoadGrowthStats: () => void;
  t: I18nMessages["premium"];
}
