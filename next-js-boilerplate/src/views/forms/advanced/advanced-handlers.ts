import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";
import { advancedFormOpts } from "@/validators/forms/advanced-inits";

// "taken@example.com" is the designated trigger for the email-conflict demo
// path — any other address succeeds, mirroring checkout's "00000" postal
// code and billing's "EXPIRED10" coupon convention.
const TAKEN_EMAIL = "taken@example.com";

export async function handleAdvancedSubmit(
  { value }: { value: typeof advancedFormOpts.defaultValues },
  deps: {
    simulateError: (
      id: string,
      opts?: { failRate?: number },
    ) => Promise<ExceptionResponse>;
    allMessages: Record<string, unknown>;
    toast: { toast: (opts: { description: string; variant: string }) => void };
    unknownError: string;
    formErrors: string;
    saveSuccess: string;
  },
) {
  try {
    await deps.simulateError("auth-email-taken", {
      failRate: value.email.toLowerCase() === TAKEN_EMAIL ? 1 : 0,
    });
    deps.toast.toast({ description: deps.saveSuccess, variant: "default" });
    return null;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return { form: deps.unknownError, fields: {} };

    const { form: formError, fields } = exceptionToFormErrors(
      exc,
      deps.allMessages,
    );

    if (formError) return { form: formError, fields };

    return { form: deps.formErrors, fields };
  }
}
