"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { ClassicThreeTierPricing } from "./ClassicThreeTierPricing";
import { BillingToggleSavingsPricing } from "./BillingToggleSavingsPricing";
import { FeatureMatrixPricing } from "./FeatureMatrixPricing";
import { SinglePlanAddonsPricing } from "./SinglePlanAddonsPricing";
import { UsageCalculatorPricing } from "./UsageCalculatorPricing";
import { MinimalDuoPricing } from "./MinimalDuoPricing";
import { PlansWithFaqPricing } from "./PlansWithFaqPricing";
import { PerSeatCalculatorPricing } from "./PerSeatCalculatorPricing";
import { EnterpriseContactPricing } from "./EnterpriseContactPricing";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

export default function PricingPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages") as unknown as PagesWithPricingMessages & {
    examples: { pricingTitle: string; pricingDescription: string };
  };
  const t = m.pricing;

  const examples: UIExample[] = [
    {
      id: "pricing-1",
      title: t.pricing1TabTitle,
      description: t.pricing1TabDescription,
      render: () => <ClassicThreeTierPricing />,
    },
    {
      id: "pricing-2",
      title: t.pricing2TabTitle,
      description: t.pricing2TabDescription,
      render: () => <BillingToggleSavingsPricing />,
    },
    {
      id: "pricing-3",
      title: t.pricing3TabTitle,
      description: t.pricing3TabDescription,
      render: () => <FeatureMatrixPricing />,
    },
    {
      id: "pricing-4",
      title: t.pricing4TabTitle,
      description: t.pricing4TabDescription,
      render: () => <SinglePlanAddonsPricing />,
    },
    {
      id: "pricing-5",
      title: t.pricing5TabTitle,
      description: t.pricing5TabDescription,
      render: () => <UsageCalculatorPricing />,
    },
    {
      id: "pricing-6",
      title: t.pricing6TabTitle,
      description: t.pricing6TabDescription,
      render: () => <MinimalDuoPricing />,
    },
    {
      id: "pricing-7",
      title: t.pricing7TabTitle,
      description: t.pricing7TabDescription,
      render: () => <PlansWithFaqPricing />,
    },
    {
      id: "pricing-8",
      title: t.pricing8TabTitle,
      description: t.pricing8TabDescription,
      render: () => <PerSeatCalculatorPricing />,
    },
    {
      id: "pricing-9",
      title: t.pricing9TabTitle,
      description: t.pricing9TabDescription,
      render: () => <EnterpriseContactPricing />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.pricingTitle}
      intro={m.examples.pricingDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="pricing"
    />
  );
}
