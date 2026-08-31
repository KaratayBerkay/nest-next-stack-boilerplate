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
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type DashboardMessages = PagesWithDashboardMessages["dashboard"];

interface Booking {
  day: number;
  nameKey: string;
  roomKey: string;
  statusKey: string;
  seed: string;
}

const MONTH_KEYS = [
  "dashboard17Month1",
  "dashboard17Month2",
  "dashboard17Month3",
  "dashboard17Month4",
  "dashboard17Month5",
  "dashboard17Month6",
  "dashboard17Month7",
  "dashboard17Month8",
  "dashboard17Month9",
  "dashboard17Month10",
  "dashboard17Month11",
  "dashboard17Month12",
] as const;

const WEEKDAY_KEYS = [
  "dashboard17Weekday1",
  "dashboard17Weekday2",
  "dashboard17Weekday3",
  "dashboard17Weekday4",
  "dashboard17Weekday5",
  "dashboard17Weekday6",
  "dashboard17Weekday7",
] as const;

const BOOKINGS: Booking[] = [
  {
    day: 3,
    nameKey: "dashboard17Booking1Name",
    roomKey: "dashboard17Booking1Room",
    statusKey: "dashboard17StatusCheckIn",
    seed: "dash-17-1",
  },
  {
    day: 5,
    nameKey: "dashboard17Booking2Name",
    roomKey: "dashboard17Booking2Room",
    statusKey: "dashboard17StatusStayover",
    seed: "dash-17-2",
  },
  {
    day: 8,
    nameKey: "dashboard17Booking3Name",
    roomKey: "dashboard17Booking3Room",
    statusKey: "dashboard17StatusCheckIn",
    seed: "dash-17-3",
  },
  {
    day: 12,
    nameKey: "dashboard17Booking4Name",
    roomKey: "dashboard17Booking4Room",
    statusKey: "dashboard17StatusCheckOut",
    seed: "dash-17-4",
  },
  {
    day: 15,
    nameKey: "dashboard17Booking5Name",
    roomKey: "dashboard17Booking5Room",
    statusKey: "dashboard17StatusStayover",
    seed: "dash-17-5",
  },
  {
    day: 15,
    nameKey: "dashboard17Booking6Name",
    roomKey: "dashboard17Booking6Room",
    statusKey: "dashboard17StatusCheckIn",
    seed: "dash-17-6",
  },
  {
    day: 21,
    nameKey: "dashboard17Booking7Name",
    roomKey: "dashboard17Booking7Room",
    statusKey: "dashboard17StatusCheckOut",
    seed: "dash-17-7",
  },
];

const STATUS_TONES: Record<string, string> = {
  dashboard17StatusCheckIn: "bg-info/10 text-info",
  dashboard17StatusStayover: "bg-warning/10 text-warning",
  dashboard17StatusCheckOut: "bg-success/10 text-success",
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

function getBookedDays(bookings: Booking[]): number[] {
  return Array.from(new Set(bookings.map((booking) => booking.day)));
}

function getBookingsForDay(bookings: Booking[], day: number): Booking[] {
  return bookings.filter((booking) => booking.day === day);
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

function getDayCellClasses(
  day: number,
  selectedDay: number,
  bookedDays: number[],
) {
  const isBooked = bookedDays.includes(day);
  const isSelected = day === selectedDay;
  const base =
    "flex h-10 flex-col items-center justify-center gap-1 rounded-xl text-sm transition-colors";
  if (isSelected) {
    return cn(base, "bg-brand text-brand-fg font-medium");
  }
  if (isBooked) {
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

export function HotelBookingCalendarDashboard() {
  const t = useMessages("pages") as unknown as PagesWithDashboardMessages;
  const d = t.dashboard;
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(8);
  const cells = getCalendarCells(viewDate.getFullYear(), viewDate.getMonth());
  const bookedDays = getBookedDays(BOOKINGS);
  const dayBookings = getBookingsForDay(BOOKINGS, selectedDay);
  const monthKey = MONTH_KEYS[viewDate.getMonth()];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dashboard17Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dashboard17Description}
          </Typography>
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6 lg:col-span-3">
            <div className="flex items-center justify-between gap-3">
              <Typography variant="h5">
                {d[monthKey]} {viewDate.getFullYear()}
              </Typography>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={d.dashboard17PrevMonth}
                  className="border-border hover:bg-surface-hover text-muted hover:text-fg flex size-8 items-center justify-center rounded-full border transition-colors"
                  onClick={() => handlePrevMonth(viewDate, setViewDate)}
                >
                  <IconChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={d.dashboard17NextMonth}
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
                    className={getDayCellClasses(day, selectedDay, bookedDays)}
                    onClick={() => handleDaySelect(day, setSelectedDay)}
                  >
                    {day}
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        day === selectedDay
                          ? "bg-brand-fg/70"
                          : bookedDays.includes(day)
                            ? "bg-brand"
                            : isToday(
                                  new Date(
                                    viewDate.getFullYear(),
                                    viewDate.getMonth(),
                                    day,
                                  ),
                                )
                              ? "bg-surface-hover"
                              : "bg-transparent",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Typography variant="h5">{d.dashboard17BookingsTitle}</Typography>
              <IconCalendarMonth
                size={18}
                className="text-muted"
                aria-hidden="true"
              />
            </div>
            <span className="text-muted text-sm">
              {selectedDay} {d[monthKey]}
            </span>
            {dayBookings.length === 0 ? (
              <p className="text-muted flex flex-1 items-center justify-center py-8 text-sm">
                {d.dashboard17NoBookings}
              </p>
            ) : (
              <div className="flex flex-col">
                <div className="border-border text-muted grid grid-cols-[1fr_auto_auto] gap-3 border-b pb-2 text-xs font-medium">
                  <span>{d.dashboard17TableGuest}</span>
                  <span>{d.dashboard17TableRoom}</span>
                  <span>{d.dashboard17TableStatus}</span>
                </div>
                <div className="divide-border flex flex-col divide-y">
                  {dayBookings.map((booking) => (
                    <div
                      key={`${booking.seed}-${booking.day}`}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          src={placeholderImage(booking.seed, "1x1")}
                          alt={d.dashboard17AvatarAlt}
                          fallback={d[booking.nameKey]}
                        />
                        <span className="text-sm font-medium">
                          {d[booking.nameKey]}
                        </span>
                      </div>
                      <span className="text-muted text-sm">
                        {d[booking.roomKey]}
                      </span>
                      <StatusPill statusKey={booking.statusKey} d={d} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
