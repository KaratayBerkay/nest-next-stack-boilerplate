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
    // Only a completed upload's server URL is safe to persist — a
    // "pending"/"uploading" file's `.preview` is a local blob: URL that's
    // revoked once ImageUpload unmounts and meaningless to anyone else.
    // Submitting mid-upload (or after a failed one) would otherwise
    // silently corrupt avatarUrl with that ephemeral value; omitting it
    // here just leaves the previously-saved avatar in place.
    const avatarFile = value.avatar[0];
    const avatarUrl =
      avatarFile?.status === "done" ? avatarFile.preview : undefined;
    await deps.updateProfile({
      name: `${value.firstName} ${value.lastName}`.trim(),
      username: value.username || undefined,
      bio: value.bio || undefined,
      avatarUrl: avatarUrl || undefined,
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
