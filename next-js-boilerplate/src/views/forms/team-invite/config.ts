import { formOptions } from "@tanstack/react-form";
import type { ExceptionResponse } from "@/lib/api-client";
import { getSurface } from "@/lib/exception-handler";
import { inviteDefaultValues } from "@/validators/forms/invite-inits";
import type { useToast } from "@/components/ui/Toast";

export const STEPS = ["Emails", "Role", "Message", "Review"];

export const teamFormOpts = formOptions({
  defaultValues: inviteDefaultValues,
});

export async function submitTeamInvite(
  { value }: { value: typeof teamFormOpts.defaultValues },
  deps: {
    simulateError: (scenarioId: string) => Promise<ExceptionResponse>;
    toast: ReturnType<typeof useToast>["toast"];
    allMessages: Record<string, unknown>;
    setQuotaExceeded: (v: boolean) => void;
    unknownError: string;
  },
) {
  if (value.emails.length > 5) {
    try {
      await deps.simulateError("invite-quota");
    } catch (err) {
      const exc = (err as { exception?: ExceptionResponse }).exception;
      if (exc && getSurface(exc.exc) === "full-page") {
        deps.setQuotaExceeded(true);
        return null;
      }
    }
  }
  return null;
}
