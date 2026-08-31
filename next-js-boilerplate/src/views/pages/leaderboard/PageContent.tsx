"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { QuotaProgressLeaderboard } from "./QuotaProgressLeaderboard";
import { PodiumSpotlightLeaderboard } from "./PodiumSpotlightLeaderboard";
import { WeeklyTrendLeaderboard } from "./WeeklyTrendLeaderboard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function LeaderboardPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.leaderboard;

  const examples: UIExample[] = [
    {
      id: "leaderboard-1",
      title: t.leaderboard1TabTitle,
      description: t.leaderboard1TabDescription,
      render: () => <QuotaProgressLeaderboard />,
    },
    {
      id: "leaderboard-2",
      title: t.leaderboard2TabTitle,
      description: t.leaderboard2TabDescription,
      render: () => <PodiumSpotlightLeaderboard />,
    },
    {
      id: "leaderboard-3",
      title: t.leaderboard3TabTitle,
      description: t.leaderboard3TabDescription,
      render: () => <WeeklyTrendLeaderboard />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.leaderboardTitle}
      intro={m.examples.leaderboardDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="leaderboard"
    />
  );
}
