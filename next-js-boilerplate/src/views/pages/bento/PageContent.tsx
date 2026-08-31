"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { AsymmetricFeatureHeroBento } from "./AsymmetricFeatureHeroBento";
import { StatsPulseTestimonialBento } from "./StatsPulseTestimonialBento";
import { ScreenshotShowcaseBento } from "./ScreenshotShowcaseBento";
import { HoverRevealDetailBento } from "./HoverRevealDetailBento";
import { DarkSpotlightAccentBento } from "./DarkSpotlightAccentBento";
import { EditorialTextImageBento } from "./EditorialTextImageBento";
import { IntegrationLogoWallBento } from "./IntegrationLogoWallBento";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithBentoMessages } from "@/types/pages/bento/BentoMessages-types";

export default function BentoPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages") as unknown as PagesWithBentoMessages & {
    examples: { bentoTitle: string; bentoDescription: string };
  };
  const t = m.bento;

  const examples: UIExample[] = [
    {
      id: "bento-1",
      title: t.bento1TabTitle,
      description: t.bento1TabDescription,
      render: () => <AsymmetricFeatureHeroBento />,
    },
    {
      id: "bento-2",
      title: t.bento2TabTitle,
      description: t.bento2TabDescription,
      render: () => <StatsPulseTestimonialBento />,
    },
    {
      id: "bento-3",
      title: t.bento3TabTitle,
      description: t.bento3TabDescription,
      render: () => <ScreenshotShowcaseBento />,
    },
    {
      id: "bento-4",
      title: t.bento4TabTitle,
      description: t.bento4TabDescription,
      render: () => <HoverRevealDetailBento />,
    },
    {
      id: "bento-5",
      title: t.bento5TabTitle,
      description: t.bento5TabDescription,
      render: () => <DarkSpotlightAccentBento />,
    },
    {
      id: "bento-6",
      title: t.bento6TabTitle,
      description: t.bento6TabDescription,
      render: () => <EditorialTextImageBento />,
    },
    {
      id: "bento-7",
      title: t.bento7TabTitle,
      description: t.bento7TabDescription,
      render: () => <IntegrationLogoWallBento />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.bentoTitle}
      intro={m.examples.bentoDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="bento"
    />
  );
}
