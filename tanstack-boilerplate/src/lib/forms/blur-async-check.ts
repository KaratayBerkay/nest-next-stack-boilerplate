import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";

interface BlurAsyncDeps {
  simulateError: (
    scenarioId: string,
    opts?: { delayMs?: number },
  ) => Promise<ExceptionResponse>;
  toast: (opts: {
    description: string;
    variant?: "destructive" | "default";
  }) => void;
  allMessages: Record<string, unknown>;
}

export async function blurAsyncCheck(
  value: string,
  scenarioId: string,
  deps: BlurAsyncDeps,
): Promise<string | undefined> {
  try {
    await deps.simulateError(scenarioId);
    return undefined;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return undefined;
    if (getSurface(exc.exc) === "toast") {
      deps.toast({
        description: exceptionHandler(exc, deps.allMessages),
        variant: "destructive",
      });
      return undefined;
    }
    const result = exceptionToFormErrors(exc, deps.allMessages);
    return Object.values(result.fields)[0];
  }
}
