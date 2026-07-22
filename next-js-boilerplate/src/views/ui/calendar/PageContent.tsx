"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import { AppointmentRangeTab } from "@/views/ui/calendar/AppointmentRangeTab";
import { MeetingsTab } from "@/views/ui/calendar/MeetingsTab";
import { BirthdaysTab } from "@/views/ui/calendar/BirthdaysTab";
import { DailyNotesTab } from "@/views/ui/calendar/DailyNotesTab";

const examples: UIExample[] = [
  {
    id: "appointment-range",
    title: "Appointment Range",
    description: "Date range picker with check-in/out readout.",
    render: () => <AppointmentRangeTab />,
  },
  {
    id: "meetings",
    title: "Meetings",
    description: "Day view with time-based event list.",
    render: () => <MeetingsTab />,
  },
  {
    id: "birthdays",
    title: "Birthdays",
    description: "Recurring birthday markers with month navigation.",
    render: () => <BirthdaysTab />,
  },
  {
    id: "daily-notes",
    title: "Daily Notes",
    description:
      "Calendar left + notes panel right; click a day to show notes.",
    render: () => <DailyNotesTab />,
  },
];

export default function CalendarPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Calendar"
      intro="A full-featured event calendar for displaying events, schedules, and deadlines."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
