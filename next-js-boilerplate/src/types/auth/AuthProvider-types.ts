import type { ReactNode } from "react";
import type { User } from "@/types/auth/User";

export interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}
