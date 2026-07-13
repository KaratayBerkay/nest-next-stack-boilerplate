import type React from "react";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type DatePickerVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
