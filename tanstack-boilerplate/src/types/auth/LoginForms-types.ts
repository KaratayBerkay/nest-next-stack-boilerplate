import type { Dispatch, SetStateAction } from "react";
import type { MfaState } from "@/types/auth/LoginForm-types";

export interface LoginCredentialsFormProps {
  login: (email: string, password: string) => Promise<void>;
  onMfaRequired: Dispatch<SetStateAction<MfaState | null>>;
}

export interface MfaChallengeFormProps {
  mfaState: MfaState;
  verifyMfa: (mfaToken: string, code: string) => Promise<void>;
  setMfaState: Dispatch<SetStateAction<MfaState | null>>;
  onBackToCredentials: () => void;
}
