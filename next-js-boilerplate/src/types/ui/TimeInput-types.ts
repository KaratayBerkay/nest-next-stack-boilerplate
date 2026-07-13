export type TimeInputVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export interface TimeInputProps {
  value?: { hours: number; minutes: number; seconds?: number };
  onChange?: (time: { hours: number; minutes: number; seconds?: number }) => void;
  variant?: TimeInputVariant;
  showSeconds?: boolean;
  use24Hour?: boolean;
  className?: string;
  disabled?: boolean;
  label?: string;
}
