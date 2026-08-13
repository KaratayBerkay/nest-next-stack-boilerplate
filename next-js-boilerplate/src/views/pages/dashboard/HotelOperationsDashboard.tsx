"use client";

import {
  IconAlertTriangle,
  IconCheck,
  IconChecklist,
  IconClipboardCheck,
  IconHomeStats,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
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

type DashboardMessages = PagesWithDashboardMessages["dashboard"];

interface DashboardStat {
  icon: Icon;
  trend: "up" | "down";
  labelKey: string;
  valueKey: string;
  deltaKey: string;
}

interface HousekeepingRoom {
  number: number;
  typeKey: string;
  statusKey: string;
}

const STATS: DashboardStat[] = [
  {
    icon: IconHomeStats,
    trend: "up",
    labelKey: "dashboard18Stat1Label",
    valueKey: "dashboard18Stat1Value",
    deltaKey: "dashboard18Stat1Delta",
  },
  {
    icon: IconCheck,
    trend: "up",
    labelKey: "dashboard18Stat2Label",
    valueKey: "dashboard18Stat2Value",
    deltaKey: "dashboard18Stat2Delta",
  },
  {
    icon: IconAlertTriangle,
    trend: "down",
    labelKey: "dashboard18Stat3Label",
    valueKey: "dashboard18Stat3Value",
    deltaKey: "dashboard18Stat3Delta",
  },
  {
    icon: IconClipboardCheck,
    trend: "up",
    labelKey: "dashboard18Stat4Label",
    valueKey: "dashboard18Stat4Value",
    deltaKey: "dashboard18Stat4Delta",
  },
];

const ROOMS: HousekeepingRoom[] = [
  {
    number: 201,
    typeKey: "dashboard18TypeDeluxeKing",
    statusKey: "dashboard18StatusClean",
  },
  {
    number: 204,
    typeKey: "dashboard18TypeDeluxeKing",
    statusKey: "dashboard18StatusInspected",
  },
  {
    number: 112,
    typeKey: "dashboard18TypeStandardTwin",
    statusKey: "dashboard18StatusDirty",
  },
  {
    number: 118,
    typeKey: "dashboard18TypeFamilyRoom",
    statusKey: "dashboard18StatusClean",
  },
  {
    number: 208,
    typeKey: "dashboard18TypeDeluxeKing",
    statusKey: "dashboard18StatusInspected",
  },
  {
    number: 105,
    typeKey: "dashboard18TypeStandardTwin",
    statusKey: "dashboard18StatusDirty",
  },
];

const STATUS_ICONS: Record<string, Icon> = {
  dashboard18StatusClean: IconCheck,
  dashboard18StatusDirty: IconAlertTriangle,
  dashboard18StatusInspected: IconClipboardCheck,
};

const STATUS_TONES: Record<string, string> = {
  dashboard18StatusClean: "bg-success/10 text-success",
  dashboard18StatusDirty: "bg-warning/10 text-warning",
  dashboard18StatusInspected: "bg-info/10 text-info",
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
  const StatusIcon = STATUS_ICONS[statusKey] ?? IconCheck;
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

export function HotelOperationsDashboard() {
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
            {d.dashboard18Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard18Description}
          </Typography>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} d={d} />
          ))}
        </div>
        <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
          <div className="flex items-center justify-between gap-3">
            <Typography variant="h5">{d.dashboard18TableTitle}</Typography>
            <IconChecklist
              size={18}
              className="text-muted"
              aria-hidden="true"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dashboard18ColumnRoom}</TableHead>
                <TableHead>{d.dashboard18ColumnType}</TableHead>
                <TableHead>{d.dashboard18ColumnStatus}</TableHead>
                <TableHead className="text-right">
                  {d.dashboard18ColumnAction}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROOMS.map((room) => (
                <TableRow key={room.number}>
                  <TableCell className="font-medium tabular-nums">
                    {room.number}
                  </TableCell>
                  <TableCell className="text-muted">
                    {d[room.typeKey]}
                  </TableCell>
                  <TableCell>
                    <StatusPill statusKey={room.statusKey} d={d} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      {d.dashboard18InspectAction}
                    </Button>
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
