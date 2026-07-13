import type React from "react";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  error?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
