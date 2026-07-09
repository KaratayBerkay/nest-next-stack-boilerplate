import type React from "react";

type Size = "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends React.ComponentPropsWithoutRef<"div"> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: Size;
}
