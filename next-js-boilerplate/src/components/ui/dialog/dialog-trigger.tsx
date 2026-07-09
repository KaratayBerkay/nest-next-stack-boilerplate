"use client";

import { useDialog } from "./dialog";
import type { DialogTriggerProps } from "@/types/ui/Dialog-types";

export function DialogTrigger({ className, ...props }: DialogTriggerProps) {
  const { onOpenChange } = useDialog();

  return (
    <button
      type="button"
      className={className}
      onClick={() => onOpenChange(true)}
      {...props}
    />
  );
}
