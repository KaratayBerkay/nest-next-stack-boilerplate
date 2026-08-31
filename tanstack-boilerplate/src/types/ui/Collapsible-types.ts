import type React from "react";

export interface CollapsibleProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<"button">;

export interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}
