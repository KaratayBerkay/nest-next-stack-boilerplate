import type React from "react";

export interface IndeterminateCheckboxProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "children"
> {
  indeterminate?: boolean;
  label?: string;
}
