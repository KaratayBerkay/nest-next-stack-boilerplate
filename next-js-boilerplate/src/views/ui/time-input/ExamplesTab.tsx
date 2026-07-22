"use client";

import { useState } from "react";
import { TimeInput } from "@/components/ui/TimeInput";
import { formatTime } from "./utils";
import type { Time } from "./utils";

export function ExamplesTab() {
  const [meetingTime, setMeetingTime] = useState<Time>({
    hours: 9,
    minutes: 0,
  });
  const [eventTime, setEventTime] = useState<Time>({ hours: 18, minutes: 30 });
  const [timerTime, setTimerTime] = useState<Time>({
    hours: 0,
    minutes: 5,
    seconds: 0,
  });

  return (
    <>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Meeting Scheduler</h3>
        <div className="surface rounded-xl p-6">
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
            <p className="text-muted text-xs">
              Meeting at {formatTime(meetingTime)}
            </p>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-xs font-medium">
              Confirm
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Event Time Picker</h3>
        <div className="surface rounded-xl p-6">
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
            <p className="text-muted text-xs">
              Event starts at {formatTime(eventTime)}
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Timer Settings</h3>
        <div className="surface rounded-xl p-6">
          <div className="mb-4">
            <p className="text-sm font-semibold">Countdown Timer</p>
            <p className="text-muted text-xs">
              Set timer duration with precision
            </p>
          </div>
          <TimeInput
            value={timerTime}
            onChange={setTimerTime}
            showSeconds
            label="Duration"
          />
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-muted text-xs">{formatTime(timerTime, true)}</p>
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-1.5 text-xs font-medium">
              Start Timer
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
