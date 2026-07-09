import type React from "react";

export interface SwitchProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "children"
> {
  label?: string;
}
