"use client";

import { useMemo, useState } from "react";
import { IconHash, IconSortAscendingLetters } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLeaderboardMessages } from "@/types/pages/leaderboard/LeaderboardMessages-types";

interface QuotaEntry {
  rank: number;
  nameKey: string;
  teamKey: string;
  scoreKey: string;
  value: number;
}

const ENTRIES: QuotaEntry[] = [
  {
    rank: 1,
    nameKey: "leaderboard1Name1",
    teamKey: "leaderboard1Team1",
    scoreKey: "leaderboard1Score1",
    value: 96,
  },
  {
    rank: 2,
    nameKey: "leaderboard1Name2",
    teamKey: "leaderboard1Team2",
    scoreKey: "leaderboard1Score2",
    value: 91,
  },
  {
    rank: 3,
    nameKey: "leaderboard1Name3",
    teamKey: "leaderboard1Team3",
    scoreKey: "leaderboard1Score3",
    value: 88,
  },
  {
    rank: 4,
    nameKey: "leaderboard1Name4",
    teamKey: "leaderboard1Team4",
    scoreKey: "leaderboard1Score4",
    value: 79,
  },
  {
    rank: 5,
    nameKey: "leaderboard1Name5",
    teamKey: "leaderboard1Team5",
    scoreKey: "leaderboard1Score5",
    value: 74,
  },
  {
    rank: 6,
    nameKey: "leaderboard1Name6",
    teamKey: "leaderboard1Team6",
    scoreKey: "leaderboard1Score6",
    value: 68,
  },
];

type SortMode = "rank" | "name";

function rankAccentClasses(rank: number): string {
  if (rank === 1) return "bg-brand text-brand-fg";
  if (rank <= 3) return "bg-surface text-fg border border-border";
  return "text-muted";
}

export function QuotaProgressLeaderboard() {
  const t = useMessages("pages") as unknown as PagesWithLeaderboardMessages;
  const lb = t.leaderboard;
  const [sortBy, setSortBy] = useState<SortMode>("rank");

  const sorted = useMemo(() => {
    const copy = [...ENTRIES];
    if (sortBy === "name") {
      copy.sort((a, b) => lb[a.nameKey].localeCompare(lb[b.nameKey]));
    } else {
      copy.sort((a, b) => a.rank - b.rank);
    }
    return copy;
  }, [sortBy, lb]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>{lb.leaderboard1Heading}</CardTitle>
                <CardDescription>{lb.leaderboard1Subheading}</CardDescription>
              </div>
              <ToggleGroup
                type="single"
                value={sortBy}
                onValueChange={(value) => {
                  if (value) setSortBy(value as SortMode);
                }}
                aria-label={lb.leaderboard1SortGroupAria}
              >
                <ToggleGroupItem
                  value="rank"
                  size="sm"
                  aria-label={lb.leaderboard1SortRankAria}
                >
                  <IconHash size={16} aria-hidden="true" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="name"
                  size="sm"
                  aria-label={lb.leaderboard1SortNameAria}
                >
                  <IconSortAscendingLetters size={16} aria-hidden="true" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {sorted.map((entry) => (
              <div
                key={entry.nameKey}
                className="hover:bg-surface-hover/60 flex items-center gap-4 rounded-lg px-2 py-3 transition-colors"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                    rankAccentClasses(entry.rank),
                  )}
                >
                  {entry.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-fg truncate text-sm font-medium">
                        {lb[entry.nameKey]}
                      </p>
                      <p className="text-muted truncate text-xs">
                        {lb[entry.teamKey]}
                      </p>
                    </div>
                    <span className="text-fg shrink-0 text-sm font-semibold tabular-nums">
                      {lb[entry.scoreKey]}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress
                      value={entry.value}
                      size="sm"
                      className="flex-1"
                      aria-label={lb.leaderboard1ProgressAria.replace(
                        "{name}",
                        lb[entry.nameKey],
                      )}
                    />
                    <span className="text-muted w-10 shrink-0 text-right text-xs tabular-nums">
                      {entry.value}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <p className="text-muted text-xs">{lb.leaderboard1UpdatedNote}</p>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
