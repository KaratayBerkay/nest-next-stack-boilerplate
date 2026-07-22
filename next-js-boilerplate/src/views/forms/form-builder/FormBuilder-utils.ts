import type { BuilderField } from "@/types/forms/BuilderField-types";

const RESERVED_NAMES = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "id",
  "form",
]);
const NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]{0,30}$/;

export function sanitizeFieldName(label: string): string {
  let name = label.replace(/[^a-zA-Z0-9]/g, "").replace(/^(\d)/, "_$1");
  if (!name || RESERVED_NAMES.has(name) || !NAME_REGEX.test(name)) {
    name = `field_${Math.random().toString(36).slice(2, 8)}`;
  }
  return name;
}

let nextFieldId = 5;

export function getNextFieldId(): string {
  return String(nextFieldId++);
}

export const INITIAL_FIELDS: BuilderField[] = [
  {
    id: "1",
    type: "text",
    label: "Full Name",
    name: "fullName",
    required: true,
    options: [],
  },
  {
    id: "2",
    type: "select",
    label: "Country",
    name: "country",
    required: true,
    options: ["US", "Canada", "UK"],
  },
  {
    id: "3",
    type: "checkbox",
    label: "Newsletter",
    name: "newsletter",
    required: false,
    options: [],
  },
  {
    id: "4",
    type: "date",
    label: "Birth Date",
    name: "birthDate",
    required: false,
    options: [],
  },
];
