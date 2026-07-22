import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";
import { advancedFormOpts } from "@/validators/forms/advanced-inits";

export async function handleAdvancedSubmit(
  { value: _value }: { value: typeof advancedFormOpts.defaultValues },
  deps: {
    simulateError: (id: string) => Promise<ExceptionResponse>;
    allMessages: Record<string, unknown>;
    toast: { toast: (opts: { description: string; variant: string }) => void };
    unknownError: string;
    formErrors: string;
    saveSuccess: string;
  },
) {
  try {
    await deps.simulateError("email-taken");
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
