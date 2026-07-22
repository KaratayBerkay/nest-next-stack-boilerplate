import { useToast } from "@/components/ui/Toast";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";
import type { profileFormOpts } from "./profile-constants";

export async function submitProfile(
  { value }: { value: typeof profileFormOpts.defaultValues },
  deps: {
    updateProfile: (data: {
      name: string;
      username?: string;
      bio?: string;
      avatarUrl?: string;
    }) => Promise<void>;
    toast: ReturnType<typeof useToast>["toast"];
    messages: Record<string, unknown>;
    unknownError: string;
    saveSuccess: string;
  },
) {
  try {
    await deps.updateProfile({
      name: `${value.firstName} ${value.lastName}`.trim(),
      username: value.username || undefined,
      bio: value.bio || undefined,
      avatarUrl: value.avatar[0]?.preview || undefined,
    });
    deps.toast({ description: deps.saveSuccess, variant: "default" });
    return null;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return { form: deps.unknownError, fields: {} };
    if (getSurface(exc.exc) === "toast") {
      deps.toast({
        description: exceptionHandler(exc, deps.messages),
        variant: "destructive",
      });
      return null;
    }
    return exceptionToFormErrors(exc, deps.messages);
  }
}
