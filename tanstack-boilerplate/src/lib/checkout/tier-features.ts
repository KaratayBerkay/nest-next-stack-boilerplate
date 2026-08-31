"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Tier } from "@/lib/tier";

// Single source of truth for tier feature-list copy — the `pricing` i18n
// namespace (already localized EN/TR, already the Plans page's own source).
// Previously duplicated as a hardcoded, English-only array here that had
// drifted from the i18n copy (different wording, different feature counts,
// "Priority support" attached to a different tier in each place) — every
// consumer now reads the same translated strings instead of maintaining its
// own copy.
export function useTierFeatures(): Record<Tier, string[]> {
  const t = useMessages("pricing");
  return {
    FREE: t.featuresFree,
    BASIC: t.featuresBasic,
    MEDIUM: t.featuresMedium,
    PREMIUM: t.featuresPremium,
  };
}
