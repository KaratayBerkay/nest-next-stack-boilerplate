export interface CheckboxFieldOption {
  value: string;
  label: string;
}

export interface CheckboxFieldProps {
  label?: string;
  required?: boolean;
  options: CheckboxFieldOption[];
}
