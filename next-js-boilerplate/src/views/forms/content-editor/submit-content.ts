import { formOptions } from "@tanstack/react-form";
import { editorDefaultValues } from "@/validators/forms/editor-inits";
import { exceptionHandler } from "@/lib/exception-handler";
import type { ExceptionResponse } from "@/lib/api-client";

export const editorFormOpts = formOptions({
  defaultValues: editorDefaultValues,
});

export async function submitContent(
  { value }: { value: typeof editorFormOpts.defaultValues },
  deps: {
    simulateError: (
      id: string,
      opts?: { failRate?: number; delayMs?: number },
    ) => Promise<ExceptionResponse>;
    scheduleDateRequired: string;
    failRate: number;
    intent: "publish" | "schedule";
    unknownError: string;
  },
) {
  if (deps.intent === "schedule" && !value.publishAt) {
    return { form: deps.scheduleDateRequired, fields: {} };
  }
  try {
    await deps.simulateError("internal-error", {
      failRate: deps.failRate,
      delayMs: 600,
    });
    return null;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (exc) return { form: exceptionHandler(exc, {}), fields: {} };
    return { form: deps.unknownError, fields: {} };
  }
}
