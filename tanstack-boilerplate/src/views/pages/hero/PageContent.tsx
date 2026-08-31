"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredScreenshotHero } from "./CenteredScreenshotHero";
import { SplitPortraitHero } from "./SplitPortraitHero";
import { AmbientVideoBackdropHero } from "./AmbientVideoBackdropHero";
import { AuroraGradientBackdropHero } from "./AuroraGradientBackdropHero";
import { InteractiveCommandDemoHero } from "./InteractiveCommandDemoHero";
import { SocialProofLogoWallHero } from "./SocialProofLogoWallHero";
import { TrustBadgeRowHero } from "./TrustBadgeRowHero";
import { ImpactTypographyHero } from "./ImpactTypographyHero";
import { FloatingDashboardCardHero } from "./FloatingDashboardCardHero";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithHeroMessages } from "@/types/pages/hero/HeroMessages-types";

export default function HeroPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages") as unknown as PagesWithHeroMessages & {
    examples: { heroTitle: string; heroDescription: string };
  };
  const t = m.hero;

  const examples: UIExample[] = [
    {
      id: "hero-1",
      title: t.hero1TabTitle,
      description: t.hero1TabDescription,
      render: () => <CenteredScreenshotHero />,
    },
    {
      id: "hero-2",
      title: t.hero2TabTitle,
      description: t.hero2TabDescription,
      render: () => <SplitPortraitHero />,
    },
    {
      id: "hero-3",
      title: t.hero3TabTitle,
      description: t.hero3TabDescription,
      render: () => <AmbientVideoBackdropHero />,
    },
    {
      id: "hero-4",
      title: t.hero4TabTitle,
      description: t.hero4TabDescription,
      render: () => <AuroraGradientBackdropHero />,
    },
    {
      id: "hero-5",
      title: t.hero5TabTitle,
      description: t.hero5TabDescription,
      render: () => <InteractiveCommandDemoHero />,
    },
    {
      id: "hero-6",
      title: t.hero6TabTitle,
      description: t.hero6TabDescription,
      render: () => <SocialProofLogoWallHero />,
    },
    {
      id: "hero-7",
      title: t.hero7TabTitle,
      description: t.hero7TabDescription,
      render: () => <TrustBadgeRowHero />,
    },
    {
      id: "hero-8",
      title: t.hero8TabTitle,
      description: t.hero8TabDescription,
      render: () => <ImpactTypographyHero />,
    },
    {
      id: "hero-9",
      title: t.hero9TabTitle,
      description: t.hero9TabDescription,
      render: () => <FloatingDashboardCardHero />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.heroTitle}
      intro={m.examples.heroDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="hero"
    />
  );
}
