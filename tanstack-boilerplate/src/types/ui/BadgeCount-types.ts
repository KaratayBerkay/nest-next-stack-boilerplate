import type React from "react";

export type BadgeCountDirection =
  | "left-top"
  | "left-bottom"
  | "right-top"
  | "right-bottom"
  | "middle-top"
  | "middle-bottom";

export type BadgeCountRule = "positive" | "negative" | "string" | "icon";

export interface BadgeCountProps extends React.ComponentPropsWithoutRef<"span"> {
  direction?: BadgeCountDirection;
  count: number | string;
  rule?: BadgeCountRule;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  children: React.ReactNode;
}
