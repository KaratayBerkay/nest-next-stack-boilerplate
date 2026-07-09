export interface DateInputProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}
