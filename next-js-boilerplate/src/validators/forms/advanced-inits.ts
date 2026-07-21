import { formOptions } from "@tanstack/react-form";

export type AccountType = "personal" | "business";

export const advancedDefaultValues = {
  accountType: "personal" as AccountType,
  fullName: "",
  email: "",
  password: "",
  companyName: "",
  taxId: "",
  industry: "",
  members: [] as Array<{ name: string; email: string; role: string }>,
};

export const advancedFormOpts = formOptions({
  defaultValues: advancedDefaultValues,
});
