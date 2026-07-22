import { blurAsyncCheck } from "@/lib/forms/blur-async-check";
import { TAKEN_EMAILS } from "./profile-constants";

export function createUsernameValidator(
  checkUsername: (v: string) => Promise<boolean>,
  setUsernameAvailable: (v: boolean) => void,
  usernameTakenMessage: string,
) {
  return {
    onBlurAsyncDebounceMs: 150,
    onBlurAsync: async ({ value }: { value: string }) => {
      if (!value) return undefined;
      const available = await checkUsername(value);
      setUsernameAvailable(available);
      return available ? undefined : usernameTakenMessage;
    },
  };
}

export function createEmailValidator(
  emailSchema: { safeParse: (v: string) => { success: boolean } },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateError: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any,
  allMessages: Record<string, unknown>,
) {
  return {
    onBlurAsyncDebounceMs: 300,
    onBlurAsync: async ({ value }: { value: string }) => {
      if (!value || !emailSchema.safeParse(value).success) return undefined;
      if (!TAKEN_EMAILS.has(value.toLowerCase())) return undefined;
      return blurAsyncCheck(value, "profile-email-taken", {
        simulateError,
        toast,
        allMessages,
      });
    },
  };
}
