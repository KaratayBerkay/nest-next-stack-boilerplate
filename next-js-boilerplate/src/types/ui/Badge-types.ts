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

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant?: Variant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
