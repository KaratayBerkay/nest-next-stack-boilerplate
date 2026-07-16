import type React from "react";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "soft";

export type BadgeVariant = Variant;

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant?: Variant;
  pill?: boolean;
  dot?: boolean;
  size?: BadgeSize;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
