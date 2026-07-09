import type React from "react";

export interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  error?: string;
}
