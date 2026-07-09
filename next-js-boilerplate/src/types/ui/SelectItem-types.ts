import type React from "react";

export interface SelectItemProps extends React.ComponentPropsWithoutRef<"button"> {
  value: string;
}
