"use server";

// Demo-only: the forms-gallery `Form.tsx` is this action's sole caller. It
// used to live in features/auth/actions/, where it read as the real
// registration path (FE-002) — real sign-up is RegisterForm → useAuth()
// .register() → registerServer().
import {
  ServerValidateError,
  createServerValidate,
  initialFormState,
} from "@tanstack/react-form-nextjs";
import { signupFormOpts } from "./signup-options";
import { signupSchema } from "@/validators/demos/signup-schema";

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
