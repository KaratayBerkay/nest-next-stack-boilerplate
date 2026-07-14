"use client";

import { cn } from "@/lib/cn";
import type { DialogBodyProps } from "@/types/ui/Dialog-types";

export function DialogBody({ className, ...props }: DialogBodyProps) {
  return (
    <div
      className={cn("min-h-0 flex-1 overflow-y-auto p-6 scroll-fade-y", className)}
      {...props}
    />
  );
}
