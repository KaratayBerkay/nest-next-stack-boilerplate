"use server";

import {
  ServerValidateError,
  createServerValidate,
  initialFormState,
} from "@tanstack/react-form-nextjs";
import { formOptions } from "@tanstack/react-form";
import { inviteSchema } from "@/validators/forms/invite";

const inviteFormOpts = formOptions({
  defaultValues: {
    emails: [] as string[],
    role: "member" as string,
    message: "",
  },
});

const serverValidate = createServerValidate({
  ...inviteFormOpts,
  onServerValidate: ({ value }) => {
    const result = inviteSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues.map((i) => i.message).join(", ");
    }
    return null;
  },
});

export async function inviteAction(prev: unknown, formData: FormData) {
  try {
    const emailsRaw = formData.get("emails");
    const emails: string[] = emailsRaw ? JSON.parse(emailsRaw as string) : [];
    const role = formData.get("role") as string;
    const message = formData.get("message") as string;
    const merged = new FormData();
    merged.set("role", role ?? "member");
    merged.set("message", message ?? "");
    emails.forEach((email: string) => merged.append("emails", email));
    await serverValidate(merged);
    return initialFormState;
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState;
    }
    throw e;
  }
}
