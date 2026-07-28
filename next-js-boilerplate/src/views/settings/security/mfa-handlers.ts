import type { Dispatch, SetStateAction } from "react";
import type { EnrollMfaResult, VerifyMfaResult } from "@/api/server/auth/mfa";

type Step = "idle" | "qr-code" | "verify" | "backup-codes";
type EnrollFn = () => Promise<EnrollMfaResult>;
type VerifyFn = (code: string) => Promise<VerifyMfaResult>;
type DisableFn = (code: string) => Promise<{ success: boolean }>;

export async function handleEnroll(
  enrollMfa: EnrollFn,
  setEnrollData: Dispatch<SetStateAction<EnrollMfaResult | null>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setStep: Dispatch<SetStateAction<Step>>,
) {
  try {
    setError(null);
    const data = await enrollMfa();
    setEnrollData(data);
    setStep("qr-code");
  } catch {
    setError("Failed to start MFA enrollment");
  }
}

export async function handleVerify(
  code: string,
  verifyMfaEnrollment: VerifyFn,
  setVerifyData: Dispatch<SetStateAction<VerifyMfaResult | null>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setStep: Dispatch<SetStateAction<Step>>,
) {
  try {
    setError(null);
    const data = await verifyMfaEnrollment(code);
    setVerifyData(data);
    setStep("backup-codes");
  } catch {
    setError("Failed to verify code");
  }
}

export async function handleDisable(
  code: string,
  disableMfa: DisableFn,
  onSuccess: () => void,
  setError: Dispatch<SetStateAction<string | null>>,
) {
  try {
    setError(null);
    await disableMfa(code);
    onSuccess();
  } catch {
    setError("Failed to disable two-factor authentication");
  }
}
