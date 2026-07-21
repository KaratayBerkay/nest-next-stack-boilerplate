import type { ReactNode } from "react";

export interface LayoutCardProps {
  label: string;
  description?: string;
  fullWidth?: boolean;
  children: ReactNode;
}
