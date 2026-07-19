export interface ComboboxFieldOption {
  value: string;
  label: string;
  group?: string;
}

export interface ComboboxFieldProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: ComboboxFieldOption[];
  multiple?: boolean;
}
