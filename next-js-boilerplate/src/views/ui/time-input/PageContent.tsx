"use client";

import { useState } from "react";
import { TimeInput } from "@/components/ui/TimeInput";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

type Time = { hours: number; minutes: number; seconds?: number };

function formatTime(t: Time, showSeconds?: boolean): string {
  const h = t.hours.toString().padStart(2, "0");
  const m = t.minutes.toString().padStart(2, "0");
  const s = (t.seconds ?? 0).toString().padStart(2, "0");
  return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
}

function ComponentsTab() {
  const [defaultTime, setDefaultTime] = useState<Time>({ hours: 10, minutes: 30 });
  const [secondsTime, setSecondsTime] = useState<Time>({ hours: 12, minutes: 0, seconds: 30 });
  const [twelveTime, setTwelveTime] = useState<Time>({ hours: 14, minutes: 30 });

  return (
    <>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <TimeInput
          value={defaultTime}
          onChange={setDefaultTime}
          label="Select time"
        />
        <p className="text-muted text-xs">
          Value: {formatTime(defaultTime)}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Seconds</h3>
        <TimeInput
          value={secondsTime}
          onChange={setSecondsTime}
          showSeconds
          label="Hours, minutes & seconds"
        />
        <p className="text-muted text-xs">
          Value: {formatTime(secondsTime, true)}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">12-Hour Format</h3>
        <TimeInput
          value={twelveTime}
          onChange={setTwelveTime}
          use24Hour={false}
          label="12-hour with AM/PM"
        />
        <p className="text-muted text-xs">
          Value: {formatTime(twelveTime)}
        </p>
      </section>
    </>
  );
}

function ExamplesTab() {
  const [meetingTime, setMeetingTime] = useState<Time>({ hours: 9, minutes: 0 });
  const [eventTime, setEventTime] = useState<Time>({ hours: 18, minutes: 30 });
  const [timerTime, setTimerTime] = useState<Time>({ hours: 0, minutes: 5, seconds: 0 });

  return (
    <>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Meeting Scheduler</h3>
        <div className="surface p-6 rounded-xl">
          <div className="mb-4">
            <p className="text-sm font-semibold">Schedule a Meeting</p>
            <p className="text-muted text-xs">Pick a time for your meeting</p>
          </div>
          <TimeInput
            value={meetingTime}
            onChange={setMeetingTime}
            label="Meeting time"
          />
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-xs text-muted">
              Meeting at {formatTime(meetingTime)}
            </p>
            <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              Confirm
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Event Time Picker</h3>
        <div className="surface p-6 rounded-xl">
          <div className="mb-4">
            <p className="text-sm font-semibold">Event Start Time</p>
            <p className="text-muted text-xs">When does the event begin?</p>
          </div>
          <TimeInput
            value={eventTime}
            onChange={setEventTime}
            label="Start time"
          />
          <div className="mt-4 border-t pt-4">
            <p className="text-xs text-muted">
              Event starts at {formatTime(eventTime)}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Timer Settings</h3>
        <div className="surface p-6 rounded-xl">
          <div className="mb-4">
            <p className="text-sm font-semibold">Countdown Timer</p>
            <p className="text-muted text-xs">Set timer duration with precision</p>
          </div>
          <TimeInput
            value={timerTime}
            onChange={setTimerTime}
            showSeconds
            label="Duration"
          />
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-xs text-muted">
              {formatTime(timerTime, true)}
            </p>
            <button className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80">
              Start Timer
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

const examples: UIExample[] = [
  {
    id: "components",
    title: "Meeting Time",
    description: "24-hour time input with locale-aware formatting.",
    render: () => <ComponentsTab />,
  },
  {
    id: "examples",
    title: "Alarm",
    description: "12-hour AM/PM time input.",
    render: () => <ExamplesTab />,
  },
];

export default function TimeInputPage() {
  return (
    <ExampleTabs
      title="Time Input"
      intro="A time picker with dropdown selectors for hours, minutes, and seconds with automatic timezone detection."
      examples={examples}
    />
  );
}
