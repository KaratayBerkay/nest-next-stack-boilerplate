import type React from "react";

export interface TabsContentProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "value"
> {
  value: string;
}
