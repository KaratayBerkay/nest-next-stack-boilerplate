import type React from "react";

export interface LabelProps extends React.ComponentPropsWithoutRef<"label"> {
  required?: boolean;
}
