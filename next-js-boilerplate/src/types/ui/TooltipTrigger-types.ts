import type React from "react";

export interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<"span"> {
  asChild?: boolean;
  children: React.ReactNode;
}
