"use client";

import {
  IconBed,
  IconCalendarEvent,
  IconCircleCheck,
  IconClock,
  IconDoor,
  IconTrendingUp,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type DashboardMessages = PagesWithDashboardMessages["dashboard"];

const LINK_URL = "#" as const;

interface DashboardStat {
  icon: Icon;
  trend: "up" | "down";
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

interface BookingRow {
  nameKey: string;
  roomKey: string;
  datesKey: string;
  totalKey: string;
  statusKey: string;
  seed: string;
}

const STATS: DashboardStat[] = [
  {
    icon: IconCalendarEvent,
    trend: "up",
    labelKey: "dashboard14Stat1Label",
    valueKey: "dashboard14Stat1Value",
    deltaKey: "dashboard14Stat1Delta",
  },
  {
    icon: IconBed,
    trend: "up",
    labelKey: "dashboard14Stat2Label",
    valueKey: "dashboard14Stat2Value",
    deltaKey: "dashboard14Stat2Delta",
  },
  {
    icon: IconWallet,
    trend: "up",
    labelKey: "dashboard14Stat3Label",
    valueKey: "dashboard14Stat3Value",
    deltaKey: "dashboard14Stat3Delta",
  },
  {
    icon: IconTrendingUp,
    trend: "up",
    labelKey: "dashboard14Stat4Label",
    valueKey: "dashboard14Stat4Value",
    deltaKey: "dashboard14Stat4Delta",
  },
];

const BOOKING_ROWS: BookingRow[] = [
  {
    nameKey: "dashboard14Row1Name",
    roomKey: "dashboard14Row1Room",
    datesKey: "dashboard14Row1Dates",
    totalKey: "dashboard14Row1Total",
    statusKey: "dashboard14StatusConfirmed",
    seed: "dash-14-1",
  },
  {
    nameKey: "dashboard14Row2Name",
    roomKey: "dashboard14Row2Room",
    datesKey: "dashboard14Row2Dates",
    totalKey: "dashboard14Row2Total",
    statusKey: "dashboard14StatusPending",
    seed: "dash-14-2",
  },
  {
    nameKey: "dashboard14Row3Name",
    roomKey: "dashboard14Row3Room",
    datesKey: "dashboard14Row3Dates",
    totalKey: "dashboard14Row3Total",
    statusKey: "dashboard14StatusCheckedIn",
    seed: "dash-14-3",
  },
  {
    nameKey: "dashboard14Row4Name",
    roomKey: "dashboard14Row4Room",
    datesKey: "dashboard14Row4Dates",
    totalKey: "dashboard14Row4Total",
    statusKey: "dashboard14StatusConfirmed",
    seed: "dash-14-4",
  },
  {
    nameKey: "dashboard14Row5Name",
    roomKey: "dashboard14Row5Room",
    datesKey: "dashboard14Row5Dates",
    totalKey: "dashboard14Row5Total",
    statusKey: "dashboard14StatusPending",
    seed: "dash-14-5",
  },
];

const STATUS_ICONS: Record<string, Icon> = {
  dashboard14StatusConfirmed: IconCircleCheck,
  dashboard14StatusPending: IconClock,
  dashboard14StatusCheckedIn: IconDoor,
};

const STATUS_TONES: Record<string, string> = {
  dashboard14StatusConfirmed: "bg-success/10 text-success",
  dashboard14StatusPending: "bg-warning/10 text-warning",
  dashboard14StatusCheckedIn: "bg-info/10 text-info",
};

function getToneClasses(trend: DashboardStat["trend"]) {
  return trend === "up"
    ? "bg-success/10 text-success"
    : "bg-error/10 text-error";
}

function getStatusTone(statusKey: string) {
  return STATUS_TONES[statusKey] ?? "bg-muted/15 text-muted";
}

function StatCard({ stat, d }: { stat: DashboardStat; d: DashboardMessages }) {
  return (
    <div className="border-border bg-surface flex flex-col gap-3 rounded-2xl border p-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            getToneClasses(stat.trend),
          )}
        >
          <stat.icon size={18} aria-hidden="true" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
            getToneClasses(stat.trend),
          )}
        >
          {d[stat.deltaKey]}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <Typography variant="caption">{d[stat.labelKey]}</Typography>
        <span className="text-2xl font-semibold tracking-tight">
          {d[stat.valueKey]}
        </span>
      </div>
    </div>
  );
}

function StatusPill({
  statusKey,
  d,
}: {
  statusKey: string;
  d: DashboardMessages;
}) {
  const StatusIcon = STATUS_ICONS[statusKey] ?? IconCircleCheck;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        getStatusTone(statusKey),
      )}
    >
      <StatusIcon size={14} aria-hidden="true" />
      {d[statusKey]}
    </span>
  );
}

export function HotelBookingsPanelDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard14Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard14Description}
          </Typography>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} d={d} />
          ))}
        </div>
        <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
          <div className="flex items-center justify-between gap-3">
            <Typography variant="h5">{d.dashboard14TableTitle}</Typography>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="!rounded-full"
            >
              <a href={LINK_URL}>{d.dashboard14ViewAll}</a>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dashboard14TableGuest}</TableHead>
                <TableHead>{d.dashboard14TableRoom}</TableHead>
                <TableHead>{d.dashboard14TableDates}</TableHead>
                <TableHead>{d.dashboard14TableStatus}</TableHead>
                <TableHead className="text-right">
                  {d.dashboard14TableTotal}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BOOKING_ROWS.map((row) => (
                <TableRow key={row.nameKey}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        src={placeholderImage(row.seed, "1x1")}
                        alt={d.dashboard14AvatarAlt}
                        fallback={d[row.nameKey]}
                      />
                      <span className="font-medium">{d[row.nameKey]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">{d[row.roomKey]}</TableCell>
                  <TableCell className="text-muted tabular-nums">
                    {d[row.datesKey]}
                  </TableCell>
                  <TableCell>
                    <StatusPill statusKey={row.statusKey} d={d} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {d[row.totalKey]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
