import { cn } from "@/lib/cn";
import type { CalendarEventProps } from "@/types/ui/CalendarEvent-types";

const colorMap: Record<string, string> = {
  blue: "bg-brand",
  green: "bg-success",
  red: "bg-error",
  purple: "bg-brand",
  orange: "bg-warning",
  cyan: "bg-info",
};

const textColorMap: Record<string, string> = {
  blue: "text-brand",
  green: "text-success",
  red: "text-error",
  purple: "text-brand",
  orange: "text-warning",
  cyan: "text-info",
};

const bgColorMap: Record<string, string> = {
  blue: "bg-brand/10",
  green: "bg-success/10",
  red: "bg-error/10",
  purple: "bg-brand/10",
  orange: "bg-warning/10",
  cyan: "bg-info/10",
};

export function CalendarEvent({ event, compact }: CalendarEventProps) {
  const color = event.color ?? "blue";

  if (compact) {
    return (
      <span className="flex items-center gap-1 text-[0.65rem] leading-tight">
        <span className={cn("size-1.5 shrink-0 rounded-full", colorMap[color])} />
        <span className={cn("truncate", textColorMap[color])}>{event.title}</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded px-1 py-0.5 text-[0.65rem] leading-tight",
        bgColorMap[color],
        textColorMap[color],
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", colorMap[color])} />
      <span className="truncate font-medium">{event.title}</span>
      {event.time && <span className="ml-auto shrink-0 opacity-70">{event.time}</span>}
    </div>
  );
}
