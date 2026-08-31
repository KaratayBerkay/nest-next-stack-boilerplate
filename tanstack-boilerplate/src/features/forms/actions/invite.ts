// Ported from the Next.js server action: the "use server" RPC becomes a
// TanStack Start server function. `inviteAction` keeps its
// (prev, formData) => state signature so it still plugs into useActionState.

import {
  ServerValidateError,
  createServerValidate,
  initialFormState,
} from "@tanstack/react-form-start";
import { createServerFn } from "@tanstack/react-start";
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

const validateInvite = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const emailsRaw = data.get("emails");
      const emails: string[] = emailsRaw ? JSON.parse(emailsRaw as string) : [];
      const role = data.get("role") as string;
      const message = data.get("message") as string;
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
  });

export async function inviteAction(_prev: unknown, formData: FormData) {
  return validateInvite({ data: formData });
}
