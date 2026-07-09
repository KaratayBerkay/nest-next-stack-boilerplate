"use client";

import { useDialog } from "./dialog";
import type { DialogCloseProps } from "@/types/ui/Dialog-types";

export function DialogClose({ className, ...props }: DialogCloseProps) {
  const { onOpenChange } = useDialog();

  return (
    <button
      type="button"
      className={className}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}
