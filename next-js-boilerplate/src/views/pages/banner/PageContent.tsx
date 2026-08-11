"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { WithAnnouncementBar } from "./WithAnnouncementBar";
import { WithContainerAnnouncement } from "./WithContainerAnnouncement";
import { WithPromoBar } from "./WithPromoBar";
import { WithPrimaryBar } from "./WithPrimaryBar";
import { WithFloatingCard } from "./WithFloatingCard";
import { WithPillSocialProof } from "./WithPillSocialProof";
import { WithUtilityStrip } from "./WithUtilityStrip";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function BannerPageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.banner;

  const examples: UIExample[] = [
    {
      id: "banner-1",
      title: t.b1TabTitle,
      description: t.b1TabDescription,
      render: () => <WithAnnouncementBar />,
    },
    {
      id: "banner-2",
      title: t.b2TabTitle,
      description: t.b2TabDescription,
      render: () => <WithContainerAnnouncement />,
    },
    {
      id: "banner-3",
      title: t.b3TabTitle,
      description: t.b3TabDescription,
      render: () => <WithPromoBar />,
    },
    {
      id: "banner-4",
      title: t.b4TabTitle,
      description: t.b4TabDescription,
      render: () => <WithPrimaryBar />,
    },
    {
      id: "banner-5",
      title: t.b5TabTitle,
      description: t.b5TabDescription,
      render: () => <WithFloatingCard />,
    },
    {
      id: "banner-6",
      title: t.b6TabTitle,
      description: t.b6TabDescription,
      render: () => <WithPillSocialProof />,
    },
    {
      id: "banner-7",
      title: t.b7TabTitle,
      description: t.b7TabDescription,
      render: () => <WithUtilityStrip />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.bannerTitle}
      intro={m.examples.bannerDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
