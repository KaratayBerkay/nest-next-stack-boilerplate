export interface ComboboxProps {
  /** `group` is optional — when any option sets it, the list renders as
   * headed sections (in first-seen order) instead of one flat list. */
  options: { value: string; label: string; group?: string }[];
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

export type ComboboxVariant =
  | "default"
  | "shiny"
  | "glass"
  | "neon"
  | "gradient";
