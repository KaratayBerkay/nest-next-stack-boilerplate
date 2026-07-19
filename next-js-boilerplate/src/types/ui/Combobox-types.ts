import type React from "react";

export interface ComboboxProps {
  options: { value: string; label: string }[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  disabled?: boolean;
  variant?: ComboboxVariant;
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  error?: string;
  description?: string;
}

export type ComboboxVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
