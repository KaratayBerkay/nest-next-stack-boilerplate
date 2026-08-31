"use client";

import { IconCrown, IconMedal, IconMedal2 } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithLeaderboardMessages } from "@/types/pages/leaderboard/LeaderboardMessages-types";

type LeaderboardMessages = PagesWithLeaderboardMessages["leaderboard"];

interface PodiumEntry {
  rank: 1 | 2 | 3;
  nameKey: string;
  teamKey: string;
  scoreKey: string;
  icon: Icon;
  ariaKey: string;
}

interface ListEntry {
  rank: number;
  nameKey: string;
  teamKey: string;
  scoreKey: string;
  you?: boolean;
}

const PODIUM: PodiumEntry[] = [
  {
    rank: 1,
    nameKey: "leaderboard2Name1",
    teamKey: "leaderboard2Team1",
    scoreKey: "leaderboard2Score1",
    icon: IconCrown,
    ariaKey: "leaderboard2CrownAria",
  },
  {
    rank: 2,
    nameKey: "leaderboard2Name2",
    teamKey: "leaderboard2Team2",
    scoreKey: "leaderboard2Score2",
    icon: IconMedal,
    ariaKey: "leaderboard2SecondAria",
  },
  {
    rank: 3,
    nameKey: "leaderboard2Name3",
    teamKey: "leaderboard2Team3",
    scoreKey: "leaderboard2Score3",
    icon: IconMedal2,
    ariaKey: "leaderboard2ThirdAria",
  },
];

const RUNNERS_UP: ListEntry[] = [
  {
    rank: 4,
    nameKey: "leaderboard2Name4",
    teamKey: "leaderboard2Team4",
    scoreKey: "leaderboard2Score4",
  },
  {
    rank: 5,
    nameKey: "leaderboard2Name5",
    teamKey: "leaderboard2Team5",
    scoreKey: "leaderboard2Score5",
    you: true,
  },
  {
    rank: 6,
    nameKey: "leaderboard2Name6",
    teamKey: "leaderboard2Team6",
    scoreKey: "leaderboard2Score6",
  },
  {
    rank: 7,
    nameKey: "leaderboard2Name7",
    teamKey: "leaderboard2Team7",
    scoreKey: "leaderboard2Score7",
  },
];

// Classic podium arrangement: 2nd, 1st, 3rd — the winner sits taller in the middle.
const PODIUM_DISPLAY_ORDER = [PODIUM[1], PODIUM[0], PODIUM[2]];

function PodiumCard({
  entry,
  lb,
}: {
  entry: PodiumEntry;
  lb: LeaderboardMessages;
}) {
  const isFirst = entry.rank === 1;

  return (
    <Card
      variant={isFirst ? "elevated" : "default"}
      className={cn(isFirst && "ring-brand/40 ring-2 sm:-translate-y-4")}
    >
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <div className="relative">
          <Avatar
            src={placeholderImage(entry.nameKey, "1x1")}
            alt=""
            fallback={lb[entry.nameKey].slice(0, 2)}
            size={isFirst ? "xl" : "lg"}
          />
          <span
            className={cn(
              "ring-bg absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full ring-2",
              isFirst
                ? "bg-warning text-warning-fg"
                : "bg-surface text-fg border-border border",
            )}
          >
            <entry.icon size={13} aria-hidden="true" />
            <span className="sr-only">{lb[entry.ariaKey]}</span>
          </span>
        </div>
        <div>
          <p className="text-fg text-sm font-semibold">{lb[entry.nameKey]}</p>
          <p className="text-muted text-xs">{lb[entry.teamKey]}</p>
        </div>
        <Badge variant={isFirst ? "warning" : "outline"} size="sm">
          {lb[entry.scoreKey]}
        </Badge>
      </div>
    </Card>
  );
}

export function PodiumSpotlightLeaderboard() {
  const t = useMessages("pages") as unknown as PagesWithLeaderboardMessages;
  const lb = t.leaderboard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-fg text-2xl font-semibold tracking-tight">
            {lb.leaderboard2Heading}
          </h2>
          <p className="text-muted max-w-md text-sm">
            {lb.leaderboard2Subheading}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 items-end gap-4 sm:gap-6">
          {PODIUM_DISPLAY_ORDER.map((entry) => (
            <PodiumCard key={entry.nameKey} entry={entry} lb={lb} />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <h3 className="text-fg text-sm font-semibold">
            {lb.leaderboard2ListHeading}
          </h3>
          <ul className="border-border divide-border bg-surface flex flex-col divide-y rounded-xl border">
            {RUNNERS_UP.map((entry) => (
              <li key={entry.nameKey} className="flex items-center gap-3 p-4">
                <span className="text-muted w-5 shrink-0 text-sm font-semibold tabular-nums">
                  {entry.rank}
                </span>
                <Avatar
                  src={placeholderImage(entry.nameKey, "1x1")}
                  alt=""
                  fallback={lb[entry.nameKey].slice(0, 2)}
                  size="sm"
                  className={cn(
                    entry.you &&
                      "ring-brand ring-offset-bg ring-2 ring-offset-2",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-fg truncate text-sm font-medium">
                      {lb[entry.nameKey]}
                    </p>
                    {entry.you && (
                      <Badge variant="soft" size="sm">
                        {lb.leaderboard2YouBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted truncate text-xs">
                    {lb[entry.teamKey]}
                  </p>
                </div>
                <span className="text-fg shrink-0 text-sm font-semibold tabular-nums">
                  {lb[entry.scoreKey]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
