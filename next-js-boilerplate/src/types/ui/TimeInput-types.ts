export type TimeInputVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export interface TimeUnitSelectProps {
  value: number;
  max: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  selectClassName?: string;
  use24Hour?: boolean;
  isHour?: boolean;
  describedBy?: string;
  ariaLabel: string;
}

export interface TimeInputProps {
  value?: { hours: number; minutes: number; seconds?: number };
  onChange?: (time: { hours: number; minutes: number; seconds?: number }) => void;
  variant?: TimeInputVariant;
  showSeconds?: boolean;
  use24Hour?: boolean;
  className?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  description?: string;
}
