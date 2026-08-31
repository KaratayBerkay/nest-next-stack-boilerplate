import type React from "react";

export interface AutoResizeTextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  error?: string;
  maxHeight?: number;
}
