"use client";

import type { ClassNameProps } from "@/types/ui/ClassName-types";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";

export function SessionSkeleton({ className }: ClassNameProps) {
  const t = useMessages("settings");
  return (
    <div
      className={cn(
        "text-muted flex items-center justify-center py-12 text-sm",
        className,
      )}
    >
      {t.loadingSessions}
    </div>
  );
}
