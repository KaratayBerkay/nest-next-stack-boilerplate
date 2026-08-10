export interface DateRangeValue {
  from?: Date;
  to?: Date;
}

export interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange?: (range: DateRangeValue | undefined) => void;
  placeholder?: string;
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  variant?: DateRangePickerVariant;
  error?: string;
  description?: string;
  startMonth?: Date;
  endMonth?: Date;
}

export type DateRangePickerVariant =
  | "default"
  | "shiny"
  | "glass"
  | "neon"
  | "gradient";
