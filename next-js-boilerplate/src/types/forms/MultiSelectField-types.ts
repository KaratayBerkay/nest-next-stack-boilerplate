export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectFieldProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: MultiSelectOption[];
}
