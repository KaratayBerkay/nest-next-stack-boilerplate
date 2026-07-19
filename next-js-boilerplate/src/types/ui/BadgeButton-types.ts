import type React from "react";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "error"
  | "success";

export interface BadgeButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
}
