"use client";

import { useState } from "react";
import { TimeInput } from "@/components/ui/TimeInput";
import { formatTime } from "./utils";
import type { Time } from "./utils";

export function ComponentsTab() {
  const [defaultTime, setDefaultTime] = useState<Time>({
    hours: 10,
    minutes: 30,
  });
  const [secondsTime, setSecondsTime] = useState<Time>({
    hours: 12,
    minutes: 0,
    seconds: 30,
  });
  const [twelveTime, setTwelveTime] = useState<Time>({
    hours: 14,
    minutes: 30,
  });

  return (
    <>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <TimeInput
          value={defaultTime}
          onChange={setDefaultTime}
          label="Select time"
        />
        <p className="text-muted text-xs">Value: {formatTime(defaultTime)}</p>
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
        <p className="text-muted text-xs">Value: {formatTime(twelveTime)}</p>
      </section>
    </>
  );
}
