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
    await serverValidate(formData);
    return initialFormState;
  } catch (e) {
    if (e instanceof ServerValidateError) {
      return e.formState;
    }
    throw e;
  }
}
