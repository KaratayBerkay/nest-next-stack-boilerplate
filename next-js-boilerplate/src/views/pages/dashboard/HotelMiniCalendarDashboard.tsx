"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconCalendarMonth,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import {
  addMonths,
  getDaysInMonth,
  getFirstWeekdayOfMonth,
  isToday,
} from "@/lib/date-time";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDashboardMessages } from "@/types/pages/dashboard/DashboardMessages-types";

type DashboardMessages = PagesWithDashboardMessages["dashboard"];

interface ArrivalRow {
  nameKey: string;
  roomKey: string;
  statusKey: string;
  seed: string;
}

const MONTH_KEYS = [
  "dashboard16Month1",
  "dashboard16Month2",
  "dashboard16Month3",
  "dashboard16Month4",
  "dashboard16Month5",
  "dashboard16Month6",
  "dashboard16Month7",
  "dashboard16Month8",
  "dashboard16Month9",
  "dashboard16Month10",
  "dashboard16Month11",
  "dashboard16Month12",
] as const;

const WEEKDAY_KEYS = [
  "dashboard16Weekday1",
  "dashboard16Weekday2",
  "dashboard16Weekday3",
  "dashboard16Weekday4",
  "dashboard16Weekday5",
  "dashboard16Weekday6",
  "dashboard16Weekday7",
] as const;

const BOOKED_DAYS = [2, 5, 8, 12, 15, 19, 22, 26, 29] as const;

const ARRIVALS: ArrivalRow[] = [
  {
    nameKey: "dashboard16Arrival1Name",
    roomKey: "dashboard16Arrival1Room",
    statusKey: "dashboard16StatusCheckedIn",
    seed: "dash-16-1",
  },
  {
    nameKey: "dashboard16Arrival2Name",
    roomKey: "dashboard16Arrival2Room",
    statusKey: "dashboard16StatusConfirmed",
    seed: "dash-16-2",
  },
  {
    nameKey: "dashboard16Arrival3Name",
    roomKey: "dashboard16Arrival3Room",
    statusKey: "dashboard16StatusPending",
    seed: "dash-16-3",
  },
  {
    nameKey: "dashboard16Arrival4Name",
    roomKey: "dashboard16Arrival4Room",
    statusKey: "dashboard16StatusConfirmed",
    seed: "dash-16-4",
  },
];

const STATUS_TONES: Record<string, string> = {
  dashboard16StatusConfirmed: "bg-success/10 text-success",
  dashboard16StatusCheckedIn: "bg-info/10 text-info",
  dashboard16StatusPending: "bg-warning/10 text-warning",
};

function getToneClasses(statusKey: string) {
  return STATUS_TONES[statusKey] ?? "bg-muted/15 text-muted";
}

function getCalendarCells(year: number, month: number): (number | null)[] {
  const offset = (getFirstWeekdayOfMonth(year, month + 1) + 6) % 7;
  const days = getDaysInMonth(year, month + 1);
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: days }, (_, index) => index + 1),
  ];
}

function isBookedDay(day: number) {
  return (BOOKED_DAYS as readonly number[]).includes(day);
}

function handlePrevMonth(
  viewDate: Date,
  setViewDate: Dispatch<SetStateAction<Date>>,
) {
  setViewDate(addMonths(viewDate, -1));
}

function handleNextMonth(
  viewDate: Date,
  setViewDate: Dispatch<SetStateAction<Date>>,
) {
  setViewDate(addMonths(viewDate, 1));
}

function handleDaySelect(
  day: number,
  setSelectedDay: Dispatch<SetStateAction<number>>,
) {
  setSelectedDay(day);
}

function getDayClasses(day: number, selectedDay: number) {
  const base =
    "flex h-9 items-center justify-center rounded-full text-sm transition-colors";
  if (day === selectedDay) {
    return cn(base, "bg-brand text-brand-fg font-medium");
  }
  if (isBookedDay(day)) {
    return cn(base, "bg-brand/10 text-brand font-medium hover:bg-brand/20");
  }
  return cn(base, "text-muted hover:bg-surface-hover hover:text-fg");
}

function StatusPill({
  statusKey,
  d,
}: {
  statusKey: string;
  d: DashboardMessages;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        getToneClasses(statusKey),
      )}
    >
      {d[statusKey]}
    </span>
  );
}

export function HotelMiniCalendarDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(15);
  const cells = getCalendarCells(viewDate.getFullYear(), viewDate.getMonth());

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard16Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard16Description}
          </Typography>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
            <div className="flex items-center justify-between gap-3">
              <Typography variant="h5">
                {d[MONTH_KEYS[viewDate.getMonth()]]} {viewDate.getFullYear()}
              </Typography>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={d.dashboard16PrevMonth}
                  className="border-border hover:bg-surface-hover text-muted hover:text-fg flex size-8 items-center justify-center rounded-full border transition-colors"
                  onClick={() => handlePrevMonth(viewDate, setViewDate)}
                >
                  <IconChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={d.dashboard16NextMonth}
                  className="border-border hover:bg-surface-hover text-muted hover:text-fg flex size-8 items-center justify-center rounded-full border transition-colors"
                  onClick={() => handleNextMonth(viewDate, setViewDate)}
                >
                  <IconChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAY_KEYS.map((weekdayKey) => (
                <div
                  key={weekdayKey}
                  className="text-muted flex h-8 items-center justify-center text-xs font-medium"
                >
                  {d[weekdayKey]}
                </div>
              ))}
              {cells.map((day, index) =>
                day === null ? (
                  <span key={index} aria-hidden="true" />
                ) : (
                  <button
                    key={index}
                    type="button"
                    className={cn(
                      getDayClasses(day, selectedDay),
                      isToday(
                        new Date(
                          viewDate.getFullYear(),
                          viewDate.getMonth(),
                          day,
                        ),
                      ) &&
                        day !== selectedDay &&
                        "ring-brand ring-1 ring-inset",
                    )}
                    onClick={() => handleDaySelect(day, setSelectedDay)}
                  >
                    {day}
                  </button>
                ),
              )}
            </div>
            <div className="border-border flex flex-wrap items-center gap-4 border-t pt-4 text-xs">
              <span className="text-muted inline-flex items-center gap-1.5">
                <span
                  className="bg-muted/20 size-2 rounded-full"
                  aria-hidden="true"
                />
                {d.dashboard16Available}
              </span>
              <span className="text-muted inline-flex items-center gap-1.5">
                <span
                  className="bg-brand/10 size-2 rounded-full"
                  aria-hidden="true"
                />
                {d.dashboard16Booked}
              </span>
              <span className="text-muted inline-flex items-center gap-1.5">
                <span
                  className="bg-brand size-2 rounded-full"
                  aria-hidden="true"
                />
                {d.dashboard16Selected}
              </span>
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6">
            <div className="flex items-center justify-between gap-3">
              <Typography variant="h5">{d.dashboard16ArrivalsTitle}</Typography>
              <IconCalendarMonth
                size={18}
                className="text-muted"
                aria-hidden="true"
              />
            </div>
            <div className="divide-border flex flex-col divide-y">
              {ARRIVALS.map((arrival) => (
                <div
                  key={arrival.nameKey}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="sm"
                      src={`https://picsum.photos/seed/${arrival.seed}/64/64`}
                      alt={d.dashboard16AvatarAlt}
                      fallback={d[arrival.nameKey]}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {d[arrival.nameKey]}
                      </span>
                      <span className="text-muted text-xs">
                        {d[arrival.roomKey]}
                      </span>
                    </div>
                  </div>
                  <StatusPill statusKey={arrival.statusKey} d={d} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
