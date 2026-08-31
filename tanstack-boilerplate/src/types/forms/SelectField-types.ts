export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectFieldOption[];
}
