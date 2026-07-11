import type React from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Variant = "default" | "brand" | "success" | "warning" | "error" | "info";
type Status = "online" | "away";

export interface AvatarProps extends React.ComponentPropsWithoutRef<"div"> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: Size;
  variant?: Variant;
  status?: Status;
}
