import type React from "react";

export interface AvatarProps extends React.ComponentPropsWithoutRef<"div"> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: AvatarVariant;
  status?: "online" | "away";
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type AvatarVariant = "default" | "brand" | "success" | "warning" | "error" | "info" | "shiny" | "glass" | "neon" | "gradient";

export interface AvatarGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  max?: number;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
