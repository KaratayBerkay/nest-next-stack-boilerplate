import type React from "react";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  error?: string;
}
