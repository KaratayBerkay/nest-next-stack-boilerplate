export interface BuilderField {
  id: string;
  type: "text" | "select" | "checkbox" | "date";
  label: string;
  name: string;
  required: boolean;
  options: string[];
}

export function getFieldTypes(
  t: Record<string, string>,
): { value: BuilderField["type"]; label: string }[] {
  return [
    { value: "text", label: t.text },
    { value: "select", label: t.select },
    { value: "checkbox", label: t.checkbox },
    { value: "date", label: t.date },
  ];
}
