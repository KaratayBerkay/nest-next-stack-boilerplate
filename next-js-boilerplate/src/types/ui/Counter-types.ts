import type { GlobalVariant } from "@/components/ui/global-style-variants";

export interface CounterProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  variant?: GlobalVariant;
  className?: string;
}
