import type React from "react";

export interface TabsTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value"
> {
  value: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
