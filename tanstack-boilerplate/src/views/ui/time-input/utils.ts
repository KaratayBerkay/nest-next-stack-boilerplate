export type Time = { hours: number; minutes: number; seconds?: number };

export function formatTime(t: Time, showSeconds?: boolean): string {
  const h = t.hours.toString().padStart(2, "0");
  const m = t.minutes.toString().padStart(2, "0");
  const s = (t.seconds ?? 0).toString().padStart(2, "0");
  return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
}
