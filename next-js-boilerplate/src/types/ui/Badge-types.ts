import type React from "react";

type Variant = "default" | "secondary" | "outline" | "destructive" | "success";

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant?: Variant;
}
