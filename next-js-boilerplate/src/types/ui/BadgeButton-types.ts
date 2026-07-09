import type React from "react";

type Variant = "default" | "secondary" | "outline" | "destructive" | "success";

export interface BadgeButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
}
