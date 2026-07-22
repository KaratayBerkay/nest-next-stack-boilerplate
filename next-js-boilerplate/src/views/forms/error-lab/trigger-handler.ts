import { useToast } from "@/components/ui/Toast";
import { ERROR_SCENARIOS } from "@/lib/forms/error-scenarios";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";
import type { ClientException } from "@/lib/exception-handler";

export const GROUPS = [
  { label: "Toast surface", surface: "toast" as const },
  { label: "Form-field surface", surface: "form-field" as const },
  { label: "Full-page surface", surface: "full-page" as const },
  { label: "Badge surface", surface: "badge" as const },
];

export const NETWORK_OPTIONS = [
  { value: "instant", label: "Instant" },
  { value: "delayed", label: "Delayed (800ms)" },
  { value: "timeout", label: "Timeout (5s)" },
  { value: "offline", label: "Offline" },
  { value: "random", label: "Random (30% fail)" },
];

type TriggerDeps = {
  selectedScenario: string;
  locale: string;
  network: string;
  simulateError: (
    id: string,
    opts?: { delayMs?: number; failRate?: number },
  ) => Promise<ExceptionResponse>;
  toast: ReturnType<typeof useToast>["toast"];
  allMessages: Record<string, unknown>;
  errorMessagesByLocale: Record<string, Record<string, unknown>>;
  setResult: React.Dispatch<
    React.SetStateAction<ExceptionResponse | ClientException | null>
  >;
  setFormError: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export async function handleTriggerErrorLab(deps: TriggerDeps) {
  deps.setResult(null);
  deps.setFormError(null);

  if (deps.network === "offline") {
    const { clientException } = await import("@/lib/exception-handler");
    const exc = clientException(
      "EX_WS_UNSTABLE",
      "You are offline",
      "forms.errors.connectionUnstable",
    );
    deps.setResult(exc);
    const surface = getSurface(exc.exc);
    if (surface === "toast") {
      deps.toast({
        description: exceptionHandler(exc, deps.allMessages),
        variant: "destructive",
      });
    } else if (surface === "form-field") {
      const t = deps.errorMessagesByLocale[deps.locale];
      deps.setFormError(exceptionHandler(exc, t));
    }
    return;
  }

  if (deps.network === "timeout") {
    deps.setLoading(true);
    try {
      const timeoutId = setTimeout(() => {}, 5000);
      await deps.simulateError(deps.selectedScenario, { delayMs: 6000 });
      clearTimeout(timeoutId);
    } catch {
      const { clientException } = await import("@/lib/exception-handler");
      const exc = clientException(
        "EX_INTERNAL",
        "Request timed out",
        "forms.errors.unknown",
      );
      deps.setResult(exc);
      deps.toast({ description: "Request timed out", variant: "destructive" });
    } finally {
      deps.setLoading(false);
    }
    return;
  }

  deps.setLoading(true);
  try {
    const parsed = ERROR_SCENARIOS.find((s) => s.id === deps.selectedScenario)!;
    const delayMs = deps.network === "delayed" ? 800 : 0;
    const failRate = deps.network === "random" ? 0.3 : 1;
    const res = await deps.simulateError(parsed.id, { delayMs, failRate });
    deps.setResult(res);
    const surface = getSurface(res.exc);
    const t = deps.errorMessagesByLocale[deps.locale] ?? deps.allMessages;
    if (surface === "toast") {
      deps.toast({
        description: exceptionHandler(res, t),
        variant: "destructive",
      });
    } else if (surface === "form-field") {
      const { form } = exceptionToFormErrors(res, t);
      deps.setFormError(form);
    } else {
      deps.setFormError(exceptionHandler(res, t));
    }
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (exc) {
      deps.setResult(exc);
      const t = deps.errorMessagesByLocale[deps.locale] ?? deps.allMessages;
      deps.toast({
        description: exceptionHandler(exc, t),
        variant: "destructive",
      });
    }
  } finally {
    deps.setLoading(false);
  }
}
