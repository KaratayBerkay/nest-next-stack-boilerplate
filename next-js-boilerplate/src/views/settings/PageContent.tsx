"use client";

import { use } from "react";
import { cn } from "@/lib/cn";
import type { SettingsIndexPageProps } from "@/types/settings/SettingsIndexPage-types";
import { useAuth } from "@/hooks/useAuth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Tier } from "@/lib/tier";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsPageInfo } from "@/constants/page-info";
import { subscriptionQueryOptions } from "@/api/client/billing/query";
import PlanInfoCard from "@/views/settings/PlanInfoCard";
import PlanAdvantages from "@/views/settings/PlanAdvantages";
import UpgradeActions from "@/views/settings/UpgradeActions";

function useSubscription(userId: string | undefined) {
  return useSuspenseQuery(subscriptionQueryOptions(userId));
}

export default function PageContent({
  params,
  className,
}: SettingsIndexPageProps) {
  const { lang } = use(params);
  const { user } = useAuth();
  const t = useMessages("settings");
  const p = useMessages("pricing");
  const currency = useCurrencyCookie();
  const dateDisplay = useDateDisplayCookie();
  const { data: subscription } = useSubscription(user?.id);

  const tier = (subscription?.tier as Tier) ?? (user!.tier as Tier) ?? "FREE";
  const periodEnd = (subscription as { periodEnd?: string } | null)?.periodEnd;
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;

  const FEATURES: Record<Tier, string[]> = {
    FREE: p.featuresBasic,
    BASIC: p.featuresMedium,
    MEDIUM: p.featuresPremium,
    PREMIUM: p.featuresPro,
  };

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title={t.currentPlan}
        actions={<PageInfoButton content={settingsPageInfo} />}
      />

      <div className="flex flex-col gap-4">
        <PlanInfoCard
          tier={tier}
          periodEnd={periodEnd}
          cancelAtPeriodEnd={cancelAtPeriodEnd}
          t={t as unknown as Record<string, string>}
          currency={currency}
          dateDisplay={dateDisplay}
          lang={lang}
        />
        <PlanAdvantages tier={tier} features={FEATURES} />
        <UpgradeActions
          tier={tier}
          t={t as unknown as Record<string, string>}
          lang={lang}
        />
      </div>
    </div>
  );
}
