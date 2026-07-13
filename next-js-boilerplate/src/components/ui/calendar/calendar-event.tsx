import { cn } from "@/lib/cn";
import type { CalendarEventProps } from "@/types/ui/CalendarEvent-types";

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  cyan: "bg-cyan-500",
};

const textColorMap: Record<string, string> = {
  blue: "text-blue-700 dark:text-blue-300",
  green: "text-green-700 dark:text-green-300",
  red: "text-red-700 dark:text-red-300",
  purple: "text-purple-700 dark:text-purple-300",
  orange: "text-orange-700 dark:text-orange-300",
  cyan: "text-cyan-700 dark:text-cyan-300",
};

const bgColorMap: Record<string, string> = {
  blue: "bg-blue-50 dark:bg-blue-950/30",
  green: "bg-green-50 dark:bg-green-950/30",
  red: "bg-red-50 dark:bg-red-950/30",
  purple: "bg-purple-50 dark:bg-purple-950/30",
  orange: "bg-orange-50 dark:bg-orange-950/30",
  cyan: "bg-cyan-50 dark:bg-cyan-950/30",
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
