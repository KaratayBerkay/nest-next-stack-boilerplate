export interface BuilderField {
  id: string;
  type: "text" | "select" | "checkbox" | "date";
  label: string;
  name: string;
  required: boolean;
  options: string[];
}

export const FIELD_TYPES: { value: BuilderField["type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
];
