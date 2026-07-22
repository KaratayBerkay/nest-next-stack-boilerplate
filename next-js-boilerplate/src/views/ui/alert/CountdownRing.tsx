"use client";

const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function CountdownRing({
  remainingMs,
  totalSeconds,
}: {
  remainingMs: number;
  totalSeconds: number;
}) {
  const fraction = Math.min(
    1,
    Math.max(0, remainingMs / (totalSeconds * 1000)),
  );
  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div
      className="relative size-12 shrink-0"
      role="timer"
      aria-label={`Closes in ${seconds} seconds`}
    >
      <svg
        viewBox="0 0 48 48"
        className="size-12 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-20"
        />
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - fraction)}
          className="transition-[stroke-dashoffset] duration-100 ease-linear motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
        {seconds}
      </span>
    </div>
  );
}
