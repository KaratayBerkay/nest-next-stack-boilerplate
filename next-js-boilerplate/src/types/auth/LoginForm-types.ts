import type { MfaMethod } from "@/api/server/auth/login";

export interface MfaState {
  mfaToken: string;
  mfaMethod: MfaMethod;
  /** The email typed into the credentials form — the challenge response
   *  itself carries no account data before the second factor. */
  email: string;
}
