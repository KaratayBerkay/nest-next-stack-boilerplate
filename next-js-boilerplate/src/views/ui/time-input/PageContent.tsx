"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { TimeInput } from "@/components/ui/TimeInput";

type Time = { hours: number; minutes: number; seconds?: number };

function formatTime(t: Time, showSeconds?: boolean): string {
  const h = t.hours.toString().padStart(2, "0");
  const m = t.minutes.toString().padStart(2, "0");
  const s = (t.seconds ?? 0).toString().padStart(2, "0");
  return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
}

export default function TimeInputPage() {
  const [defaultTime, setDefaultTime] = useState<Time>({ hours: 10, minutes: 30 });
  const [shinyTime, setShinyTime] = useState<Time>({ hours: 14, minutes: 15 });
  const [glassTime, setGlassTime] = useState<Time>({ hours: 9, minutes: 0 });
  const [neonTime, setNeonTime] = useState<Time>({ hours: 20, minutes: 45 });
  const [gradientTime, setGradientTime] = useState<Time>({ hours: 16, minutes: 20 });
  const [secondsTime, setSecondsTime] = useState<Time>({ hours: 12, minutes: 0, seconds: 30 });
  const [twelveTime, setTwelveTime] = useState<Time>({ hours: 14, minutes: 30 });

  const [meetingTime, setMeetingTime] = useState<Time>({ hours: 9, minutes: 0 });
  const [eventTime, setEventTime] = useState<Time>({ hours: 18, minutes: 30 });
  const [timerTime, setTimerTime] = useState<Time>({ hours: 0, minutes: 5, seconds: 0 });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Time Input</h2>
        <p className="text-muted text-sm">
          A time picker with dropdown selectors for hours, minutes, and seconds with automatic
          timezone detection.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-6">
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
            <h3 className="text-lg font-semibold">Shiny</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <TimeInput
                value={shinyTime}
                onChange={setShinyTime}
                variant="shiny"
                label="Shiny variant"
              />
              <p className="text-slate-400 text-xs mt-2">
                Value: {formatTime(shinyTime)}
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Glass</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <TimeInput
                value={glassTime}
                onChange={setGlassTime}
                variant="glass"
                label="Glass variant"
              />
              <p className="text-slate-400 text-xs mt-2">
                Value: {formatTime(glassTime)}
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Neon</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <TimeInput
                value={neonTime}
                onChange={setNeonTime}
                variant="neon"
                label="Neon variant"
              />
              <p className="text-slate-400 text-xs mt-2">
                Value: {formatTime(neonTime)}
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Gradient</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <TimeInput
                value={gradientTime}
                onChange={setGradientTime}
                variant="gradient"
                label="Gradient variant"
              />
              <p className="text-slate-400 text-xs mt-2">
                Value: {formatTime(gradientTime)}
              </p>
            </div>
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
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Meeting Scheduler</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">Schedule a Meeting</p>
                <p className="text-slate-400 text-xs">Pick a time for your meeting</p>
              </div>
              <TimeInput
                value={meetingTime}
                onChange={setMeetingTime}
                variant="neon"
                label="Meeting time"
              />
              <div className="mt-4 flex items-center justify-between border-t border-cyan-500/20 pt-4">
                <p className="text-xs text-slate-400">
                  Meeting at {formatTime(meetingTime)}
                </p>
                <button className="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500">
                  Confirm
                </button>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Event Time Picker</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">Event Start Time</p>
                <p className="text-slate-400 text-xs">When does the event begin?</p>
              </div>
              <TimeInput
                value={eventTime}
                onChange={setEventTime}
                variant="glass"
                label="Start time"
              />
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-xs text-slate-400">
                  Event starts at {formatTime(eventTime)}
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold">Timer Settings</h3>
            <div className="bg-slate-950 p-6 rounded-xl">
              <div className="mb-4">
                <p className="text-sm font-semibold text-white">Countdown Timer</p>
                <p className="text-slate-400 text-xs">Set timer duration with precision</p>
              </div>
              <TimeInput
                value={timerTime}
                onChange={setTimerTime}
                variant="shiny"
                showSeconds
                label="Duration"
              />
              <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4">
                <p className="text-xs text-slate-400">
                  {formatTime(timerTime, true)}
                </p>
                <button className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600">
                  Start Timer
                </button>
              </div>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
