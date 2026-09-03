// Ported from the Next.js server action: the "use server" RPC becomes a
// TanStack Start server function. `signupAction` keeps its
// (prev, formData) => state signature so it still plugs into useActionState.
//
// Demo-only: the forms-gallery `Form.tsx` is this action's sole caller. It
// used to live in features/auth/actions/, where it read as the real
// registration path (FE-002) — real sign-up is RegisterForm → useAuth()
// .register() → registerServer().

import {
  ServerValidateError,
  createServerValidate,
  initialFormState,
} from "@tanstack/react-form-start";
import { createServerFn } from "@tanstack/react-start";
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

const validateSignup = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      await serverValidate(data);
      return initialFormState;
    } catch (e) {
      if (e instanceof ServerValidateError) {
        return e.formState;
      }
      throw e;
    }
  });

export async function signupAction(_prev: unknown, formData: FormData) {
  return validateSignup({ data: formData });
}
