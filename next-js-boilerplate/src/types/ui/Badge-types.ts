import type React from "react";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "soft"
  | "dot"
  | "pill";

export type BadgeVariant = Variant;

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant?: Variant;
  size?: BadgeSize;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
