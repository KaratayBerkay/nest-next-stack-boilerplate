export function RateLimitMessage({ compact }: { compact?: boolean }) {
  return (
    <p
      className={`text-amber-600 ${compact ? "mt-1 text-[10px]" : "mt-1.5 text-xs"}`}
    >
      Slow down — max 10 messages per 5 seconds
    </p>
  );
}
