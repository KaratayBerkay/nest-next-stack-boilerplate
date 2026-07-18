"use server";

import {
  ServerValidateError,
  createServerValidate,
  initialFormState,
} from "@tanstack/react-form-nextjs";
import { signupFormOpts } from "@/lib/forms/signup-options";
import { signupSchema } from "@/validators/auth/signup-schema";

const serverValidate = createServerValidate({
  ...signupFormOpts,
  onServerValidate: ({ value }) => {
    const result = signupSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues.map((i) => i.message).join(", ");
    }
  },
});

export async function signupAction(prev: unknown, formData: FormData) {
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
