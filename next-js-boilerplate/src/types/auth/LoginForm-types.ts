import type { MfaMethod } from "@/api/server/auth/login";
import type { User } from "@/types/auth/User";

export interface MfaState {
  mfaToken: string;
  mfaMethod: MfaMethod;
  user: User;
}
