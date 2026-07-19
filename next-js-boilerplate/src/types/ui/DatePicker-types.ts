export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  variant?: DatePickerVariant;
  error?: string;
  description?: string;
  picker?: "day" | "month" | "year";
  captionLayout?: "dropdown" | "label" | "dropdown-months" | "dropdown-years";
  startMonth?: Date;
  endMonth?: Date;
}

export type DatePickerVariant =
  | "default"
  | "shiny"
  | "glass"
  | "neon"
  | "gradient";
