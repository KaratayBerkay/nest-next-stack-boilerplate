import type { ReactNode } from "react";

type Side = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  children: ReactNode;
  delay?: number;
  side?: Side;
}
