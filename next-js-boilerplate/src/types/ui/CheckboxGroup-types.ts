interface CheckboxGroupItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  values: string[];
  onValueChange: (values: string[]) => void;
  items: CheckboxGroupItem[];
  label?: string;
  showSelectAll?: boolean;
  className?: string;
  direction?: "vertical" | "horizontal";
}
