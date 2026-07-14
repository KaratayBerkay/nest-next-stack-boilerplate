export interface CounterProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  variant?: string;
  className?: string;
}
