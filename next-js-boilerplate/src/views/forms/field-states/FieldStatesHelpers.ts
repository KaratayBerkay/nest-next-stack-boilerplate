"use client";

import { formOptions } from "@tanstack/react-form";

export const RESERVED_WORDS = new Set([
  "admin", "root", "superuser", "test", "demo",
]);

export async function checkReservedWord(value: string): Promise<string | undefined> {
  if (!value) return undefined;
  await new Promise((r) => setTimeout(r, 400));
  if (RESERVED_WORDS.has(value.toLowerCase())) {
    return `"${value}" is a reserved word`;
  }
  return undefined;
}

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

export const validationFormOpts = formOptions({
  defaultValues: { name: "", email: "", role: "" },
});
