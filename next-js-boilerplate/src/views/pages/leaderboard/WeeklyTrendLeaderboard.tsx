"use client";

import { useState } from "react";
import { IconArrowDown, IconArrowUp, IconMinus } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithLeaderboardMessages } from "@/types/pages/leaderboard/LeaderboardMessages-types";

type LeaderboardMessages = PagesWithLeaderboardMessages["leaderboard"];
type TrendDirection = "up" | "down" | "flat";
type PeriodMode = "weekly" | "monthly";

interface PeriodStats {
  scoreKey: string;
  direction: TrendDirection;
  delta: number;
}

interface TrendEntry {
  rank: number;
  nameKey: string;
  teamKey: string;
  weekly: PeriodStats;
  monthly: PeriodStats;
}

const ENTRIES: TrendEntry[] = [
  {
    rank: 1,
    nameKey: "leaderboard3Name1",
    teamKey: "leaderboard3Team1",
    weekly: {
      scoreKey: "leaderboard3WeeklyScore1",
      direction: "up",
      delta: 2,
    },
    monthly: {
      scoreKey: "leaderboard3MonthlyScore1",
      direction: "flat",
      delta: 0,
    },
  },
  {
    rank: 2,
    nameKey: "leaderboard3Name2",
    teamKey: "leaderboard3Team2",
    weekly: {
      scoreKey: "leaderboard3WeeklyScore2",
      direction: "down",
      delta: 1,
    },
    monthly: {
      scoreKey: "leaderboard3MonthlyScore2",
      direction: "up",
      delta: 2,
    },
  },
  {
    rank: 3,
    nameKey: "leaderboard3Name3",
    teamKey: "leaderboard3Team3",
    weekly: {
      scoreKey: "leaderboard3WeeklyScore3",
      direction: "flat",
      delta: 0,
    },
    monthly: {
      scoreKey: "leaderboard3MonthlyScore3",
      direction: "down",
      delta: 1,
    },
  },
  {
    rank: 4,
    nameKey: "leaderboard3Name4",
    teamKey: "leaderboard3Team4",
    weekly: {
      scoreKey: "leaderboard3WeeklyScore4",
      direction: "up",
      delta: 1,
    },
    monthly: {
      scoreKey: "leaderboard3MonthlyScore4",
      direction: "flat",
      delta: 0,
    },
  },
  {
    rank: 5,
    nameKey: "leaderboard3Name5",
    teamKey: "leaderboard3Team5",
    weekly: {
      scoreKey: "leaderboard3WeeklyScore5",
      direction: "down",
      delta: 2,
    },
    monthly: {
      scoreKey: "leaderboard3MonthlyScore5",
      direction: "up",
      delta: 1,
    },
  },
  {
    rank: 6,
    nameKey: "leaderboard3Name6",
    teamKey: "leaderboard3Team6",
    weekly: {
      scoreKey: "leaderboard3WeeklyScore6",
      direction: "up",
      delta: 3,
    },
    monthly: {
      scoreKey: "leaderboard3MonthlyScore6",
      direction: "down",
      delta: 2,
    },
  },
];

function TrendBadge({
  stats,
  lb,
}: {
  stats: PeriodStats;
  lb: LeaderboardMessages;
}) {
  if (stats.direction === "flat") {
    return (
      <Badge variant="outline" size="sm" className="gap-1">
        <IconMinus size={12} aria-hidden="true" />
        <span className="sr-only">{lb.leaderboard3TrendFlatAria}</span>
      </Badge>
    );
  }

  const isUp = stats.direction === "up";
  return (
    <Badge variant={isUp ? "success" : "error"} size="sm" className="gap-1">
      {isUp ? (
        <IconArrowUp size={12} aria-hidden="true" />
      ) : (
        <IconArrowDown size={12} aria-hidden="true" />
      )}
      <span className="sr-only">
        {isUp ? lb.leaderboard3TrendUpAria : lb.leaderboard3TrendDownAria}
      </span>
      <span className="tabular-nums">
        {isUp ? "+" : "-"}
        {stats.delta}
      </span>
    </Badge>
  );
}

export function WeeklyTrendLeaderboard() {
  const t = useMessages("pages") as unknown as PagesWithLeaderboardMessages;
  const lb = t.leaderboard;
  const [period, setPeriod] = useState<PeriodMode>("weekly");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Card variant="default">
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>{lb.leaderboard3Heading}</CardTitle>
              <CardDescription>{lb.leaderboard3Subheading}</CardDescription>
            </div>
            <Tabs
              value={period}
              onValueChange={(value) => setPeriod(value as PeriodMode)}
            >
              <TabsList>
                <TabsTrigger value="weekly">
                  {lb.leaderboard3TabWeekly}
                </TabsTrigger>
                <TabsTrigger value="monthly">
                  {lb.leaderboard3TabMonthly}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lb.leaderboard3ColRank}</TableHead>
                  <TableHead>{lb.leaderboard3ColPlayer}</TableHead>
                  <TableHead>
                    <div className="text-right">{lb.leaderboard3ColScore}</div>
                  </TableHead>
                  <TableHead>
                    <div className="text-right">{lb.leaderboard3ColTrend}</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ENTRIES.map((entry) => {
                  const stats =
                    period === "weekly" ? entry.weekly : entry.monthly;
                  return (
                    <TableRow key={entry.nameKey}>
                      <TableCell className="text-muted text-sm font-medium tabular-nums">
                        {entry.rank}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={placeholderImage(entry.nameKey, "1x1")}
                            alt=""
                            fallback={lb[entry.nameKey].slice(0, 2)}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-fg truncate text-sm font-medium">
                              {lb[entry.nameKey]}
                            </p>
                            <p className="text-muted truncate text-xs">
                              {lb[entry.teamKey]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-fg text-right text-sm font-semibold tabular-nums">
                        {lb[stats.scoreKey]}
                      </TableCell>
                      <TableCell className="text-right">
                        <TrendBadge stats={stats} lb={lb} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
