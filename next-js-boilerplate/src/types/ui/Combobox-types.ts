import type React from "react";

export interface ComboboxProps {
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  variant?: ComboboxVariant;
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type ComboboxVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
