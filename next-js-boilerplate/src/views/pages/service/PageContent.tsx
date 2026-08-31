"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { HeroProcessChecklistService } from "./HeroProcessChecklistService";
import { PhotoHeroStatsService } from "./PhotoHeroStatsService";
import { TabbedOfferingsService } from "./TabbedOfferingsService";
import { TieredPricingService } from "./TieredPricingService";
import { FaqSidebarStatsService } from "./FaqSidebarStatsService";
import { StickySectionNavService } from "./StickySectionNavService";
import { ExpertiseRelatedCtaService } from "./ExpertiseRelatedCtaService";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function ServicePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.service;

  const examples: UIExample[] = [
    {
      id: "service-1",
      title: t.service1TabTitle,
      description: t.service1TabDescription,
      render: () => <HeroProcessChecklistService />,
    },
    {
      id: "service-2",
      title: t.service2TabTitle,
      description: t.service2TabDescription,
      render: () => <PhotoHeroStatsService />,
    },
    {
      id: "service-3",
      title: t.service3TabTitle,
      description: t.service3TabDescription,
      render: () => <TabbedOfferingsService />,
    },
    {
      id: "service-4",
      title: t.service4TabTitle,
      description: t.service4TabDescription,
      render: () => <TieredPricingService />,
    },
    {
      id: "service-5",
      title: t.service5TabTitle,
      description: t.service5TabDescription,
      render: () => <FaqSidebarStatsService />,
    },
    {
      id: "service-6",
      title: t.service6TabTitle,
      description: t.service6TabDescription,
      render: () => <StickySectionNavService />,
    },
    {
      id: "service-7",
      title: t.service7TabTitle,
      description: t.service7TabDescription,
      render: () => <ExpertiseRelatedCtaService />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.serviceTitle}
      intro={m.examples.serviceDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="service"
    />
  );
}
