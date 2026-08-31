import type { Tier } from "@/lib/tier";
import type { CurrencyCode } from "@/constants/currency";
import type { DateDisplayPreference } from "@/lib/date-time";

export interface PlanInfoCardProps {
  tier: Tier;
  periodEnd: string | undefined;
  cancelAtPeriodEnd: boolean;
  t: Record<string, string>;
  currency: CurrencyCode;
  dateDisplay: DateDisplayPreference;
  lang: string;
}
