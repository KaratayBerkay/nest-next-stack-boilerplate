"use server";

import {
  ServerValidateError,
  createServerValidate,
  initialFormState,
} from "@tanstack/react-form-nextjs";
import { z } from "zod";
import { signupFormOpts } from "@/lib/forms/signup-options";

const signupSchema = z.object({
  name: z.string().min(1, "Server: Name is required"),
  email: z.string().email("Server: Invalid email"),
  age: z.number().min(18, "Server: Must be 18 or older"),
});

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
