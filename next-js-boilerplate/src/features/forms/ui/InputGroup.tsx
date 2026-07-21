"use client";

import { cn } from "@/lib/cn";
import type {
  InputGroupProps,
  InputGroupPartProps,
} from "@/types/forms/InputGroup-types";

function Prefix({ children, className }: InputGroupPartProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/30 text-muted flex items-center rounded-l-md border border-r-0 px-3 text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Suffix({ children, className }: InputGroupPartProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/30 text-muted flex items-center rounded-r-md border border-l-0 px-3 text-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function InputGroup({ children, className }: InputGroupProps) {
  return <div className={cn("flex items-stretch", className)}>{children}</div>;
}

InputGroup.Prefix = Prefix;
InputGroup.Suffix = Suffix;
