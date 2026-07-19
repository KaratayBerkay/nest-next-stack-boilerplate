export interface RadioGroupFieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupFieldProps {
  label?: string;
  required?: boolean;
  options: RadioGroupFieldOption[];
}
