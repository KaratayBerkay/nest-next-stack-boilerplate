"use client";

import { formOptions } from "@tanstack/react-form";

export const RESERVED_WORDS = new Set([
  "admin",
  "root",
  "superuser",
  "test",
  "demo",
]);

export async function checkReservedWord(
  value: string,
  reservedWordSuffix: string,
): Promise<string | undefined> {
  if (!value) return undefined;
  await new Promise((r) => setTimeout(r, 400));
  if (RESERVED_WORDS.has(value.toLowerCase())) {
    return `"${value}" ${reservedWordSuffix}`;
  }
  return undefined;
}

export function getRoleOptions(labels: {
  roleAdmin: string;
  roleEditor: string;
  roleViewer: string;
}) {
  return [
    { value: "admin", label: labels.roleAdmin },
    { value: "editor", label: labels.roleEditor },
    { value: "viewer", label: labels.roleViewer },
  ];
}

export const validationFormOpts = formOptions({
  defaultValues: { name: "", email: "", role: "" },
});
