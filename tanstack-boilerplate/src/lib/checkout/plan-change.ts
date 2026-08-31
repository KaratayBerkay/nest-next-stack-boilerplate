import { tierLabel } from "@/lib/tier";

export type CheckoutChangeType = "immediate" | "scheduled" | "cancel";

export function resolveChangeType(
  currentTier: string | undefined,
  targetTier: string,
): CheckoutChangeType {
  if (!currentTier || currentTier === "FREE") return "immediate";
  if (targetTier === "FREE") return "cancel";
  return "scheduled";
}

function formatEffectiveDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(lang);
}

export function buildSuccessMessage(
  changeType: CheckoutChangeType,
  scheduledEffectiveAt: string | null,
  targetTier: string,
  lang: string,
  t: { changeScheduled: string; planChanged: string; upgradeSuccess: string },
): string {
  if (changeType !== "scheduled") {
    return changeType === "cancel" ? t.planChanged : t.upgradeSuccess;
  }
  if (!scheduledEffectiveAt) return t.planChanged;
  return t.changeScheduled
    .replace("{tier}", tierLabel(targetTier))
    .replace("{date}", formatEffectiveDate(scheduledEffectiveAt, lang));
}
